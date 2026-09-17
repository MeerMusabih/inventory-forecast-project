import numpy as np
import pandas as pd
from dataclasses import dataclass, field

OUTLETS = [
    {"id": "outlet-1", "name": "Main Market", "type": "urban"},
    {"id": "outlet-2", "name": "City Center", "type": "urban"},
    {"id": "outlet-3", "name": "Mall Branch", "type": "urban"},
    {"id": "outlet-4", "name": "Residential Branch", "type": "suburban"},
    {"id": "outlet-5", "name": "Highway Branch", "type": "highway"},
]

PRODUCT_PROFILES = [
    {"id": "CAKE-001", "name": "Chocolate Fudge Cake", "category": "Bakery", "cost": 9.00, "price": 28.00, "baseDemand": 8, "volatility": 0.25, "seasonalPeak": 160, "weekendBoost": 1.35, "returnRate": 0.03, "weights": {"outlet-1": 1.2, "outlet-2": 1.0, "outlet-3": 1.4, "outlet-4": 0.9, "outlet-5": 0.6}, "trend": 0.01},
    {"id": "CAKE-002", "name": "Vanilla Sponge Cake", "category": "Bakery", "cost": 7.50, "price": 24.00, "baseDemand": 7, "volatility": 0.20, "seasonalPeak": None, "weekendBoost": 1.30, "returnRate": 0.03, "weights": {"outlet-1": 1.1, "outlet-2": 1.0, "outlet-3": 1.1, "outlet-4": 1.3, "outlet-5": 0.5}, "trend": 0.005},
    {"id": "CAKE-003", "name": "Red Velvet Cake", "category": "Bakery", "cost": 11.00, "price": 32.00, "baseDemand": 5, "volatility": 0.28, "seasonalPeak": 60, "weekendBoost": 1.40, "returnRate": 0.03, "weights": {"outlet-1": 1.0, "outlet-2": 0.9, "outlet-3": 1.6, "outlet-4": 0.8, "outlet-5": 0.4}, "trend": 0.0},
    {"id": "CAKE-004", "name": "Lemon Drizzle Cake", "category": "Bakery", "cost": 6.50, "price": 22.00, "baseDemand": 4, "volatility": 0.22, "seasonalPeak": None, "weekendBoost": 1.25, "returnRate": 0.02, "weights": {"outlet-1": 1.1, "outlet-2": 1.0, "outlet-3": 0.8, "outlet-4": 1.2, "outlet-5": 0.6}, "trend": -0.01},
    {"id": "CAKE-005", "name": "Carrot Cake", "category": "Bakery", "cost": 8.00, "price": 26.00, "baseDemand": 4, "volatility": 0.25, "seasonalPeak": None, "weekendBoost": 1.25, "returnRate": 0.02, "weights": {"outlet-1": 1.0, "outlet-2": 0.9, "outlet-3": 1.0, "outlet-4": 1.4, "outlet-5": 0.5}, "trend": 0.005},
    {"id": "CAKE-006", "name": "Black Forest Cake", "category": "Bakery", "cost": 10.00, "price": 30.00, "baseDemand": 5, "volatility": 0.30, "seasonalPeak": 200, "weekendBoost": 1.45, "returnRate": 0.03, "weights": {"outlet-1": 1.0, "outlet-2": 0.8, "outlet-3": 1.5, "outlet-4": 0.7, "outlet-5": 1.0}, "trend": 0.01},
    {"id": "CAKE-007", "name": "Strawberry Shortcake", "category": "Bakery", "cost": 8.50, "price": 27.00, "baseDemand": 5, "volatility": 0.30, "seasonalPeak": 197, "weekendBoost": 1.40, "returnRate": 0.06, "weights": {"outlet-1": 1.1, "outlet-2": 1.0, "outlet-3": 1.0, "outlet-4": 1.2, "outlet-5": 0.5}, "trend": 0.015},
    {"id": "CAKE-008", "name": "Whole-Wheat Cake", "category": "Bakery", "cost": 5.50, "price": 20.00, "baseDemand": 3, "volatility": 0.18, "seasonalPeak": None, "weekendBoost": 1.20, "returnRate": 0.02, "weights": {"outlet-1": 1.0, "outlet-2": 0.9, "outlet-3": 0.7, "outlet-4": 1.5, "outlet-5": 0.4}, "trend": 0.01},
    {"id": "CAKE-009", "name": "Pineapple Upside-Down Cake", "category": "Bakery", "cost": 7.00, "price": 24.00, "baseDemand": 4, "volatility": 0.22, "seasonalPeak": None, "weekendBoost": 1.30, "returnRate": 0.02, "weights": {"outlet-1": 1.0, "outlet-2": 0.9, "outlet-3": 0.9, "outlet-4": 1.2, "outlet-5": 0.7}, "trend": 0.0},
    {"id": "CAKE-010", "name": "Butter Cake", "category": "Bakery", "cost": 5.00, "price": 18.00, "baseDemand": 6, "volatility": 0.20, "seasonalPeak": None, "weekendBoost": 1.30, "returnRate": 0.03, "weights": {"outlet-1": 1.2, "outlet-2": 1.1, "outlet-3": 0.9, "outlet-4": 1.3, "outlet-5": 0.6}, "trend": 0.0},
]


