import numpy as np
import pandas as pd
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

from .demand_correction import detect_stockouts, estimate_true_demand


def _create_features(df: pd.DataFrame) -> pd.DataFrame:
    """Engineer time-series features for XGBoost.

    Includes returns, stockout flags, and corrected demand signals
    so the model learns true demand patterns rather than censored sales.
    """
    df = df.copy()
    if not pd.api.types.is_datetime64_any_dtype(df["date"]):
        df["date"] = pd.to_datetime(df["date"])
    df["day_of_week"] = df["date"].dt.dayofweek
    df["day_of_year"] = df["date"].dt.dayofyear
    df["month"] = df["date"].dt.month
    df["week_of_year"] = df["date"].dt.isocalendar().week.astype(int)
    df["is_weekend"] = df["day_of_week"].isin([4, 5, 6]).astype(int)

    for lag in [1, 2, 3, 7, 14, 28]:
        df[f"lag_{lag}"] = df["units_sold"].shift(lag)

    for window in [7, 14, 30]:
        df[f"rolling_mean_{window}"] = df["units_sold"].shift(1).rolling(window).mean()
        df[f"rolling_std_{window}"] = df["units_sold"].shift(1).rolling(window).std()
        df[f"rolling_min_{window}"] = df["units_sold"].shift(1).rolling(window).min()
        df[f"rolling_max_{window}"] = df["units_sold"].shift(1).rolling(window).max()

    df["expanding_mean"] = df["units_sold"].shift(1).expanding().mean()

    df["trend_idx"] = range(len(df))

    if "units_returned" in df.columns:
        df["returns_lag_1"] = df["units_returned"].shift(1)
        df["returns_lag_7"] = df["units_returned"].shift(7)
        df["rolling_returns_7"] = df["units_returned"].shift(1).rolling(7).mean()
        df["rolling_returns_14"] = df["units_returned"].shift(1).rolling(14).mean()
        df["net_demand"] = df["units_sold"] - df["units_returned"].fillna(0)
        df["net_demand_lag_1"] = df["net_demand"].shift(1)
        df["net_demand_rolling_7"] = df["net_demand"].shift(1).rolling(7).mean()

    if "closing_stock" in df.columns:
        prev_stock = df["closing_stock"].shift(1).ffill()
        df["was_stockout"] = (prev_stock == 0).astype(int)
        df["stockout_streak"] = (
            df["was_stockout"]
            .groupby((df["was_stockout"] != df["was_stockout"].shift()).cumsum())
            .cumsum()
        )
        df["rolling_returns_30"] = df.get("units_returned", pd.Series(0, index=df.index)).shift(1).rolling(30).mean()

    return df


def train_xgboost(train_df: pd.DataFrame) -> dict:
    """XGBoost model with returns, stockout correction, and engineered features.

    The target is demand-censored-corrected: during stockout periods where
    observed sales underrepresent true demand, we substitute a rolling median
    of non-zero sales.
    """
    use_cols = ["date", "units_sold"]
    if "units_returned" in train_df.columns:
        use_cols.append("units_returned")
    if "closing_stock" in train_df.columns:
        use_cols.append("closing_stock")
    df = train_df[use_cols].copy()

    corrected = estimate_true_demand(df)
    df["units_sold_corrected"] = corrected.values
    df["units_sold_raw"] = df["units_sold"].values
    df["units_sold"] = df["units_sold_corrected"]

    df = _create_features(df)
    df = df.dropna()

    feature_cols = [c for c in df.columns if c not in ["date", "units_sold", "units_sold_raw", "units_sold_corrected"]]
    X = df[feature_cols].values
    y = df["units_sold"].values

    split = int(len(X) * 0.85)
    X_train, X_val = X[:split], X[split:]
    y_train, y_val = y[:split], y[split:]

    model = XGBRegressor(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbosity=0,
    )
    model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)

    val_pred = model.predict(X_val)
    val_pred = np.maximum(0, val_pred)
    rmse = float(np.sqrt(mean_squared_error(y_val, val_pred)))
    mae = float(mean_absolute_error(y_val, val_pred))

    feature_importance = dict(zip(feature_cols, model.feature_importances_))
    top_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:10]

    return {
        "type": "xgboost",
        "model": model,
        "feature_cols": feature_cols,
        "rmse": round(rmse, 2),
        "mae": round(mae, 2),
        "n_observations": len(df),
        "top_features": [{"name": k, "importance": round(float(v), 4)} for k, v in top_features],
    }


def predict_xgboost(model: dict, train_df: pd.DataFrame, steps: int) -> dict:
    """Iterative multi-step forecast using XGBoost.

    Uses rolling estimates for returns and stockout flags during
    the forecast horizon since future returns aren't known.
    """
    use_cols = ["date", "units_sold"]
    if "units_returned" in train_df.columns:
        use_cols.append("units_returned")
    if "closing_stock" in train_df.columns:
        use_cols.append("closing_stock")
    full_df = train_df[use_cols].copy()
    if not pd.api.types.is_datetime64_any_dtype(full_df["date"]):
        full_df["date"] = pd.to_datetime(full_df["date"])

    avg_return_rate = full_df["units_returned"].mean() if "units_returned" in full_df.columns else 0
    avg_return_7 = full_df["units_returned"].tail(7).mean() if "units_returned" in full_df.columns else 0

    predictions = []
    for step in range(steps):
        extended = full_df.copy()
        future_date = pd.Timestamp(full_df["date"].max()) + pd.Timedelta(days=step + 1)
        est_returns = round(avg_return_7 if step < 7 else avg_return_rate)
        new_row = pd.DataFrame({
            "date": [future_date],
            "units_sold": [0],
            "units_returned": [est_returns],
            "closing_stock": [max(0, full_df["closing_stock"].iloc[-1] - int(full_df["units_sold"].iloc[-1]) + est_returns)] if "closing_stock" in full_df.columns else [0],
        })
        extended = pd.concat([extended, new_row], ignore_index=True)

        featured = _create_features(extended)
        last_row = featured.iloc[[-1]]

        X_pred = last_row[model["feature_cols"]].values
        pred = max(0, float(model["model"].predict(X_pred)[0]))
        predictions.append(round(pred, 2))

        full_df = pd.concat([full_df, pd.DataFrame({
            "date": [future_date],
            "units_sold": [pred],
            "units_returned": [est_returns],
            "closing_stock": [max(0, full_df["closing_stock"].iloc[-1] - pred + est_returns)] if "closing_stock" in full_df.columns else [0],
        })], ignore_index=True)

    std = float(full_df["units_sold"].std())
    lower = [round(max(0, p - 1.96 * std * np.sqrt(i + 1) * 0.1), 2) for i, p in enumerate(predictions)]
    upper = [round(p + 1.96 * std * np.sqrt(i + 1) * 0.1, 2) for i, p in enumerate(predictions)]

    return {
        "predictions": predictions,
        "lower_bound": lower,
        "upper_bound": upper,
    }
