#!/usr/bin/env python3
"""
Build the curated sample_data set for the Inventory Intelligence demo (cakes).

Two product domains, standing next to each other:

  1. CAKES  - forecast, actual transfers and the dashboard track ~30 kinds of
              cake sold through 20 branches over 6 months (Mar-Aug 2026).

  2. RAW MATERIALS - the MRP / ROP pages plan and reorder the ingredients used
              to bake those cakes. The MRP monthly requirement for each raw
              material is a standalone number (a planning figure), and the ROP
              stock snapshot drives a deliberate green/red mix.

Consistency layers (same idea as before):
  - Layer 1: product-level forecast bias  (some cakes systematically under- or
             over-forecast in every branch/month).
  - Layer 2: branch-level supply reliability curve that evolves smoothly over
             the 6 months.
  - Layer 3: documented zero-receipt outage events.

  actual = forecast x sku_bias x branch_reliability(period)

Forecast periods are calendar months: P1 = March 2026 ... P6 = August 2026.
"""
from math import ceil
from pathlib import Path
import random

import pandas as pd

HERE = Path(__file__).resolve().parent.parent
SAMPLES = HERE / "sample_data"
SAMPLES.mkdir(parents=True, exist_ok=True)

BRANCHES = ["BR-A", "BR-B", "BR-C", "BR-D", "BR-E", "BR-F", "BR-G", "BR-H", "BR-I",
            "BR-J", "BR-K", "BR-L", "BR-M", "BR-N", "BR-O", "BR-P", "BR-Q", "BR-R",
            "BR-S", "BR-T"]
BRANCH_SHARE = {
    "BR-A": 0.12, "BR-B": 0.10, "BR-C": 0.09, "BR-D": 0.08, "BR-E": 0.07,
    "BR-F": 0.06, "BR-G": 0.06, "BR-H": 0.05, "BR-I": 0.05, "BR-J": 0.05,
    "BR-K": 0.04, "BR-L": 0.04, "BR-M": 0.03, "BR-N": 0.03, "BR-O": 0.03,
    "BR-P": 0.03, "BR-Q": 0.02, "BR-R": 0.02, "BR-S": 0.02, "BR-T": 0.01,
}

PERIODS = [(1, 3, 2026), (2, 4, 2026), (3, 5, 2026), (4, 6, 2026), (5, 7, 2026), (6, 8, 2026)]

