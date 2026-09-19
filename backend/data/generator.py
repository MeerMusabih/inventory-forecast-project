import numpy as np
import pandas as pd
from dataclasses import dataclass

OUTLET_NAMES = [
    "Main Market", "City Center", "Mall Branch", "Residential Branch", "Highway Branch",
    "Harbour Front", "Garden District", "North Gate", "Old Town", "University Row",
    "Airport Plaza", "Riverside", "Station Square", "Westfield", "Park Lane",
    "Cafe Quarter", "Hill View", "Market Street", "Sunset Road", "Union Square",
]

OUTLETS = [
    {
        "id": f"outlet-{i + 1}",
        "name": OUTLET_NAMES[i],
        "type": ["urban", "suburban", "highway", "urban", "rural"][i % 5],
    }
    for i in range(20)
]

# --- Cakes: (name, cost, price, baseDemand, volatility, seasonalPeak, weekendBoost, returnRate, trend)
# Same 30 cakes as scripts/build_sample_data.py so the two tiers tell one story.
CAKE_SEED = [
    ("Chocolate Fudge Cake", 9.00, 28.00, 8, 0.25, 160, 1.35, 0.03, 0.01),
    ("Vanilla Sponge Cake", 7.50, 24.00, 7, 0.20, None, 1.30, 0.03, 0.005),
    ("Red Velvet Cake", 11.00, 32.00, 5, 0.28, 60, 1.40, 0.03, 0.0),
    ("Lemon Drizzle Cake", 6.50, 22.00, 4, 0.22, None, 1.25, 0.02, -0.01),
    ("Carrot Cake", 8.00, 26.00, 4, 0.25, None, 1.25, 0.02, 0.005),
    ("Black Forest Cake", 10.00, 30.00, 5, 0.30, 200, 1.45, 0.03, 0.01),
    ("Strawberry Shortcake", 8.50, 27.00, 5, 0.30, 197, 1.40, 0.06, 0.015),
    ("Whole-Wheat Cake", 5.50, 20.00, 3, 0.18, None, 1.20, 0.02, 0.01),
    ("Pineapple Upside-Down Cake", 7.00, 24.00, 4, 0.22, None, 1.30, 0.02, 0.0),
    ("Butter Cake", 5.00, 18.00, 6, 0.20, None, 1.30, 0.03, 0.0),
    ("German Chocolate Cake", 10.50, 31.00, 5, 0.26, 150, 1.35, 0.03, 0.01),
    ("Tiramisu Cake", 11.00, 33.00, 5, 0.28, 105, 1.40, 0.03, 0.01),
    ("Cheesecake", 10.00, 30.00, 5, 0.22, None, 1.30, 0.02, 0.005),
    ("Banana Walnut Cake", 7.50, 25.00, 4, 0.24, None, 1.25, 0.03, 0.005),
    ("Apple Cinnamon Cake", 7.00, 24.00, 4, 0.22, None, 1.30, 0.02, -0.01),
    ("Coconut Cake", 7.50, 25.00, 4, 0.22, None, 1.28, 0.02, 0.005),
    ("Marble Cake", 6.00, 21.00, 5, 0.20, None, 1.25, 0.03, 0.0),
    ("Mango Mousse Cake", 9.50, 29.00, 5, 0.28, 170, 1.40, 0.03, 0.01),
    ("Blueberry Muffin Tray", 8.00, 26.00, 6, 0.24, None, 1.35, 0.03, 0.01),
    ("Almond Gateau", 10.00, 31.00, 4, 0.26, 130, 1.35, 0.02, 0.01),
    ("Hazelnut Praline Cake", 10.50, 32.00, 4, 0.26, None, 1.35, 0.03, 0.005),
    ("Orange Chiffon Cake", 7.00, 23.00, 4, 0.20, None, 1.25, 0.02, 0.005),
    ("Pistachio Cake", 12.00, 35.00, 3, 0.24, None, 1.35, 0.03, 0.0),
    ("Tres Leches Cake", 8.50, 27.00, 4, 0.26, 120, 1.35, 0.03, 0.01),
    ("Honey Cake", 7.00, 22.00, 3, 0.20, None, 1.25, 0.02, 0.005),
    ("Coffee Cake", 6.50, 22.00, 4, 0.22, None, 1.25, 0.02, -0.01),
    ("Fruit Gateau", 9.00, 28.00, 5, 0.24, 90, 1.40, 0.03, 0.01),
    ("Coconut Macaroon Tray", 6.00, 20.00, 3, 0.20, None, 1.25, 0.02, 0.005),
    ("Lemon Meringue Cake", 7.50, 25.00, 4, 0.24, 140, 1.35, 0.03, 0.005),
    ("Truffle Brownie Cake", 11.50, 34.00, 5, 0.28, 200, 1.45, 0.03, 0.01),
]

PRODUCT_PROFILES = []
for idx, (name, cost, price, base, vol, peak, wb, ret, trend) in enumerate(CAKE_SEED, start=1):
    pid = f"CAKE-{idx:03d}"
    weights = {}
    for o in range(len(OUTLETS)):
        oid = OUTLETS[o]["id"]
        base_w = 1.0 + (o % 5) * 0.1
        aff = 0.85 + ((idx * 7 + o * 13) % 11) * 0.03
        weights[oid] = round(base_w * aff, 2)
    PRODUCT_PROFILES.append({
        "id": pid,
        "name": name,
        "category": "Bakery",
        "cost": cost,
        "price": price,
        "baseDemand": base,
        "volatility": vol,
        "seasonalPeak": peak,
        "weekendBoost": wb,
        "returnRate": ret,
        "weights": weights,
        "trend": trend,
    })


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


@dataclass
class StockProfile:
    initial_mult: float
    reorder_freq: float
    reorder_qty_mult: float
    has_supply_issue: bool
    supply_start: int
    supply_end: int


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