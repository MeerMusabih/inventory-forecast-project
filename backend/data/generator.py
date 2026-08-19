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
    {"id": "prod-1", "name": "Milk 1L", "category": "Dairy & Eggs", "cost": 0.80, "price": 1.49, "baseDemand": 32, "volatility": 0.25, "seasonalPeak": None, "weekendBoost": 1.15, "returnRate": 0.04, "weights": {"outlet-1": 1.1, "outlet-2": 0.9, "outlet-3": 0.5, "outlet-4": 1.6, "outlet-5": 0.3}, "trend": 0.02},
    {"id": "prod-2", "name": "Bread Loaf", "category": "Bakery", "cost": 0.40, "price": 1.29, "baseDemand": 28, "volatility": 0.20, "seasonalPeak": None, "weekendBoost": 1.25, "returnRate": 0.04, "weights": {"outlet-1": 1.2, "outlet-2": 1.0, "outlet-3": 0.6, "outlet-4": 1.5, "outlet-5": 0.4}, "trend": -0.01},
    {"id": "prod-3", "name": "Eggs (12 pack)", "category": "Dairy & Eggs", "cost": 1.50, "price": 3.49, "baseDemand": 20, "volatility": 0.30, "seasonalPeak": None, "weekendBoost": 1.3, "returnRate": 0.03, "weights": {"outlet-1": 1.1, "outlet-2": 0.8, "outlet-3": 0.4, "outlet-4": 1.7, "outlet-5": 0.25}, "trend": 0.03},
    {"id": "prod-4", "name": "Coca-Cola 1.5L", "category": "Beverages", "cost": 0.60, "price": 1.99, "baseDemand": 24, "volatility": 0.35, "seasonalPeak": 180, "weekendBoost": 1.4, "returnRate": 0.03, "weights": {"outlet-1": 1.0, "outlet-2": 1.1, "outlet-3": 1.5, "outlet-4": 0.7, "outlet-5": 1.8}, "trend": 0.01},
    {"id": "prod-5", "name": "Cooking Oil 1L", "category": "Cooking Essentials", "cost": 1.20, "price": 3.29, "baseDemand": 14, "volatility": 0.15, "seasonalPeak": None, "weekendBoost": 1.05, "returnRate": 0.01, "weights": {"outlet-1": 1.2, "outlet-2": 0.9, "outlet-3": 0.5, "outlet-4": 1.4, "outlet-5": 0.6}, "trend": 0.0},
    {"id": "prod-6", "name": "Rice 5kg", "category": "Grains & Pasta", "cost": 2.50, "price": 6.99, "baseDemand": 11, "volatility": 0.12, "seasonalPeak": None, "weekendBoost": 1.1, "returnRate": 0.01, "weights": {"outlet-1": 1.3, "outlet-2": 0.8, "outlet-3": 0.4, "outlet-4": 1.5, "outlet-5": 0.5}, "trend": 0.0},
    {"id": "prod-7", "name": "Chicken Breast 1kg", "category": "Meat & Poultry", "cost": 3.00, "price": 7.99, "baseDemand": 16, "volatility": 0.40, "seasonalPeak": None, "weekendBoost": 1.35, "returnRate": 0.05, "weights": {"outlet-1": 1.2, "outlet-2": 1.0, "outlet-3": 0.7, "outlet-4": 1.3, "outlet-5": 0.4}, "trend": 0.02},
    {"id": "prod-8", "name": "Mineral Water 1.5L", "category": "Beverages", "cost": 0.20, "price": 0.99, "baseDemand": 38, "volatility": 0.20, "seasonalPeak": 170, "weekendBoost": 1.5, "returnRate": 0.02, "weights": {"outlet-1": 1.0, "outlet-2": 1.1, "outlet-3": 1.3, "outlet-4": 0.8, "outlet-5": 2.2}, "trend": 0.04},
    {"id": "prod-9", "name": "Biscuits Pack", "category": "Snacks", "cost": 0.80, "price": 2.49, "baseDemand": 17, "volatility": 0.30, "seasonalPeak": None, "weekendBoost": 1.3, "returnRate": 0.02, "weights": {"outlet-1": 1.0, "outlet-2": 0.9, "outlet-3": 1.4, "outlet-4": 0.6, "outlet-5": 1.2}, "trend": -0.01},
    {"id": "prod-10", "name": "Tea Bags (100)", "category": "Beverages", "cost": 1.00, "price": 3.99, "baseDemand": 9, "volatility": 0.18, "seasonalPeak": 350, "weekendBoost": 1.05, "returnRate": 0.02, "weights": {"outlet-1": 1.1, "outlet-2": 1.0, "outlet-3": 0.5, "outlet-4": 1.3, "outlet-5": 0.7}, "trend": 0.0},
    {"id": "prod-11", "name": "Sugar 1kg", "category": "Cooking Essentials", "cost": 0.60, "price": 1.79, "baseDemand": 13, "volatility": 0.10, "seasonalPeak": None, "weekendBoost": 1.05, "returnRate": 0.01, "weights": {"outlet-1": 1.2, "outlet-2": 0.9, "outlet-3": 0.4, "outlet-4": 1.4, "outlet-5": 0.5}, "trend": 0.0},
    {"id": "prod-12", "name": "Butter 250g", "category": "Dairy & Eggs", "cost": 1.00, "price": 2.99, "baseDemand": 11, "volatility": 0.22, "seasonalPeak": 340, "weekendBoost": 1.2, "returnRate": 0.04, "weights": {"outlet-1": 1.0, "outlet-2": 0.8, "outlet-3": 0.6, "outlet-4": 1.3, "outlet-5": 0.4}, "trend": -0.02},
    {"id": "prod-13", "name": "Pasta 500g", "category": "Grains & Pasta", "cost": 0.50, "price": 1.69, "baseDemand": 15, "volatility": 0.18, "seasonalPeak": None, "weekendBoost": 1.15, "returnRate": 0.01, "weights": {"outlet-1": 1.1, "outlet-2": 1.0, "outlet-3": 0.7, "outlet-4": 1.2, "outlet-5": 0.6}, "trend": 0.01},
    {"id": "prod-14", "name": "Tomato Sauce", "category": "Cooking Essentials", "cost": 0.70, "price": 2.29, "baseDemand": 10, "volatility": 0.20, "seasonalPeak": None, "weekendBoost": 1.1, "returnRate": 0.02, "weights": {"outlet-1": 1.1, "outlet-2": 0.9, "outlet-3": 0.6, "outlet-4": 1.3, "outlet-5": 0.5}, "trend": 0.0},
    {"id": "prod-15", "name": "Potatoes 2kg", "category": "Fresh Produce", "cost": 1.00, "price": 2.99, "baseDemand": 18, "volatility": 0.30, "seasonalPeak": None, "weekendBoost": 1.2, "returnRate": 0.06, "weights": {"outlet-1": 1.3, "outlet-2": 0.7, "outlet-3": 0.3, "outlet-4": 1.5, "outlet-5": 0.3}, "trend": 0.01},
    {"id": "prod-16", "name": "Onions 1kg", "category": "Fresh Produce", "cost": 0.40, "price": 1.29, "baseDemand": 14, "volatility": 0.25, "seasonalPeak": None, "weekendBoost": 1.15, "returnRate": 0.05, "weights": {"outlet-1": 1.2, "outlet-2": 0.8, "outlet-3": 0.3, "outlet-4": 1.4, "outlet-5": 0.35}, "trend": 0.0},
    {"id": "prod-17", "name": "Apples 1kg", "category": "Fresh Produce", "cost": 1.20, "price": 3.49, "baseDemand": 12, "volatility": 0.35, "seasonalPeak": 280, "weekendBoost": 1.25, "returnRate": 0.07, "weights": {"outlet-1": 1.0, "outlet-2": 0.9, "outlet-3": 0.8, "outlet-4": 1.2, "outlet-5": 0.5}, "trend": 0.02},
    {"id": "prod-18", "name": "Bananas 1kg", "category": "Fresh Produce", "cost": 0.50, "price": 1.49, "baseDemand": 20, "volatility": 0.30, "seasonalPeak": None, "weekendBoost": 1.2, "returnRate": 0.08, "weights": {"outlet-1": 1.1, "outlet-2": 1.0, "outlet-3": 0.9, "outlet-4": 1.3, "outlet-5": 0.6}, "trend": 0.01},
    {"id": "prod-19", "name": "Orange Juice 1L", "category": "Beverages", "cost": 0.90, "price": 2.99, "baseDemand": 9, "volatility": 0.25, "seasonalPeak": 170, "weekendBoost": 1.3, "returnRate": 0.03, "weights": {"outlet-1": 0.9, "outlet-2": 1.0, "outlet-3": 1.2, "outlet-4": 0.7, "outlet-5": 0.8}, "trend": -0.01},
    {"id": "prod-20", "name": "Chips Pack", "category": "Snacks", "cost": 0.60, "price": 1.99, "baseDemand": 19, "volatility": 0.35, "seasonalPeak": 170, "weekendBoost": 1.5, "returnRate": 0.02, "weights": {"outlet-1": 0.8, "outlet-2": 1.0, "outlet-3": 1.6, "outlet-4": 0.5, "outlet-5": 1.8}, "trend": 0.03},
    {"id": "prod-21", "name": "Yogurt 500g", "category": "Dairy & Eggs", "cost": 0.70, "price": 2.29, "baseDemand": 13, "volatility": 0.28, "seasonalPeak": 170, "weekendBoost": 1.2, "returnRate": 0.05, "weights": {"outlet-1": 1.0, "outlet-2": 0.9, "outlet-3": 0.8, "outlet-4": 1.3, "outlet-5": 0.4}, "trend": 0.02},
    {"id": "prod-22", "name": "Cheese Slices", "category": "Dairy & Eggs", "cost": 1.20, "price": 3.49, "baseDemand": 8, "volatility": 0.20, "seasonalPeak": None, "weekendBoost": 1.15, "returnRate": 0.03, "weights": {"outlet-1": 1.0, "outlet-2": 0.9, "outlet-3": 0.7, "outlet-4": 1.2, "outlet-5": 0.3}, "trend": 0.0},
    {"id": "prod-23", "name": "Frozen Peas 500g", "category": "Frozen Foods", "cost": 0.80, "price": 2.49, "baseDemand": 7, "volatility": 0.15, "seasonalPeak": 350, "weekendBoost": 1.1, "returnRate": 0.03, "weights": {"outlet-1": 0.9, "outlet-2": 0.7, "outlet-3": 0.5, "outlet-4": 1.3, "outlet-5": 0.3}, "trend": -0.01},
    {"id": "prod-24", "name": "Ice Cream 500ml", "category": "Frozen Foods", "cost": 1.00, "price": 3.99, "baseDemand": 10, "volatility": 0.45, "seasonalPeak": 170, "weekendBoost": 1.6, "returnRate": 0.04, "weights": {"outlet-1": 0.8, "outlet-2": 0.9, "outlet-3": 1.8, "outlet-4": 1.0, "outlet-5": 0.5}, "trend": 0.01},
    {"id": "prod-25", "name": "Chocolate Bar", "category": "Snacks", "cost": 0.50, "price": 1.79, "baseDemand": 21, "volatility": 0.30, "seasonalPeak": 340, "weekendBoost": 1.35, "returnRate": 0.02, "weights": {"outlet-1": 0.9, "outlet-2": 1.0, "outlet-3": 1.5, "outlet-4": 0.6, "outlet-5": 1.3}, "trend": 0.0},
    {"id": "prod-26", "name": "Peanut Butter 500g", "category": "Cooking Essentials", "cost": 1.50, "price": 4.49, "baseDemand": 6, "volatility": 0.12, "seasonalPeak": None, "weekendBoost": 1.05, "returnRate": 0.01, "weights": {"outlet-1": 1.0, "outlet-2": 0.8, "outlet-3": 0.6, "outlet-4": 1.2, "outlet-5": 0.4}, "trend": 0.0},
    {"id": "prod-27", "name": "Instant Noodles", "category": "Grains & Pasta", "cost": 0.30, "price": 1.29, "baseDemand": 26, "volatility": 0.30, "seasonalPeak": 350, "weekendBoost": 1.4, "returnRate": 0.02, "weights": {"outlet-1": 0.8, "outlet-2": 0.9, "outlet-3": 1.2, "outlet-4": 0.6, "outlet-5": 2.0}, "trend": 0.02},
    {"id": "prod-28", "name": "Detergent 1L", "category": "Household", "cost": 1.50, "price": 4.99, "baseDemand": 7, "volatility": 0.10, "seasonalPeak": None, "weekendBoost": 1.0, "returnRate": 0.02, "weights": {"outlet-1": 1.1, "outlet-2": 0.8, "outlet-3": 0.5, "outlet-4": 1.4, "outlet-5": 0.4}, "trend": 0.0},
    {"id": "prod-29", "name": "Toilet Paper (6 rolls)", "category": "Household", "cost": 1.20, "price": 3.99, "baseDemand": 9, "volatility": 0.08, "seasonalPeak": None, "weekendBoost": 1.0, "returnRate": 0.02, "weights": {"outlet-1": 1.1, "outlet-2": 0.9, "outlet-3": 0.6, "outlet-4": 1.3, "outlet-5": 0.5}, "trend": 0.0},
    {"id": "prod-30", "name": "Hand Soap", "category": "Household", "cost": 0.80, "price": 2.49, "baseDemand": 8, "volatility": 0.12, "seasonalPeak": 350, "weekendBoost": 1.0, "returnRate": 0.02, "weights": {"outlet-1": 1.0, "outlet-2": 0.9, "outlet-3": 0.7, "outlet-4": 1.2, "outlet-5": 0.5}, "trend": 0.01},
    {"id": "prod-31", "name": "Soda Can 330ml", "category": "Beverages", "cost": 0.30, "price": 1.29, "baseDemand": 30, "volatility": 0.35, "seasonalPeak": 170, "weekendBoost": 1.6, "returnRate": 0.03, "weights": {"outlet-1": 0.7, "outlet-2": 0.9, "outlet-3": 1.8, "outlet-4": 0.4, "outlet-5": 2.5}, "trend": 0.01},
    {"id": "prod-32", "name": "Energy Drink 250ml", "category": "Beverages", "cost": 0.50, "price": 2.49, "baseDemand": 14, "volatility": 0.40, "seasonalPeak": 170, "weekendBoost": 1.7, "returnRate": 0.03, "weights": {"outlet-1": 0.6, "outlet-2": 0.8, "outlet-3": 1.6, "outlet-4": 0.3, "outlet-5": 2.2}, "trend": 0.05},
    {"id": "prod-33", "name": "Sunflower Oil 1L", "category": "Cooking Essentials", "cost": 1.30, "price": 3.49, "baseDemand": 11, "volatility": 0.12, "seasonalPeak": None, "weekendBoost": 1.05, "returnRate": 0.01, "weights": {"outlet-1": 1.2, "outlet-2": 0.8, "outlet-3": 0.4, "outlet-4": 1.4, "outlet-5": 0.5}, "trend": 0.0},
    {"id": "prod-34", "name": "Canned Beans 400g", "category": "Grains & Pasta", "cost": 0.40, "price": 1.49, "baseDemand": 9, "volatility": 0.15, "seasonalPeak": None, "weekendBoost": 1.1, "returnRate": 0.01, "weights": {"outlet-1": 1.0, "outlet-2": 0.8, "outlet-3": 0.5, "outlet-4": 1.1, "outlet-5": 0.7}, "trend": -0.01},
    {"id": "prod-35", "name": "Honey 500g", "category": "Cooking Essentials", "cost": 2.00, "price": 6.99, "baseDemand": 4, "volatility": 0.20, "seasonalPeak": 340, "weekendBoost": 1.1, "returnRate": 0.01, "weights": {"outlet-1": 1.0, "outlet-2": 0.9, "outlet-3": 0.7, "outlet-4": 1.1, "outlet-5": 0.3}, "trend": 0.01},
    {"id": "prod-36", "name": "Coffee 200g", "category": "Beverages", "cost": 2.50, "price": 7.99, "baseDemand": 8, "volatility": 0.18, "seasonalPeak": 350, "weekendBoost": 1.15, "returnRate": 0.02, "weights": {"outlet-1": 1.1, "outlet-2": 1.2, "outlet-3": 0.8, "outlet-4": 1.0, "outlet-5": 0.5}, "trend": 0.02},
    {"id": "prod-37", "name": "Chewing Gum", "category": "Snacks", "cost": 0.20, "price": 0.99, "baseDemand": 16, "volatility": 0.25, "seasonalPeak": None, "weekendBoost": 1.4, "returnRate": 0.02, "weights": {"outlet-1": 0.7, "outlet-2": 0.9, "outlet-3": 1.8, "outlet-4": 0.4, "outlet-5": 1.5}, "trend": -0.02},
    {"id": "prod-38", "name": "Baby Diapers", "category": "Household", "cost": 4.00, "price": 12.99, "baseDemand": 5, "volatility": 0.10, "seasonalPeak": None, "weekendBoost": 1.0, "returnRate": 0.03, "weights": {"outlet-1": 1.0, "outlet-2": 0.7, "outlet-3": 0.3, "outlet-4": 1.5, "outlet-5": 0.2}, "trend": 0.01},
    {"id": "prod-39", "name": "Shampoo 400ml", "category": "Household", "cost": 1.50, "price": 5.49, "baseDemand": 5, "volatility": 0.10, "seasonalPeak": None, "weekendBoost": 1.0, "returnRate": 0.02, "weights": {"outlet-1": 1.1, "outlet-2": 0.9, "outlet-3": 0.6, "outlet-4": 1.2, "outlet-5": 0.4}, "trend": 0.0},
    {"id": "prod-40", "name": "Toothpaste", "category": "Household", "cost": 0.80, "price": 2.99, "baseDemand": 7, "volatility": 0.10, "seasonalPeak": None, "weekendBoost": 1.0, "returnRate": 0.02, "weights": {"outlet-1": 1.0, "outlet-2": 0.9, "outlet-3": 0.6, "outlet-4": 1.2, "outlet-5": 0.4}, "trend": 0.0},
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
            if r < 0.08:
                sp = StockProfile(0.3 + rng() * 0.4, 0, 0, True,
                                  int(total_days * (0.3 + rng() * 0.4)), total_days)
            elif r < 0.20:
                sp = StockProfile(8 + rng() * 15, 4 + rng() * 4, 2.5 + rng() * 3, False, 0, 0)
            elif r < 0.35:
                sp = StockProfile(0.4 + rng() * 0.6, 10 + rng() * 8, 0.5 + rng() * 0.5, False, 0, 0)
            elif r < 0.50:
                start = int(total_days * (0.5 + rng() * 0.3))
                sp = StockProfile(2 + rng() * 3, 7 + rng() * 5, 1 + rng() * 0.5, True,
                                  start, min(total_days, start + int(20 + rng() * 40)))
            else:
                sp = StockProfile(1.5 + rng() * 3, 5 + rng() * 6, 1 + rng() * 1.5, False, 0, 0)
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
                    qty = int(profile["baseDemand"] * w * sp.reorder_qty_mult * (0.8 + rng() * 0.4))
                    stock[oid][pid] += qty

                if stock[oid][pid] < profile["baseDemand"] * w * 0.3 * 0.3 and rng() < 0.4 and not in_supply_issue:
                    stock[oid][pid] += int(profile["baseDemand"] * w * 5)

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