# ---------- Cakes: (code, name, chain_base_demand_march, seasonality[6]) ----------
CAKES = [
    ("CAKE-001", "Chocolate Fudge Cake", 420, [1.00, 1.05, 1.18, 1.25, 1.15, 1.05]),
    ("CAKE-002", "Vanilla Sponge Cake", 360, [1.00, 1.00, 1.02, 1.05, 1.05, 1.04]),
    ("CAKE-003", "Red Velvet Cake", 220, [1.00, 0.98, 1.10, 1.18, 1.20, 1.10]),
    ("CAKE-004", "Lemon Drizzle Cake", 200, [1.00, 0.95, 0.90, 0.85, 0.85, 0.80]),
    ("CAKE-005", "Carrot Cake", 180, [1.00, 1.00, 1.05, 1.10, 1.12, 1.10]),
    ("CAKE-006", "Black Forest Cake", 260, [1.00, 1.02, 1.05, 1.12, 1.20, 1.28]),
    ("CAKE-007", "Strawberry Shortcake", 240, [1.00, 1.10, 1.20, 1.30, 1.35, 1.28]),
    ("CAKE-008", "Whole-Wheat Cake", 150, [1.00, 1.00, 1.00, 1.00, 1.00, 1.00]),
    ("CAKE-009", "Pineapple Upside-Down Cake", 190, [1.00, 1.02, 1.06, 1.10, 1.12, 1.10]),
    ("CAKE-010", "Butter Cake", 340, [1.00, 1.00, 1.02, 1.05, 1.06, 1.05]),
    ("CAKE-011", "German Chocolate Cake", 240, [1.00, 1.03, 1.08, 1.12, 1.15, 1.10]),
    ("CAKE-012", "Tiramisu Cake", 260, [1.00, 1.05, 1.15, 1.22, 1.18, 1.08]),
    ("CAKE-013", "Cheesecake", 280, [1.00, 1.00, 1.10, 1.16, 1.20, 1.15]),
    ("CAKE-014", "Banana Walnut Cake", 190, [1.00, 1.00, 1.03, 1.06, 1.05, 1.05]),
    ("CAKE-015", "Apple Cinnamon Cake", 200, [1.00, 0.98, 0.95, 0.92, 0.90, 0.85]),
    ("CAKE-016", "Coconut Cake", 170, [1.00, 1.02, 1.05, 1.08, 1.06, 1.04]),
    ("CAKE-017", "Marble Cake", 230, [1.00, 1.00, 1.02, 1.04, 1.05, 1.03]),
    ("CAKE-018", "Mango Mousse Cake", 210, [1.00, 1.12, 1.26, 1.30, 1.22, 1.10]),
    ("CAKE-019", "Blueberry Muffin Tray", 300, [1.00, 1.02, 1.05, 1.08, 1.10, 1.06]),
    ("CAKE-020", "Almond Gateau", 180, [1.00, 1.00, 1.05, 1.10, 1.12, 1.08]),
    ("CAKE-021", "Hazelnut Praline Cake", 160, [1.00, 1.03, 1.08, 1.10, 1.08, 1.05]),
    ("CAKE-022", "Orange Chiffon Cake", 200, [1.00, 1.05, 1.10, 1.08, 1.05, 1.00]),
    ("CAKE-023", "Pistachio Cake", 150, [1.00, 0.98, 0.95, 0.92, 0.90, 0.88]),
    ("CAKE-024", "Tres Leches Cake", 190, [1.00, 1.06, 1.12, 1.18, 1.12, 1.06]),
    ("CAKE-025", "Honey Cake", 140, [1.00, 1.00, 1.02, 1.04, 1.05, 1.02]),
    ("CAKE-026", "Coffee Cake", 220, [1.00, 1.00, 0.98, 0.95, 0.92, 0.88]),
    ("CAKE-027", "Fruit Gateau", 250, [1.00, 1.04, 1.10, 1.14, 1.16, 1.12]),
    ("CAKE-028", "Coconut Macaroon Tray", 130, [1.00, 1.00, 1.03, 1.06, 1.05, 1.04]),
    ("CAKE-029", "Lemon Meringue Cake", 170, [1.00, 1.06, 1.12, 1.10, 1.05, 0.98]),
    ("CAKE-030", "Truffle Brownie Cake", 260, [1.00, 1.03, 1.08, 1.20, 1.28, 1.22]),
]

# ---------- Raw materials: (code, name, unit, monthly MRP requirement) ----------
# Monthly requirement is a standalone planning figure for this bakery.
RAW_MATERIALS = [
    ("RM-001", "Wheat Flour", "kg", 420),
    ("RM-002", "Sugar", "kg", 300),
    ("RM-003", "Butter", "kg", 240),
    ("RM-004", "Eggs", "pcs", 4200),
    ("RM-005", "Milk", "l", 210),
    ("RM-006", "Cocoa Powder", "kg", 90),
    ("RM-007", "Baking Powder", "kg", 12),
    ("RM-008", "Vanilla Essence", "ml", 900),
    ("RM-009", "Whipping Cream", "l", 160),
    ("RM-010", "Strawberry Jam", "kg", 110),
    ("RM-011", "Icing Sugar", "kg", 130),
    ("RM-012", "Lemon Extract", "ml", 300),
]

RAW_MATERIALS_BY_CODE = {c: (n, u, q) for c, n, u, q in RAW_MATERIALS}

# ---------- Layer 1: cake-level forecast bias (persistent) ----------
UNDER_CAKES = {"CAKE-001", "CAKE-006", "CAKE-007", "CAKE-013", "CAKE-018", "CAKE-030"}   # demand > forecast
OVER_CAKES = {"CAKE-003", "CAKE-004", "CAKE-008", "CAKE-015", "CAKE-023", "CAKE-026"}    # forecast > demand

