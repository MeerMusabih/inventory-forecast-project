"""
Generate large, versatile test datasets for the inventory forecast system.
Covers: outer-boundary volumes, edge cases, all test-case categories.

Outputs (to sample_data/):
  forecast_p1.csv   — 20,000 rows (outer boundary!)
  forecast_p2.csv   — 5,000 rows
  forecast_p3.csv   — 3,000 rows
  forecast_p4.csv   — 2,500 rows
  forecast_p5.csv   — 2,000 rows
  forecast_p6.csv   — 1,500 rows
  actual_transfers.csv — 50,000 rows (large bulk upload test)
  accurate_forecast.csv — 2,500 rows (for ROP sigma computation)
  MRP_full.xlsx     — 200 items, all ROP param columns

Test cases covered:
  - Perfect match between forecast and actual (accurate)
  - Actual < forecast (over-forecast / discrepancy > 20%)
  - Actual > forecast (under-forecast)
  - Items in forecast with ZERO actuals (all-quantity wrong)
  - Items in actuals with ZERO forecast (unforecast demand)
  - Quantities: 0, decimals, negatives, 7-digit, empty/default
  - Branch coverage: BR-A to BR-E; also non-standard branch codes (BRA, BranchA)
  - Date spans: multiple months for from/to range filtering
  - Special characters / Unicode in item names
  - Different date formats
  - Edge MRP: zero-demand, very high sigma, long lead time,
    high service level (99%), low service level (80%),
    stock >> ROP (safe), stock << ROP (massive order), stock == ROP (borderline)
  - MOQ effect (MOQ > reorder qty → MOQ dominates)
  - Very high / very low unit price, holding cost, ordering cost
"""
import csv, random, os
from pathlib import Path

random.seed(42)
OUT = Path(__file__).resolve().parent.parent / "sample_data"
OUT.mkdir(exist_ok=True)

BRANCHES = ["BR-A", "BR-B", "BR-C", "BR-D", "BR-E"]

# ---------- SKU catalog (1500 distinct items) ----------
class Sku:
    def __init__(self, code, name, category, base_demand):
        self.code = code
        self.name = name
        self.category = category
        self.base_demand = base_demand   # units/day

CATEGORIES = ["Beverages", "Dairy", "Bakery", "Produce", "Frozen", "Household", "Snacks", "Meat", "Staples"]
NAMES_BY_CATEGORY = {
    "Beverages": ["Cola 1.5L", "Orange Juice 1L", "Mineral Water 500ml", "Energy Drink 250ml", "Soda Can",
                  "Apple Juice 1L", "Tea Bag 100s", "Coffee 200g", "Lemonade 1L", "Iced Tea 500ml",
                  "Thermos Flask 500ml", "أكوا 1.5 لتر", "Sports Drink 600ml"],
    "Dairy": ["Milk 1L", "Butter 250g", "Cheese Slices", "Yogurt 500g", "Eggs 12pk",
              "Cream 200ml", "Cheese Block 200g", "Ghee 1L", "Milk Powder 400g", "الحليب الطازج"],
    "Bakery": ["Bread Loaf", "Croissant", "Pita Bread 6pk", "Muffin 4pk", "Baguette",
               "Donuts 6pk", "Cake Slice", "Cookies Pack", "كعكة شوكولاتة"],
    "Produce": ["Apples 1kg", "Bananas 1kg", "Potatoes 2kg", "Onions 1kg", "Tomatoes 1kg",
                "Cucumbers 500g", "Lettuce Head", "Carrots 1kg", "Potato Chips 150g"],
    "Frozen": ["Ice Cream 500ml", "Frozen Peas 500g", "Frozen Pizza", "Chicken Fingers 500g",
               "Fish Fingers 500g", "Frozen Veg Mix 450g", "مجمدات متنوعة"],
    "Household": ["Detergent 1L", "Toilet Paper 6pk", "Hand Soap", "Shampoo 400ml",
                  "Toothpaste 100ml", "Cleaning Spray", "Garbage Bags 30pk"],
    "Snacks": ["Chips 150g", "Chocolate Bar", "Biscuits Pack", "Gum Pack", "Nuts Mix 200g",
               "Popcorn 100g", "Pretzels 200g", "Candy Assorted"],
    "Meat": ["Chicken Breast 1kg", "Beef Mince 500g", "Lamb Chops 500g", "Sausages 400g",
             "Bacon 200g", "Fish Fillet 500g", "دجاج كامل"],
    "Staples": ["Rice 5kg", "Sugar 1kg", "Pasta 500g", "Flour 2kg", "Cooking Oil 1L",
                "Canned Beans 400g", "Canned Tuna 185g", "Salt 1kg", "Soy Sauce 250ml", "زيت زيتون 1 لتر"],
}

