import numpy as np
import pandas as pd
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error


def _create_features(df: pd.DataFrame) -> pd.DataFrame:
    """Engineer time-series features for XGBoost."""
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

    return df


def train_xgboost(train_df: pd.DataFrame) -> dict:
    """XGBoost model with engineered features."""
    df = train_df[["date", "units_sold"]].copy()
    df = _create_features(df)
    df = df.dropna()

    feature_cols = [c for c in df.columns if c not in ["date", "units_sold"]]
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
    """Iterative multi-step forecast using XGBoost."""
    full_df = train_df[["date", "units_sold"]].copy()
    if not pd.api.types.is_datetime64_any_dtype(full_df["date"]):
        full_df["date"] = pd.to_datetime(full_df["date"])

    predictions = []
    for step in range(steps):
        extended = full_df.copy()
        future_date = pd.Timestamp(full_df["date"].max()) + pd.Timedelta(days=step + 1)
        new_row = pd.DataFrame({"date": [future_date], "units_sold": [0]})
        extended = pd.concat([extended, new_row], ignore_index=True)

        featured = _create_features(extended)
        last_row = featured.iloc[[-1]]

        X_pred = last_row[model["feature_cols"]].values
        pred = max(0, float(model["model"].predict(X_pred)[0]))
        predictions.append(round(pred, 2))

        full_df = pd.concat([full_df, pd.DataFrame({"date": [future_date], "units_sold": [pred]})], ignore_index=True)

    std = float(full_df["units_sold"].std())
    lower = [round(max(0, p - 1.96 * std * np.sqrt(i + 1) * 0.1), 2) for i, p in enumerate(predictions)]
    upper = [round(p + 1.96 * std * np.sqrt(i + 1) * 0.1, 2) for i, p in enumerate(predictions)]

    return {
        "predictions": predictions,
        "lower_bound": lower,
        "upper_bound": upper,
    }