CAKE_BIAS = {}
for _code, *_ in CAKES:
    if _code in UNDER_CAKES:
        CAKE_BIAS[_code] = 1.32
    elif _code in OVER_CAKES:
        CAKE_BIAS[_code] = 0.68
    else:
        CAKE_BIAS[_code] = 1.00

# ---------- Layer 2: branch supply reliability by period (evolves smoothly) ----------
#   1.00 = deliveries match forecast, <1 shortage, >1 surplus.
BRANCH_RELIABILITY = {
    "BR-A": [0.72, 0.88, 0.92, 1.06, 1.14, 0.92],  # short spring, recovers by summer, August dip
    "BR-B": [0.98, 1.02, 0.98, 0.98, 1.00, 0.96],  # dependable
    "BR-C": [0.98, 1.00, 0.98, 1.10, 0.90, 0.88],  # mild swings, June peak
    "BR-D": [0.82, 0.30, 0.92, 1.08, 0.88, 0.90],  # April supply failure, then recovery
    "BR-E": [1.00, 1.10, 0.92, 1.00, 1.30, 0.55],  # July surge, August collapse
    "BR-F": [1.02, 1.00, 1.04, 0.98, 1.00, 1.02],  # steady surplus
    "BR-G": [0.95, 0.97, 1.00, 1.02, 1.00, 0.90],  # consistent
    "BR-H": [0.85, 0.90, 1.00, 1.10, 1.05, 0.95],  # recovering
    "BR-I": [1.05, 1.08, 1.00, 0.95, 0.90, 1.00],  # cools down then back
    "BR-J": [0.90, 0.88, 0.85, 0.90, 0.95, 1.00],  # chronically short
    "BR-K": [1.00, 1.00, 1.10, 1.00, 0.95, 0.85],  # fading summer
    "BR-L": [0.95, 0.95, 0.98, 1.05, 1.10, 0.95],  # mild swing
    "BR-M": [0.80, 0.85, 0.90, 0.95, 1.00, 1.05],  # steady recovery
    "BR-N": [1.10, 1.05, 1.00, 0.95, 0.90, 0.85],  # declining
    "BR-O": [0.92, 0.95, 1.02, 1.08, 1.12, 1.00],  # strong summer
    "BR-P": [0.98, 0.99, 1.01, 1.02, 1.00, 0.95],  # near perfect (star performer)
    "BR-Q": [1.00, 0.95, 0.90, 0.95, 1.00, 1.05],  # wavy
    "BR-R": [0.88, 0.92, 0.96, 1.00, 1.04, 0.90],  # gentle recovery, August dip
    "BR-S": [0.75, 0.80, 0.90, 0.95, 1.05, 1.10],  # weak first half
    "BR-T": [1.00, 1.00, 0.90, 0.80, 0.85, 0.70],  # August collapse (small branch)
}

# ---------- Layer 3: documented outage events (true zero receipts) ----------
# branch, period -> cakes that received nothing that month.
OUTAGES = {
    ("BR-D", 2): ["CAKE-001", "CAKE-003", "CAKE-006", "CAKE-013", "CAKE-024"],  # April supply failure
    ("BR-T", 6): ["CAKE-002", "CAKE-009", "CAKE-017", "CAKE-021"],             # August collapse
}

# ---------- Stock coverage per raw material (drives the ROP green/red mix) ----------
# >1.0 stock covers August MRP requirement (SAFE), <1.0 is short (ORDER).
STOCK_COVERAGE = {
    "RM-001": 1.50,  # Wheat Flour   - plenty
    "RM-002": 1.10,  # Sugar         - ok
    "RM-003": 0.35,  # Butter        - short
    "RM-004": 0.20,  # Eggs          - very short
    "RM-005": 0.70,  # Milk          - short
    "RM-006": 1.25,  # Cocoa Powder  - ok
    "RM-007": 1.00,  # Baking Powder - exact cover
    "RM-008": 0.90,  # Vanilla       - slightly short
    "RM-009": 1.40,  # Whipping Cream- ok
    "RM-010": 0.30,  # Strawberry Jam- short
    "RM-011": 1.05,  # Icing Sugar   - ok
    "RM-012": 1.70,  # Lemon Extract - plenty
}