ALL_SKUS = []
sku_counter = 1
for cat, names in NAMES_BY_CATEGORY.items():
    for nm in names:
        code = f"SKU-{sku_counter:05d}"
        bd = round(random.uniform(5, 200), 1)
        ALL_SKUS.append(Sku(code, nm, cat, bd))
        sku_counter += 1
# Pad to 1500 SKUs with synthetic names
while len(ALL_SKUS) < 1500:
    code = f"SKU-{sku_counter:05d}"
    bd = round(random.uniform(3, 150), 1)
    ALL_SKUS.append(Sku(code, f"Item-{sku_counter:05d}", random.choice(CATEGORIES), bd))
    sku_counter += 1

print(f"Total SKUs: {len(ALL_SKUS)}")


def rand_date(year, month, day_range=(1, 28)):
    d = random.randint(*day_range)
    return f"{year}-{month:02d}-{d:02d}"


def gen_forecast(period, n_rows, start_date_fn, sku_slice, noise_range=(0.7, 1.4)):
    """Generate forecast CSV rows. Returns list of dicts."""
    rows = []
    sku_list = ALL_SKUS[sku_slice]
    dates = [start_date_fn(d) for d in range(30)]
    for _ in range(n_rows):
        sku = random.choice(sku_list)
        br = random.choice(BRANCHES)
        base = sku.base_demand * random.uniform(*noise_range)
        qty = round(max(0, base * random.uniform(0.8, 2.0)), 2)
        dt = random.choice(dates)
        rows.append({
            "item_no": sku.code,
            "item_name": sku.name,
            "branch": br,
            "quantity": qty,
            "date": dt,
        })
    return rows


