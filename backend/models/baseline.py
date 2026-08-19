import numpy as np
import pandas as pd


def train_baseline(train_series: pd.Series) -> dict:
    """Simple Moving Average baseline — what the frontend currently uses."""
    values = train_series.values.astype(float)
    window = min(30, len(values))

    sma = float(np.mean(values[-window:]))

    return {
        "type": "baseline_sma",
        "window": window,
        "sma": sma,
        "last_values": values[-window:].tolist(),
    }


def predict_baseline(model: dict, steps: int) -> dict:
    """SMA just repeats the average for all future steps."""
    sma = model["sma"]
    predictions = [round(max(0, sma), 2)] * steps
    lower = [round(max(0, sma * 0.7), 2)] * steps
    upper = [round(sma * 1.3, 2)] * steps

    return {
        "predictions": predictions,
        "lower_bound": lower,
        "upper_bound": upper,
    }
