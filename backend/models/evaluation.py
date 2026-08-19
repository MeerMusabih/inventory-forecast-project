import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error


def calculate_mape(actual, predicted):
    actual = np.array(actual, dtype=float)
    predicted = np.array(predicted, dtype=float)
    mask = actual > 0
    if mask.sum() == 0:
        return 0.0
    return float(np.mean(np.abs((actual[mask] - predicted[mask]) / actual[mask])) * 100)


def calculate_mae(actual, predicted):
    return float(mean_absolute_error(actual, predicted))


def calculate_rmse(actual, predicted):
    return float(np.sqrt(mean_squared_error(actual, predicted)))


def calculate_bias(actual, predicted):
    actual = np.array(actual, dtype=float)
    predicted = np.array(predicted, dtype=float)
    return float(np.mean(predicted - actual))


def evaluate_all_models(
    train_series: pd.Series,
    test_series: pd.Series,
    train_df: pd.DataFrame = None,
    seasonal_period: int = 7,
) -> dict:
    """Train all models on train data, evaluate on test data, compare."""
    results = {}

    actual = test_series.values.astype(float)
    steps = len(actual)

    from .baseline import train_baseline, predict_baseline
    from .holt_winters import train_holt_winters, predict_holt_winters
    from .arima_model import train_arima, predict_arima

    models = {
        "baseline_sma": ("baseline", lambda: train_baseline(train_series)),
        "holt_winters": ("holt_winters", lambda: train_holt_winters(train_series, seasonal_period)),
        "arima": ("arima", lambda: train_arima(train_series)),
    }

    for name, (_, trainer) in models.items():
        try:
            model = trainer()
            if model.get("model") is None and name != "baseline_sma":
                continue

            if name == "baseline_sma":
                pred_result = predict_baseline(model, steps)
            elif name == "holt_winters":
                pred_result = predict_holt_winters(model, steps)
            elif name == "arima":
                pred_result = predict_arima(model, steps)
            else:
                continue

            predicted = np.array(pred_result["predictions"][:steps])

            results[name] = {
                "mae": round(calculate_mae(actual, predicted), 2),
                "rmse": round(calculate_rmse(actual, predicted), 2),
                "mape": round(calculate_mape(actual, predicted), 2),
                "bias": round(calculate_bias(actual, predicted), 2),
                "predictions": [round(p, 2) for p in predicted.tolist()],
            }

            if name == "holt_winters":
                results[name]["params"] = {
                    "alpha": model["alpha"],
                    "beta": model["beta"],
                    "gamma": model["gamma"],
                }
            elif name == "arima":
                results[name]["params"] = {"order": model["order"]}

        except Exception as e:
            results[name] = {"error": str(e)}

    if train_df is not None:
        try:
            from .xgboost_model import train_xgboost, predict_xgboost

            xgb_model = train_xgboost(train_df)
            xgb_pred = predict_xgboost(xgb_model, train_df, steps)
            predicted_xgb = np.array(xgb_pred["predictions"][:steps])

            results["xgboost"] = {
                "mae": round(calculate_mae(actual, predicted_xgb), 2),
                "rmse": round(calculate_rmse(actual, predicted_xgb), 2),
                "mape": round(calculate_mape(actual, predicted_xgb), 2),
                "bias": round(calculate_bias(actual, predicted_xgb), 2),
                "predictions": [round(p, 2) for p in predicted_xgb.tolist()],
                "top_features": xgb_model["top_features"][:5],
            }
        except Exception as e:
            results["xgboost"] = {"error": str(e)}

    if "baseline_sma" in results and "rmse" in results["baseline_sma"]:
        baseline_rmse = results["baseline_sma"]["rmse"]
        for name, res in results.items():
            if "rmse" in res and name != "baseline_sma" and baseline_rmse > 0:
                improvement = ((baseline_rmse - res["rmse"]) / baseline_rmse) * 100
                res["improvement_vs_baseline"] = round(improvement, 1)

    return results
