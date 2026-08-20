import numpy as np
import pandas as pd


def detect_stockouts(df: pd.DataFrame) -> pd.Series:
    """Detect stockout periods where observed sales don't reflect true demand.

    A stockout is flagged when closing_stock reaches zero, meaning any unmet
    demand is censored and the observed units_sold underrepresents actual need.
    """
    was_out_of_stock = df["closing_stock"].shift(1).ffill() == 0
    zero_sales = df["units_sold"] == 0
    return was_out_of_stock & zero_sales


def estimate_true_demand(df: pd.DataFrame, window: int = 14) -> pd.Series:
    """Estimate true demand by correcting censored (stockout) observations.

    During stockout periods, observed sales = min(demand, available_stock) = 0.
    We replace these with a rolling median of non-zero sales to approximate
    what would have sold if stock were available.
    """
    sales = df["units_sold"].astype(float).copy()
    stockout_mask = detect_stockouts(df)

    non_zero_sales = sales.where(~stockout_mask)
    rolling_median = non_zero_sales.rolling(window=window, min_periods=3).median()
    rolling_median = rolling_median.ffill().bfill()

    corrected = sales.copy()
    corrected[stockout_mask] = rolling_median[stockout_mask]
    corrected = corrected.clip(lower=0)
    return corrected


def correct_series_for_training(
    df: pd.DataFrame, window: int = 14
) -> pd.Series:
    """Create a demand-corrected time series suitable for ML training.

    Returns a pd.Series indexed by date with stockout periods filled in.
    """
    corrected = estimate_true_demand(df, window=window)
    return pd.Series(corrected.values, index=df["date"])
