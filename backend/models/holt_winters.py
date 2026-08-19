import numpy as np
import pandas as pd
from statsmodels.tsa.holtwinters import ExponentialSmoothing


def train_holt_winters(train_series: pd.Series, seasonal_period: int = 7) -> dict:
    """Holt-Winters Triple Exponential Smoothing.

    Captures 3 components:
    - Level (baseline value)
    - Trend (increasing/decreasing)
    - Seasonality (weekly pattern)
    """
    values = train_series.values.astype(float)

    if len(values) < seasonal_period * 2:
        seasonal_period = max(2, len(values) // 3)

    try:
        model = ExponentialSmoothing(
            values,
            trend="add",
            seasonal="add",
            seasonal_periods=seasonal_period,
            initialization_method="estimated",
        ).fit(optimized=True, use_brute=False)

        fitted_values = model.fittedvalues

        alpha = float(model.params.get("smoothing_level", 0.5))
        beta = float(model.params.get("smoothing_trend", 0.1))
        gamma = float(model.params.get("smoothing_seasonal", 0.1))
        rmse = float(np.sqrt(np.mean((values - fitted_values) ** 2)))

        return {
            "type": "holt_winters",
            "model": model,
            "seasonal_period": seasonal_period,
            "alpha": round(alpha, 4),
            "beta": round(beta, 4),
            "gamma": round(gamma, 4),
            "rmse": round(rmse, 2),
            "n_observations": len(values),
        }
    except Exception:
        from statsmodels.tsa.holtwinters import SimpleExpSmoothing

        model = SimpleExpSmoothing(values, initialization_method="estimated").fit(
            optimized=True
        )
        return {
            "type": "holt_winters_simple",
            "model": model,
            "seasonal_period": seasonal_period,
            "alpha": float(model.params.get("smoothing_level", 0.5)),
            "beta": 0.0,
            "gamma": 0.0,
            "rmse": 0.0,
            "n_observations": len(values),
        }


def predict_holt_winters(model: dict, steps: int) -> dict:
    """Generate forecasts with prediction intervals."""
    statsmodel = model["model"]
    forecast = statsmodel.forecast(steps)
    predictions = np.maximum(0, forecast).tolist()

    fitted = statsmodel.fittedvalues
    residuals = fitted - statsmodel.model.endog
    sigma = float(np.std(residuals))

    z = 1.96
    lower = [round(max(0, p - z * sigma * np.sqrt(i + 1)), 2) for i, p in enumerate(predictions)]
    upper = [round(p + z * sigma * np.sqrt(i + 1), 2) for i, p in enumerate(predictions)]
    predictions = [round(p, 2) for p in predictions]

    return {
        "predictions": predictions,
        "lower_bound": lower,
        "upper_bound": upper,
        "sigma": round(sigma, 2),
    }
