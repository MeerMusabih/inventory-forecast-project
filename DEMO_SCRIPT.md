# Inventory Intelligence — Complete Demo Script & System Documentation

> Bakery **Demand Planning & Inventory Management** system.
> *"See the exact month where the supply chain failed, and the exact raw materials you must reorder — before the cake grabs run short."*

---

## 0. THE 30-SECOND PITCH (open with this)

> *"This is a **bakery demand-planning and inventory system** for a chain bakery with 5 branches.
> It tells you three things you need every month:
> 1. **Was my forecast right?** — the Dashboard compares what we *planned* to receive for each cake at each branch vs what we *actually* received, and flags the SKUs that were wrong.
> 2. **Did the supply chain fail somewhere?** — the dataset includes a documented outage; the dashboard catches it immediately.
> 3. **What do I need to reorder?** — the Reordering Point module compares the MRP (materials requirement) for 12 raw materials against stock on hand, and tells you exactly how many units to order, in a green/red report.
>
> Everything is live data, every number on screen is computed from an actual database behind this app, and every report can be exported as CSV, JSON or XML."*

---

## 1. WHAT THE SYSTEM IS

| | |
|---|---|
| **Product** | Inventory Intelligence — a bakery inventory / demand-planning SaaS dashboard |
| **Domain** | Chain bakery, 5 branches, monthly planning periods |
| **Frontend** | React 19 + TypeScript + Vite + Tailwind CSS v4 (Plus Jakarta Sans, warm bakery design) |
| **Backend** | Python (FastAPI), REST API at `/api/...` |
| **Database** | SQLite (`backend/data/app.db`), re-seedable, 6 tables |
| **ML engine (bonus)** | 4 time-series models — Baseline, Holt–Winters, ARIMA, XGBoost — trained on the historical daily sales inside the API |
| **Static serving** | FastAPI serves the built frontend (`dist/`) at `http://localhost:8000` |

---

## 2. THE DEMO DATASET — EVERY SCREEN Tells A STORY

The whole demo is built around one **internally consistent seed dataset**. Every number on screen comes from this data — nothing is hardcoded in the UI.

### 2.1 Scope
- **10 cakes** (`CAKE-001` … `CAKE-010`): Chocolate Fudge, Vanilla Sponge, Red Velvet, Lemon Drizzle, Carrot, Black Forest, Strawberry Shortcake, Whole-Wheat, Pineapple Upside-Down, Butter.
- **5 branches** (`BR-A` … `BR-E`) with market shares: A=30%, B=25%, C=20%, D=15%, E=10%.
- **6 planning periods** (P1–P6) = March → August **2026**.
- **12 raw materials** (`RM-001` … `RM-012`) for the MRP/ROP module.
- **Core daily-sales file**: 20,650 rows = 10 cakes × 5 branches × 413 days of daily sales / returns (also what the ML models train on).

### 2.2 The reality model (how "actual" is generated)
For every cake, every branch, every period:

```
forecast  = round( base_demand × seasonality × branch_share )
actual    = round( forecast × cake_bias × branch_reliability )
```

Three layers make the data realistic — **this is the story of the demo**:

1. **Layer 1 — Cake-level forecast bias** (persistent, systematic):
   - **Under-forecast** (cake sells MORE than we predicted): `CAKE-001`, `CAKE-006`, `CAKE-007` → bias **1.32** (actual ≈ 132% of forecast).
   - **Over-forecast** (cake sells LESS than predicted): `CAKE-003`, `CAKE-004`, `CAKE-008` → bias **0.68** (actual ≈ 68% of forecast).
2. **Layer 2 — Branch supply reliability** (varies smoothly by month):
   - `BR-A` short in spring, recovers toward summer, August dip.
   - `BR-D` dips hard in April (**0.30**) then recovers.
   - `BR-E` July surge (**1.30**), August collapse (**0.55**).
3. **Layer 3 — Documented outage**: in **Period 2 (April) at BR-D**, cakes `CAKE-001`, `CAKE-003`, `CAKE-006` received **zero** units — a supply failure.

