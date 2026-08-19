import numpy as np
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.stattools import adfuller


def _find_best_order(series: pd.Series) -> tuple:
    """Auto-select ARIMA order using AIC."""
    values = series.values.astype(float)

    adf_result = adfuller(values, autolag="AIC")
    d = 0 if adf_result[1] < 0.05 else 1

    best_aic = float("inf")
    best_order = (1, d, 1)

    for p in range(0, 4):
        for q in range(0, 4):
            if p == 0 and q == 0:
                continue
            try:
                model = ARIMA(values, order=(p, d, q))
                result = model.fit()
                if result.aic < best_aic:
                    best_aic = result.aic
                    best_order = (p, d, q)
            except Exception:
                continue

    return best_order


def train_arima(train_series: pd.Series) -> dict:
    """ARIMA model with auto order selection."""
    values = train_series.values.astype(float)

    if len(values) < 10:
        return {
            "type": "arima",
            "order": (1, 0, 0),
            "aic": 0,
            "rmse": 0,
            "n_observations": len(values),
            "model": None,
        }

    order = _find_best_order(train_series)

    try:
        model = ARIMA(values, order=order)
        fitted = model.fit()
        fitted_values = fitted.fittedvalues
        rmse = float(np.sqrt(np.mean((values - fitted_values) ** 2)))

        return {
            "type": "arima",
            "order": order,
            "aic": round(float(fitted.aic), 2),
            "bic": round(float(fitted.bic), 2),
            "rmse": round(rmse, 2),
            "n_observations": len(values),
            "model": fitted,
        }
    except Exception:
        return {
            "type": "arima",
            "order": (1, 0, 0),
            "aic": 0,
            "rmse": 0,
            "n_observations": len(values),
            "model": None,
        }


def predict_arima(model: dict, steps: int) -> dict:
    """Generate ARIMA forecasts with confidence intervals."""
    if model["model"] is None:
        zeros = [0.0] * steps
        return {"predictions": zeros, "lower_bound": zeros, "upper_bound": zeros}

    forecast = model["model"].get_forecast(steps=steps)
    pred_mean = forecast.predicted_mean
    conf_int = forecast.conf_int(alpha=0.05)

    predictions = np.maximum(0, pred_mean).tolist()

    if hasattr(conf_int, "iloc"):
        lower = np.maximum(0, conf_int.iloc[:, 0]).tolist()
        upper = conf_int.iloc[:, 1].tolist()
    else:
        lower = np.maximum(0, conf_int[:, 0]).tolist()
        upper = conf_int[:, 1].tolist()

    return {
        "predictions": [round(p, 2) for p in predictions],
        "lower_bound": [round(p, 2) for p in lower],
        "upper_bound": [round(p, 2) for p in upper],
    }