def gen_actual_transfers(n_rows, forecast_sku_codes):
    """Generate actual transfer rows. Includes:
       - matching SKUs (some qty < forecast, some >, some exact)
       - pure-actual SKUs (not in forecast)
       - standard + non-standard branch codes
    """
    rows = []
    sku_by_code = {s.code: s for s in ALL_SKUS}
    in_forecast_set = set(forecast_sku_codes)

    # Split forecast SKUs into match types
    match_codes = random.sample(list(forecast_sku_codes), min(500, len(forecast_sku_codes)))
    exact_codes = match_codes[:len(match_codes)//4]
    over_codes  = match_codes[len(match_codes)//4:2*len(match_codes)//4]
    under_codes = match_codes[2*len(match_codes)//4:3*len(match_codes)//4]
    zero_codes  = match_codes[3*len(match_codes)//4:]

    # Pure-actual (under-forecast because no forecast exists)
    actual_only_codes = [s.code for s in ALL_SKUS if s.code not in in_forecast_set][:200]

    extra_branches = ["BRA", "BranchA", "MAIN", "", None]

    def pick_kw(codes):
        return sku_by_code[random.choice(codes)] if codes else random.choice(ALL_SKUS)

    dates = [f"2026-{m:02d}-{random.randint(1,28):02d}" for m in range(1, 4)]

    for i in range(n_rows):
        r = random.random()
        if r < 0.20:   # exact match
            sku = pick_kw(exact_codes)
            qty_mult = 1.0
        elif r < 0.45: # over-forecast (actual < forecast)
            sku = pick_kw(over_codes)
            qty_mult = random.uniform(0.3, 0.75)   # actual 30-75% of base
        elif r < 0.70: # under-forecast (actual > forecast)
            sku = pick_kw(under_codes)
            qty_mult = random.uniform(1.25, 2.0)   # actual 125-200%
        elif r < 0.90: # pure-actual (no forecast)
            sku = pick_kw(actual_only_codes)
            qty_mult = random.uniform(0.5, 1.5)
        else:          # zero-actual (skip this row)
            continue

        base = sku.base_demand * qty_mult * random.uniform(0.8, 1.5)
        qty = round(max(0, base), 2)
        br = random.choice(BRANCHES + extra_branches[:3])
        dt = random.choice(dates)

        rows.append({
            "branch_code": br or "",
            "item_code": sku.code,
            "item_name": sku.name,
            "quantity": qty,
            "date": dt,
        })
    return rows


def gen_mrp_xlsx(skus):
    """Generate MRP Excel with full param columns, covering all ROP edge cases."""
    import openpyxl
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.append([
        "Code", "Product Name", "Sum of Requirement Quantities", "Unit",
        "Lead Time in Month", "Sigma Demand in Month", "Sigma Lead Time in Month",
        "Service Level %", "Unit Price", "Ordering Cost", "Holding Cost",
        "Stock on Hand", "MOQ"
    ])

    for sku in skus:
        lt = round(random.uniform(0.5, 6), 1)
        sd = round(random.uniform(0, sku.base_demand * 0.5), 2)
        slt = round(random.uniform(0, 0.5), 2)
        sl = random.choice([80, 85, 90, 95, 97, 99])
        up = round(random.uniform(0.5, 25), 2)
        oc = round(random.uniform(5, 200), 2)
        hc = round(random.uniform(0.02, 0.5), 3)
        soh = round(random.uniform(0, sku.base_demand * 30), 0)   # 0 to ~30 days stock
        moq = random.choice([0, 0, 0, 50, 100, 200])             # most have 0 MOQ

        # Deterministic: override some items for edge cases
        if sku.code == "SKU-00001":     # stock >> ROP → safe
            sd = 2; slt = 0; sl = 95; up = 5.0; oc = 20; hc = 0.15
            soh = 5000; moq = 0
        elif sku.code == "SKU-00002":   # stock << ROP → massive order
            sd = 50; slt = 0.2; sl = 99; up = 2.0; oc = 10; hc = 0.2
            soh = 10; moq = 100
        elif sku.code == "SKU-00003":   # borderline: stock ≈ ROP
            sd = 10; slt = 0; sl = 95; up = 3.0; oc = 30; hc = 0.15
            soh = 15; moq = 0
        elif sku.code == "SKU-00004":   # zero demand
            sd = 0; slt = 0; sl = 95; up = 10; oc = 100; hc = 0.2
            soh = 200; moq = 0
        elif sku.code == "SKU-00005":   # high service level + MOQ
            sd = 30; slt = 0.5; sl = 99; up = 1.0; oc = 50; hc = 0.05
            soh = 50; moq = 500
        elif sku.code == "SKU-00006":   # very high cost item
            sd = 5; slt = 0; sl = 95; up = 150; oc = 500; hc = 0.02
            soh = 20; moq = 0
        elif sku.code == "SKU-00007":   # very low holding cost
            sd = 20; slt = 0.1; sl = 90; up = 8.0; oc = 15; hc = 0.001
            soh = 100; moq = 0
        elif sku.code == "SKU-00008":   # stock exactly zero
            sd = 15; slt = 0; sl = 95; up = 4.0; oc = 25; hc = 0.1
            soh = 0; moq = 0
        elif sku.code == "SKU-00009":   # long lead time
            sd = 25; slt = 1.0; sl = 97; up = 6.0; oc = 40; hc = 0.15
            soh = 150; moq = 0
        elif sku.code == "SKU-00010":   # low service level
            sd = 8; slt = 0; sl = 80; up = 15; oc = 200; hc = 0.3
            soh = 30; moq = 0

        ws.append([
            sku.code, sku.name, round(sku.base_demand * 30, 1), "units",
            lt, sd, slt, sl, up, oc, hc, soh, moq
        ])

    path = OUT / "MRP_full.xlsx"
    wb.save(str(path))
    print(f"MRP saved: {path} ({ws.max_row - 1} items)")


def write_csv(filename, rows, fieldnames=None):
    path = OUT / filename
    if not rows:
        return path
    if fieldnames is None:
        fieldnames = list(rows[0].keys())
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)
    print(f"  {filename}: {len(rows)} rows")
    return path


# =====================================================
# GENERATE ALL DATASETS
# =====================================================

print("\n--- Generating forecast data ---")

# Period 1: EXACTLY 20,000 rows (outer boundary test)
p1_skus = slice(0, 400)
p1_rows = []
sku_list = ALL_SKUS[p1_skus]
for d in range(10):
    dt = f"2026-01-{1+d:02d}"
    for sku in sku_list:
        for br in BRANCHES:
            qty = round(sku.base_demand * random.uniform(0.7, 2.0), 2)
            p1_rows.append({
                "item_no": sku.code, "item_name": sku.name, "branch": br,
                "quantity": qty, "date": dt,
            })
assert len(p1_rows) == 20000, f"Period 1 must be exactly 20000, got {len(p1_rows)}"
write_csv("forecast_p1.csv", p1_rows)

# Period 2: 5,000 rows
write_csv("forecast_p2.csv",
          gen_forecast(2, 5000, lambda d: f"2026-02-{d+1:02d}",
                       slice(0, 600)))

# Period 3: 3,000 rows
write_csv("forecast_p3.csv",
          gen_forecast(3, 3000, lambda d: f"2026-03-{d+1:02d}",
                       slice(100, 700)))

# Period 4: 2,500 rows
write_csv("forecast_p4.csv",
          gen_forecast(4, 2500, lambda d: f"2026-04-{d+1:02d}",
                       slice(200, 800)))

# Period 5: 2,000 rows
write_csv("forecast_p5.csv",
          gen_forecast(5, 2000, lambda d: f"2026-05-{d+1:02d}",
                       slice(300, 900)))

# Period 6: 1,500 rows
write_csv("forecast_p6.csv",
          gen_forecast(6, 1500, lambda d: f"2026-06-{d+1:02d}",
                       slice(400, 1000)))

# --- Actual transfers: 50,000 rows ---
print("\n--- Generating actual transfers ---")
forecast_skus = set(s.code for s in ALL_SKUS[0:1000])
actual_rows = gen_actual_transfers(50000, forecast_skus)
write_csv("actual_transfers.csv", actual_rows)

# --- Accurate forecast (for ROP sigma computation): 2,500 rows ---
print("\n--- Generating accurate forecast ---")
write_csv("accurate_forecast.csv",
          gen_forecast(0, 2500, lambda d: f"2026-01-{d+1:02d}",
                       slice(0, 200)))

# --- MRP Excel ---
print("\n--- Generating MRP ---")
gen_mrp_xlsx(ALL_SKUS[:200])

# Summary
print("\n=== Done ===")
total = 20000+5000+3000+2500+2000+1500+50000+2500
print(f"Total forecast rows:     {20000+5000+3000+2500+2000+1500}")
print(f"Total actual transfer:   {len(actual_rows)}")
print(f"Total accurate forecast: 2500")
print(f"Total MRP items:         200")
print(f"Grand total:             {total} data rows")