def mulberry32(a):
    def rng():
        nonlocal a
        a = (a + 0x6d2b79f5) & 0xFFFFFFFF
        t = a
        t = ((t ^ (t >> 15)) * (t | 1)) & 0xFFFFFFFF
        t = (t ^ t + ((t ^ (t >> 7)) * (t | 61))) & 0xFFFFFFFF
        return ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296
    return rng


def gaussian_random(rng):
    u = 0
    while u == 0:
        u = rng()
    v = 0
    while v == 0:
        v = rng()
    return np.sqrt(-2.0 * np.log(u)) * np.cos(2.0 * np.pi * v)


class StockProfile:
    def __init__(self, initial_mult, reorder_freq, reorder_qty_mult, has_supply_issue, supply_start, supply_end):
        self.initial_mult = initial_mult
        self.reorder_freq = reorder_freq
        self.reorder_qty_mult = reorder_qty_mult
        self.has_supply_issue = has_supply_issue
        self.supply_start = supply_start
        self.supply_end = supply_end


def generate_data(seed=54321):
    rng = mulberry32(seed)

    start_date = pd.Timestamp("2025-07-01")
    end_date = pd.Timestamp("2026-08-18")
    total_days = (end_date - start_date).days

    stock_profiles = {}
    for outlet in OUTLETS:
        stock_profiles[outlet["id"]] = {}
        for profile in PRODUCT_PROFILES:
            r = rng()
            if r < 0.05:
                sp = StockProfile(0.5 + rng() * 0.5, 5 + rng() * 3, 1.5 + rng() * 1, True,
                                  int(total_days * (0.3 + rng() * 0.4)), min(total_days, int(total_days * (0.3 + rng() * 0.4)) + 15))
            elif r < 0.15:
                sp = StockProfile(6 + rng() * 10, 4 + rng() * 3, 2 + rng() * 2, False, 0, 0)
            elif r < 0.30:
                sp = StockProfile(1 + rng() * 1.5, 7 + rng() * 5, 1 + rng() * 0.8, False, 0, 0)
            elif r < 0.45:
                start = int(total_days * (0.5 + rng() * 0.3))
                sp = StockProfile(3 + rng() * 3, 5 + rng() * 4, 1.5 + rng() * 1, True,
                                  start, min(total_days, start + int(10 + rng() * 15)))
            else:
                sp = StockProfile(2 + rng() * 4, 4 + rng() * 4, 1.2 + rng() * 1, False, 0, 0)
            stock_profiles[outlet["id"]][profile["id"]] = sp

    stock = {}
    for outlet in OUTLETS:
        stock[outlet["id"]] = {}
        for profile in PRODUCT_PROFILES:
            w = profile["weights"].get(outlet["id"], 1)
            sp = stock_profiles[outlet["id"]][profile["id"]]
            stock[outlet["id"]][profile["id"]] = int(profile["baseDemand"] * w * sp.initial_mult)

    sales_rows = []
    dates = pd.date_range(start_date, periods=total_days)

    for d_idx, date in enumerate(dates):
        date_str = date.strftime("%Y-%m-%d")
        day_of_year = date.dayofyear
        day_of_week = date.dayofweek
        is_weekend = day_of_week in [4, 5, 6]
        day_progress = d_idx / total_days

        for outlet in OUTLETS:
            for profile in PRODUCT_PROFILES:
                w = profile["weights"].get(outlet["id"], 1)
                sp = stock_profiles[outlet["id"]][profile["id"]]
                oid = outlet["id"]
                pid = profile["id"]

                demand = profile["baseDemand"] * w
                demand *= 1 + gaussian_random(rng) * profile["volatility"]

                if is_weekend:
                    demand *= profile["weekendBoost"]

                if profile["seasonalPeak"] is not None:
                    dist = abs(day_of_year - profile["seasonalPeak"])
                    seasonal_dist = min(dist, 365 - dist)
                    seasonal_effect = np.exp(-(seasonal_dist ** 2) / (2 * 25 * 25)) * 0.5
                    demand *= 1 + seasonal_effect

                if profile["trend"] != 0:
                    demand *= 1 + profile["trend"] * day_progress

                if oid == "outlet-3" and profile["category"] == "Fresh Produce":
                    demand *= 0.5 + rng() * 0.3
                if oid == "outlet-5" and profile["category"] in ["Dairy & Eggs", "Household"]:
                    demand *= 0.2 + rng() * 0.2
                if oid == "outlet-4" and profile["category"] == "Frozen Foods":
                    demand *= 0.8 + rng() * 0.4

                if d_idx > total_days * 0.85 and rng() < 0.08:
                    demand *= 1.8 + rng() * 0.5
                if total_days * 0.6 < d_idx < total_days * 0.7 and rng() < 0.05:
                    demand *= 0.3

                units_sold = max(0, round(demand))
                sold = min(units_sold, stock[oid][pid])
                stock[oid][pid] = max(0, stock[oid][pid] - sold)

                return_rate = profile.get("returnRate", 0.03)
                units_returned = max(0, round(sold * return_rate * (0.5 + rng())))
                stock[oid][pid] += units_returned

                in_supply_issue = sp.has_supply_issue and sp.supply_start <= d_idx < sp.supply_end

                freq = int(sp.reorder_freq)
                if not in_supply_issue and freq > 0 and d_idx % freq == int(rng() * freq):
                    qty = int(profile["baseDemand"] * w * sp.reorder_qty_mult * (0.9 + rng() * 0.3))
                    stock[oid][pid] += qty

                if stock[oid][pid] < profile["baseDemand"] * w * 0.5 and rng() < 0.6 and not in_supply_issue:
                    stock[oid][pid] += int(profile["baseDemand"] * w * 6)

                revenue = sold * profile["price"]
                sales_rows.append({
                    "date": date_str,
                    "outlet_id": oid,
                    "product_id": pid,
                    "units_sold": sold,
                    "units_returned": units_returned,
                    "revenue": revenue,
                    "closing_stock": stock[oid][pid],
                })

    df = pd.DataFrame(sales_rows)
    return df


if __name__ == "__main__":
    df = generate_data()
    df.to_csv("data/sales.csv", index=False)
    print(f"Generated {len(df)} rows")
    print(f"Date range: {df['date'].min()} to {df['date'].max()}")
    print(f"Products: {df['product_id'].nunique()}, Outlets: {df['outlet_id'].nunique()}")
    print(f"Total revenue: ${df['revenue'].sum():,.0f}")