# ---------- Extended materials (flat MRP/ROP catalog, no branch/cake coupling) ----------
# Deterministic expansion to a 60-material master list. Coverage for the added
# materials follows a repeating 12-step pattern so the ROP mix stays balanced
# (SAFE / overstocked >25% / ORDER) instead of being hand-tuned per row.
EXTRA_RAW_MATERIALS = [
    # (name, unit, base monthly qty)
    ("Rye Flour", "kg", 180),
    ("Whole Wheat Flour", "kg", 210),
    ("Cornflour", "kg", 95),
    ("Oat Flour", "kg", 120),
    ("Almond Flour", "kg", 160),
    ("Rice Flour", "kg", 85),
    ("Semolina", "kg", 70),
    ("Brown Sugar", "kg", 240),
    ("Caster Sugar", "kg", 320),
    ("Honey", "kg", 65),
    ("Golden Syrup", "kg", 90),
    ("Maple Syrup", "l", 40),
    ("Glucose Syrup", "kg", 75),
    ("Molasses", "kg", 25),
    ("Demerara Sugar", "kg", 110),
    ("Vegetable Oil", "l", 120),
    ("Sunflower Oil", "l", 45),
    ("Olive Oil", "l", 30),
    ("Shortening", "kg", 60),
    ("Ghee", "kg", 35),
    ("Cream Cheese", "kg", 140),
    ("Sour Cream", "l", 80),
    ("Condensed Milk", "l", 55),
    ("Buttermilk", "l", 70),
    ("Fresh Cream", "l", 200),
    ("Yogurt", "kg", 90),
    ("Yeast", "kg", 4),
    ("Cream of Tartar", "kg", 6),
    ("Cinnamon", "kg", 5),
    ("Nutmeg", "kg", 2),
    ("Cardamom", "kg", 3),
    ("Ginger Powder", "kg", 4),
    ("Coffee Extract", "l", 8),
    ("Vanilla Bean Paste", "l", 6),
    ("Almond Essence", "l", 3),
    ("Cocoa Butter", "kg", 12),
    ("Dark Chocolate", "kg", 85),
    ("White Chocolate", "kg", 75),
    ("Chocolate Chips", "kg", 95),
    ("Caramel", "kg", 60),
    ("Hazelnut Spread", "kg", 70),
    ("Raspberry Jam", "kg", 50),
    ("Blueberry Jam", "kg", 45),
    ("Mango Puree", "kg", 40),
    ("Coconut Flakes", "kg", 35),
    ("Chopped Nuts", "kg", 55),
    ("Peanut Butter", "kg", 40),
    ("Lemon Curd", "kg", 25),
]

_COVERAGE_CYCLE = [1.50, 1.10, 0.90, 0.65, 1.05, 0.45, 1.25, 1.00, 0.75, 1.60, 1.20, 0.80]

for _i, (_name, _unit, _qty) in enumerate(EXTRA_RAW_MATERIALS):
    _code = f"RM-{len(RAW_MATERIALS) + 1:03d}"
    RAW_MATERIALS.append((_code, _name, _unit, _qty))
    STOCK_COVERAGE[_code] = _COVERAGE_CYCLE[_i % len(_COVERAGE_CYCLE)]
RAW_MATERIALS_BY_CODE = {c: (n, u, q) for c, n, u, q in RAW_MATERIALS}


def forecast_qty(base, season, branch):
    return round(base * season * BRANCH_SHARE[branch])


def actual_qty(code, base, season, branch, period):
    if code in OUTAGES.get((branch, period), ()):
        return 0
    forecast = forecast_qty(base, season, branch)
    factor = CAKE_BIAS[code] * BRANCH_RELIABILITY[branch][period - 1]
    return max(0, round(forecast * factor))


def status_of(forecast, actual):
    if forecast == 0:
        return "accurate"
    pct = (forecast - actual) / forecast * 100
    if pct > 20:
        return "over-forecast"
    if pct < -20:
        return "under-forecast"
    return "accurate"


