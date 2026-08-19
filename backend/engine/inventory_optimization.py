import numpy as np
import pandas as pd
from scipy import stats


def calculate_eoq(annual_demand: float, ordering_cost: float, holding_cost: float) -> float:
    """Economic Order Quantity.

    EOQ = sqrt(2 * D * S / H)
    D = annual demand
    S = fixed cost per order
    H = annual holding cost per unit
    """
    if holding_cost <= 0 or annual_demand <= 0:
        return 0
    return float(np.sqrt(2 * annual_demand * ordering_cost / holding_cost))


def calculate_safety_stock(
    avg_daily_demand: float,
    std_daily_demand: float,
    lead_time_days: float,
    service_level: float = 0.95,
) -> float:
    """Safety stock based on demand variability and desired service level.

    SS = Z * σ_d * sqrt(L)
    Z = z-score for service level
    σ_d = standard deviation of daily demand
    L = lead time in days
    """
    z = stats.norm.ppf(service_level)
    return float(z * std_daily_demand * np.sqrt(lead_time_days))


def calculate_reorder_point(
    avg_daily_demand: float,
    lead_time_days: float,
    safety_stock: float,
) -> float:
    """Reorder Point = (Avg Daily Demand × Lead Time) + Safety Stock."""
    return float(avg_daily_demand * lead_time_days + safety_stock)


def calculate_service_level(
    units_sold: float,
    demand: float,
) -> float:
    """Fraction of demand that was fulfilled (not lost to stockout)."""
    if demand <= 0:
        return 1.0
    return min(1.0, units_sold / demand)


def optimize_inventory(
    sales_df: pd.DataFrame,
    product_id: str,
    outlet_id: str,
    ordering_cost: float = 50.0,
    holding_cost_pct: float = 0.25,
    lead_time_days: float = 3.0,
    target_service_level: float = 0.95,
) -> dict:
    """Full inventory optimization for a product-outlet pair.

    Returns EOQ, safety stock, reorder point, service level analysis,
    and demand statistics.
    """
    mask = (sales_df["product_id"] == product_id) & (sales_df["outlet_id"] == outlet_id)
    product_sales = sales_df[mask].sort_values("date")

    if len(product_sales) < 30:
        return {
            "product_id": product_id,
            "outlet_id": outlet_id,
            "error": "Insufficient data",
        }

    recent = product_sales.tail(90)
    daily_demand = recent["units_sold"].values.astype(float)

    avg_daily = float(np.mean(daily_demand))
    std_daily = float(np.std(daily_demand))
    annual_demand = avg_daily * 365

    product_row = product_sales.iloc[-1]
    unit_cost = float(product_row.get("revenue", 0)) / max(float(product_row.get("units_sold", 1)), 1)
    holding_cost = unit_cost * holding_cost_pct

    if avg_daily < 0.1:
        return {
            "product_id": product_id,
            "outlet_id": outlet_id,
            "avg_daily_demand": round(avg_daily, 2),
            "status": "no_demand",
        }

    eoq = calculate_eoq(annual_demand, ordering_cost, holding_cost)
    safety_stock = calculate_safety_stock(avg_daily, std_daily, lead_time_days, target_service_level)
    reorder_point = calculate_reorder_point(avg_daily, lead_time_days, safety_stock)

    recent_30 = product_sales.tail(30)
    recent_30_prev = product_sales.iloc[-60:-30] if len(product_sales) >= 60 else product_sales.head(30)

    recent_avg = float(recent_30["units_sold"].mean())
    prev_avg = float(recent_30_prev["units_sold"].mean()) if len(recent_30_prev) > 0 else recent_avg

    demand_change = ((recent_avg - prev_avg) / max(prev_avg, 0.01)) * 100

    zero_days = (recent_30["units_sold"] == 0).sum()
    stockout_risk = "low"
    if zero_days > 15:
        stockout_risk = "high"
    elif zero_days > 8:
        stockout_risk = "medium"

    weekly_pattern = []
    for dow in range(7):
        day_mask = recent["date"].apply(lambda d: pd.Timestamp(d).dayofweek == dow)
        day_avg = recent.loc[day_mask, "units_sold"].mean()
        weekly_pattern.append(round(float(day_avg), 2) if not np.isnan(day_avg) else 0)

    days_of_stock = float(recent["closing_stock"].iloc[-1]) / avg_daily if avg_daily > 0 else 0

    return {
        "product_id": product_id,
        "outlet_id": outlet_id,
        "demand_stats": {
            "avg_daily": round(avg_daily, 2),
            "std_daily": round(std_daily, 2),
            "annual_demand": round(annual_demand, 0),
            "demand_cv": round(std_daily / avg_daily, 2) if avg_daily > 0 else 0,
            "demand_trend_pct": round(demand_change, 1),
        },
        "optimization": {
            "eoq": round(eoq, 0),
            "safety_stock": round(safety_stock, 0),
            "reorder_point": round(reorder_point, 0),
            "lead_time_days": lead_time_days,
            "service_level_target": target_service_level,
        },
        "current_status": {
            "current_stock": round(float(recent["closing_stock"].iloc[-1]), 0),
            "days_of_stock": round(days_of_stock, 1),
            "stockout_risk": stockout_risk,
            "zero_sales_days_30d": int(zero_days),
        },
        "weekly_pattern": weekly_pattern,
    }