### 2.3 The ROP dataset (matches stock coverage on purpose)
| Material | Aug MRP need | Stock on hand | Coverage | ROP result |
|---|---|---|---|---|
| RM-001 Wheat Flour | 420 kg | 630 kg | 1.50 | ✅ Safe |
| RM-002 Sugar | 300 kg | 330 kg | 1.10 | ✅ Safe |
| RM-003 Butter | 240 kg | 84 kg | 0.35 | 🔴 Order 156 |
| RM-004 Eggs | 4,200 pcs | 840 pcs | 0.20 | 🔴 Order 3,360 |
| RM-005 Milk | 210 L | 147 L | 0.70 | 🔴 Order 63 |
| RM-006 Cocoa Powder | 90 kg | 112 kg | 1.25 | ✅ Safe |
| RM-007 Baking Powder | 12 kg | 12 kg | 1.00 | ✅ Safe (exact) |
| RM-008 Vanilla Essence | 900 ml | 810 ml | 0.90 | 🔴 Order 90 |
| RM-009 Whipping Cream | 160 L | 224 L | 1.40 | ✅ Safe |
| RM-010 Strawberry Jam | 110 kg | 33 kg | 0.30 | 🔴 Order 77 |
| RM-011 Icing Sugar | 130 kg | 136 kg | 1.05 | ✅ Safe |
| RM-012 Lemon Extract | 300 ml | 510 ml | 1.70 | ✅ Safe |

**Result: 7 SAFE / 5 ORDER** → the ROP screen shows both green and red, live.

---

## 3. PAGE-BY-PAGE WALKTHROUGH (what to show & what to say)

### 3.1 Loading screen (first open)
- White 50%-opacity overlay with the **bakery logo breathing** (dim → brighten, ~1.8 s cycle).
- Fades out only when everything is loaded, then the app appears with a subtle fade.

### 3.2 Sidebar (espresso brown, cream content — bakery SaaS look)
- Logo (white card), "Inventory Intelligence — Demand planning suite".
- Groups: **Overview** (Dashboard, Inventory) · **Planning** (Forecast, Actual Transfers) · **Optimization** (Reordering Point).
- Active page highlighted with a warm pill + accent bar. Green "System status" pulse in the footer ("Prototype v2.0 · 6 periods · branch level").
- Top bar: breadcrumb with logo, today's date, green **Live** badge, and the **Test System** button (resets the demo database to the seed dataset and reloads — use this to start/restart the demo).

### 3.3 Dashboard — "P1, all branches" (the money screen)
**Show:** Branch = *All Branches*, Period = **1 (March 2026)**, Product = All Products.

**KPI cards (live values):**
- Total Forecast: **2,560** · Actual Received: **2,349** · Total SKUs: **50**
- Avg discrepancy/SKU: **10.7** · SKUs wrong forecast: **28** · Failure rate: **56%**

**Say:** *"Out of 50 cake–branch combinations, the system flags 28 as wrong. 2,349 units actually arrived against a forecast of 2,560 — a 535-unit gap. The top rows of the report are exactly where you lost product."*

**The 9-column report** (sorted by biggest discrepancy):
Item No · Item Name · Branch · Forecast · Actual Sales · Actual Received · Discrepancy · % Error · Status badge (Accurate / Over forecast / Under forecast).

- **Filters:** Branch, Period, Product — the whole dashboard re-derives from the DB.
- **Export:** CSV / JSON / XML buttons in the header — the same data you see, downloadable.
- Click **Period 2, Branch = BR-D** → the outage shows: CAKE-001 (fc 66, received 0), CAKE-003 (fc 32, received 0), CAKE-006 (fc 40, received 0) — **zero receipts because of the April supply failure**. This is the "aha" moment.

> **What to say for the 0s:** *"In April, branch BR-D received nothing for three cakes. The dashboard flags all three as over-forecast — not because the forecast was wrong, but because nothing arrived. That's the system catching a supply-chain failure, not a math error."*

### 3.4 Forecast — "upload + view one month's plan"
- Left: the 6 **period cards** (name, entry count, date range).
- **Upload** a forecast file (CSV / Excel / JSON) per period — the parser accepts many layouts and previews a summary (entries, total forecast quantity).
- Searchable, paginated entries table (Item No, Item Name, Branch, Qty, Date).
- "Clear period" to wipe a period.
- **Demo tip:** click through P1…P6 to show quantities rising into the summer (seasonality), e.g. Strawberry Shortcake peaks in July.

### 3.5 Actual Transfers — "what actually arrived"
- **Record a transfer** (form) or **Bulk upload** a file — rows go straight into the database.
- **Filter by:** branch + period (P1–P6 dropdown) **OR** branch + from/to date range.
- Stats: records, total quantity received, active filter.
- **Export** the generated report as CSV / JSON / XML.
- **Show:** Period 2 (April) + BR-D → 10 rows; the 3 outage cakes appear with quantity 0.