def month_name(month):
    return {3: "March", 4: "April", 5: "May", 6: "June", 7: "July", 8: "August"}[month]


def month_end(month):
    return {3: "2026-03-31", 4: "2026-04-30", 5: "2026-05-31",
            6: "2026-06-30", 7: "2026-07-31", 8: "2026-08-31"}[month]


# ---------- 1. Forecast entries per period (cakes) ----------
total_forecast = 0
for period, month, year in PERIODS:
    rows = []
    for code, name, base, seas in CAKES:
        for branch in BRANCHES:
            rows.append({
                "item_no": code,
                "item_name": name,
                "branch": branch,
                "quantity": forecast_qty(base, seas[period - 1], branch),
                "date": f"{year:04d}-{month:02d}-01",
            })
    pd.DataFrame(rows).to_csv(SAMPLES / f"forecast_p{period}.csv", index=False)
    total_forecast += len(rows)
    print(f"forecast_p{period}.csv: {len(rows)} rows")
print(f"forecast total: {total_forecast}")

# ---------- 2. Actual transfers per month (cakes) ----------
# Each delivery is a separate receipt: same cake+outlet can arrive in multiple
# batches on different days; ~6% of SKU-outlet-month combos get no delivery at all
# (a real stockout -> 0 received, flagged over-forecast upstream).
_rng = random.Random(2026)


def _split_total(total, n):
    if n == 1:
        return [total]
    cuts = sorted(_rng.sample(range(1, total), n - 1))
    parts = []
    prev = 0
    for c in cuts + [total]:
        parts.append(c - prev)
        prev = c
    return parts


def _delivery_rows(branch, code, name, base, seas, period, month, year):
    monthly = actual_qty(code, base, seas[period - 1], branch, period)
    if code in OUTAGES.get((branch, period), ()):
        return []
    if monthly <= 0 or _rng.random() < 0.06:
        return []
    n = min(_rng.choices([1, 2, 3, 4, 5], weights=[40, 25, 18, 10, 7])[0], monthly)
    parts = _split_total(monthly, n)
    days = sorted(_rng.sample(range(1, int(month_end(month)[-2:]) + 1), n))
    return [
        {
            "branch_code": branch,
            "item_code": code,
            "item_name": name,
            "quantity": qty,
            "date": f"{year:04d}-{month:02d}-{day:02d}",
        }
        for qty, day in zip(parts, days)
    ]


rows = []
for period, month, year in PERIODS:
    for branch in BRANCHES:
        for code, name, base, seas in CAKES:
            rows += _delivery_rows(branch, code, name, base, seas, period, month, year)
transfers = pd.DataFrame(rows)
transfers.to_csv(SAMPLES / "actual_transfers.csv", index=False)
print(f"actual_transfers.csv: {len(rows)} rows")
diag = transfers.groupby("branch_code").size().to_dict()
print("  deliveries per branch:", diag)

# ---------- 3. MRP - raw materials (standalone monthly requirements) ----------
mrp_qty = {code: qty for code, _, _, qty in RAW_MATERIALS}
mrp = []
for rm_code, rm_name, unit, req_qty in RAW_MATERIALS:
    mrp.append({
        "Row Label": rm_code,
        "Requirement Name": rm_name,
        "Requirement Quantity": req_qty,
        "Unit": unit,
    })
pd.DataFrame(mrp).to_excel(SAMPLES / "MRP_full.xlsx", index=False)
print(f"MRP_full.xlsx: {len(mrp)} rows")

# ---------- 4. Raw-material stock snapshot (drives the ROP mix) ----------
rows = []
for rm_code, rm_name, _unit, _qty in RAW_MATERIALS:
    rows.append({
        "Item Code": rm_code,
        "Item Name": rm_name,
        "Stock on Hand": max(0, int(round(mrp_qty[rm_code] * STOCK_COVERAGE[rm_code]))),
    })
stock = pd.DataFrame(rows)
stock.to_csv(SAMPLES / "stock_on_hand.csv", index=False)
print(f"stock_on_hand.csv: {len(stock)} rows")