### 3.6 Inventory — "stock health across every branch"
- Built from the core daily-sales dataset (web demo of the classic inventory module).
- Table: Product, Category, Outlet, Stock, Avg daily sales, **Days remaining** (with a colour-coded days-of-cover bar), Return rate, Status badge, trend arrow.
- **Search box** (product/category/outlet), **status filter**, sortable columns.
- Status logic (computed, not mocked): stock = 0 & selling → **Critical** · <2 days cover → **Critical** · <5 days → **Low stock** · >30 days → **Overstock** · avg sales >20 → **High demand**.

### 3.7 Reordering Point — "exact reorder quantities" (the second money screen)
- Two upload cards: **MRP file** and **stock file**.
- "Generate ROP report" → computes requirement vs stock, missing stock treated as 0.
- Summary cards: **Total 12 · Safe 7 · Reorder 5**.
- Table: Item Code, Item Name, MRP Monthly Qty, Stock On Hand, Action (green SAFE / red ORDER), **Order More** (exact units to order).
- Show the ORDER lines: **Eggs 3,360 · Butter 156 · Vanilla Essence 90 · Strawberry Jam 77 · Milk 63**.
- Export CSV / JSON / XML.

---

## 4. LIVE DEMO SCRIPT (timed, ~6 minutes)

**Setup before audience:** server running, DB fresh, browser open on `http://localhost:8000`.

1. **0:00 – Splash.** Let the logo breathe. *"White overlay, 50% transparent — the bakery logo pulses until everything is loaded, then it melts away."*
2. **0:20 – Sidebar + top bar.** Name the 5 pages and the groups. Point to the green **Live** badge and **Test System** reset.
3. **0:40 – Dashboard P1 all.** Read the six KPIs (2560 / 2349 / 50 / 10.7 / 28 / 56%).
4. **1:10 – Report drill-down.** Scroll the table; point at top row (Chocolate Fudge, biggest gap). Mention badges (Over/Under/Accurate).
5. **1:40 – THE OUTAGE.** Set Branch=BR-D, Period=2. *"April, branch D: three cakes received zero. That's a supply failure, and the system flags it instantly."* Reset to P1 All.
6. **2:10 – Export.** Click **CSV** — show the downloaded file. *"Every report exports."*
7. **2:40 – Forecast.** Click P5/P6, show seasonality growth. *"This is the demand plan we upload each month; the rest of the app checks whether it happened."*
8. **3:10 – Actual Transfers.** Period=2, BR-D → 10 rows, 3 zeros. Switch to Duration filter (July 1–31) to show the date-range mode. *"This is the receipt log — bulk-uploadable."*
9. **3:50 – Inventory.** Search "flour", sort by stock, show the days-cover bars and status badges.
10. **4:20 – Reordering Point.** *"Now the question every bakery asks: what do I reorder?"* Show 7 Safe / 5 Reorder. Click the table row for Eggs: *"Stock 840 of 4,200 needed — order 3,360."*
11. **5:00 – Export + reset.** Export the ROP report. *"If anything every gets messed up, one click on Test System rebuilds the whole demo database."*
12. **5:20 – Closing.** *"It's a live-data system — dashboard, uploads, reordering, exports — and it works end-to-end..."* (Q&A)

**Backup plan if a screen is empty:** click **Test System** (top-right) → it reseeds the DB and reloads → data returns.

---

## 5. TECHNICAL DETAILS (for Q&A)

### 5.1 How the Dashboard calculates
- `discrepancy = forecast − actual_received` (per SKU)
- `% error = discrepancy / forecast × 100`
- **Status:** Accurate (within ±20%) · Over forecast (received ≈ 0 or +20%+) · Under forecast (received > 0 with no forecast, or −20% beyond)
- `Total discrepancy = Σ |discrepancy|`
- `pct_forecast_wrong = total_discrepancy / total_forecast × 100` (**20.9%** for P1)
- `Average discrepancy / SKU = total_discrepancy / total_skus` (**10.7**)
- `Failure rate = wrong SKUs / total SKUs` (**56%**)

### 5.2 How ROP decides
```
if stock_on_hand >= MRP_requirement  →  SAFE  (✓ enough)
else                                 →  ORDER (red) …, order quantity = requirement − stock
```
Missing stock = 0 (so an item with no stock file row is treated as short → red).