# ---------- 5. Accurate forecast (July = period 5 actuals, cakes) ----------
acc = []
for code, name, base, seas in CAKES:
    for branch in BRANCHES:
        acc.append({
            "item_no": code,
            "item_name": name,
            "branch": branch,
            "quantity": actual_qty(code, base, seas[4], branch, 5),
            "date": "2026-07-31",
        })
pd.DataFrame(acc).to_csv(SAMPLES / "accurate_forecast.csv", index=False)
print(f"accurate_forecast.csv: {len(acc)} rows")

# ---------- 6. Write a scenario record ----------
lines = [
    "# Sample Data Scenario Record",
    "",
    "Generated from `scripts/build_sample_data.py`.",
    "",
    "## Two product domains, deliberately connected",
    "",
    "- **Cakes** (forecast, actual transfers, dashboard): 30 kinds of cake sold through 20 branches over",
    "  Mar-Aug 2026. Model: `actual = round(forecast x cake_bias x branch_reliability)`.",
    "- **Raw materials** (MRP and ROP): 12 ingredients used to bake those cakes. Each raw material's",
    "  monthly requirement in `MRP_full.xlsx` is a standalone planning figure. `stock_on_hand.csv` is",
    "  a raw-material stock snapshot whose coverage (see `STOCK_COVERAGE`) drives the ROP green/red mix.",
    "",
    "## Branch reliability curves",
    "",
    "| Branch | Mar | Apr | May | Jun | Jul | Aug |",
    "|---|---|---|---|---|---|---|",
]
for b in BRANCHES:
    vals = " | ".join(f"{v:.2f}" for v in BRANCH_RELIABILITY[b])
    lines.append(f"| {b} | {vals} |")
lines += [
    "",
    "## Per period / branch outcome (cakes)",
    "",
    "| Period | Month | Branch | Kind | Forecast | Actual | Ratio | Accurate | Over | Under | Note |",
    "|---|---|---|---|---|---|---|---|---|---|---|",
]

for period, month, year in PERIODS:
    for branch in BRANCHES:
        tf = ta = 0
        n_acc = n_over = n_under = 0
        for code, name, base, seas in CAKES:
            f = forecast_qty(base, seas[period - 1], branch)
            a = actual_qty(code, base, seas[period - 1], branch, period)
            tf += f
            ta += a
            s = status_of(f, a)
            if s == "over-forecast":
                n_over += 1
            elif s == "under-forecast":
                n_under += 1
            else:
                n_acc += 1
        ratio = ta / tf
        if (branch, period) in OUTAGES:
            kind = "outage"
        elif ratio < 0.90:
            kind = "short"
        elif ratio > 1.10:
            kind = "surplus"
        elif n_over >= 4 or n_under >= 4:
            kind = "volatile"
        elif n_acc >= 8:
            kind = "accurate"
        else:
            kind = "balanced"
        note = "zero receipts" if (branch, period) in OUTAGES else ""
        lines.append(
            f"| {period} | {month_name(month)} | {branch} | {kind} | {tf} | {ta} | "
            f"{ratio:.2f} | {n_acc} | {n_over} | {n_under} | {note} |"
        )

lines += [
    "",
    "## Raw material MRP requirement and stock",
    "",
    "| Code | Material | Unit | MRP monthly | Stock on hand | ROP action |",
    "|---|---|---|---|---|---|",
]
for rm_code, rm_name, _unit, _qty in RAW_MATERIALS:
    stock_qty = max(0, int(round(mrp_qty[rm_code] * STOCK_COVERAGE[rm_code])))
    action = "SAFE" if stock_qty >= mrp_qty[rm_code] else f"ORDER {max(0, mrp_qty[rm_code] - stock_qty)}"
    lines.append(f"| {rm_code} | {rm_name} | {_unit} | {mrp_qty[rm_code]} | {stock_qty} | {action} |")

(SAMPLES / "SCENARIOS.md").write_text("\n".join(lines) + "\n")
print("SCENARIOS.md written")
print("Done.")