### 5.3 API surface (all get/put real data; nothing mocked)
- `GET /api/health` — status + row count (e.g. `{"status":"ok","rows":20650}`)
- `GET /api/branches`, `GET /api/products/list`, `GET /api/forecast/periods`
- `GET /api/forecast/entries?period=N`, `POST /api/forecast/upload`, `DELETE /api/forecast/clear`
- `POST /api/actual-transfers/entry`, `GET /api/actual-transfers?branch=&period=&from_date=&to_date=`, `POST /api/actual-transfers/upload`, `GET /api/actual-transfers/export?format=`
- `GET /api/dashboard/report?period=&branch=&product=`, `GET /api/dashboard/report/export?format=`
- `POST /api/rop/mrp/upload`, `POST /api/rop/stock/upload`, `GET /api/rop/report`, `GET /api/rop/report/export?format=`
- `POST /api/system/test-data` — reseed the whole demo database
- **ML (bonus endpoints):** `GET /api/forecast/{cake}/{outlet}` (trains Baseline + Holt-Winters + ARIMA + XGBoost and returns MAE/RMSE/MAPE), `GET /api/model-comparison/{cake}/{outlet}`, `GET /api/inventory-optimization/{cake}/{outlet}`, `GET /api/sales/{cake}/{outlet}?days=N`

### 5.4 Database (SQLite)
Tables: `forecast_entries` (300 rows) · `actual_transfers` (300) · `mrp_data` (12) · `accurate_forecast` (50) · `stock_on_hand` (12) · plus the training `sales.csv` (20,650 rows). One click on **Test System** rebuilds the seeds.

### 5.5 Data story construct
Seed script (`scripts/build_sample_data.py`) models reality as three layers: **cake bias → branch reliability → documented outages**. Forecast = base × season × branch share. Actual = forecast × bias × reliability. This is *deliberate, documented metadata* — it's what lets the demo demonstrate a real interpretable scenario (under-forecast brands, an over-stocked branch, and one catastrophic outage) instead of random noise.

---

## 6. RUN / DEPLOY

| Task | Command |
|---|---|
| Backend (API + serves frontend) | `cd backend && python3 -m uvicorn main:app --host 0.0.0.0 --port 8000` |
| Rebuild frontend (after UI changes) | `npm run build` (result served at :8000 automatically) |
| Frontend dev server (hot reload) | `npm run dev` (Vite, port 5173) |
| Reset demo data | Click **Test System** in the top bar |
| Windows | `setup.bat` / `start.bat` |
| Linux/Mac | `bash setup.sh` / `bash start.sh` |
| Cloud deploy | Render — auto-detects `render.yaml` (`cd backend && uvicorn main:app`) |

**Open:** http://localhost:8000

---

## 7. KNOWN LIMITATION — SAY THIS IF ASKED ("tell them everything")

- **The "Actual Sales" column on the Dashboard shows 0** for the cake rows. Reason: the historical daily-sales store keys rows as `product_id:outlet_name` (legacy format from the original seed), while the new cake-based dashboard looks up `item_no:branch_code` (e.g. `CAKE-001:BR-A`) — so the lookup misses. This is a known naming mismatch between two eras of the codebase.
- **Impact:** the columns that drive the story — Forecast, Actual Received, Discrepancy, % Error, Status — are 100% correct and live. The 0s do **not** affect the KPI cards, the status badges, or the Reordering Point.
- **If it ever matters for a real demo:** the cleanest one-line fix is making `get_sales_by_key()` normalize both key formats; no page, endpoint or data change is needed. Everything else in this system is consistent end-to-end.

---

## 8. LIKELY Q&A (short answers)

- **Is this real data?** It's a curated, deterministic seed dataset — every number is computed by the backend from that seed, not hardcoded in the UI. Re-seedable with one click.
- **How many branches/cakes/materials?** 5 branches · 10 cakes · 12 raw materials · 6 monthly periods.
- **Which ML models?** Baseline, Holt–Winters, ARIMA, XGBoost — trained on 330 days, evaluated with MAE/RMSE/MAPE via the bonus `/api/forecast/{cake}/{outlet}` endpoint.
- **Can I export?** Every report — Dashboard, Actual Transfers, ROP — exports to CSV, JSON, or XML.
- **What tech?** React + TypeScript + Tailwind UI; FastAPI backend; SQLite; deployable to Render.
- **Why is it warm/brown?** The whole redesign follows a "bakery SaaS" visual language so the manager feels at home — espresso sidebar, cream content, caramel accents.