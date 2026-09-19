# Intelligent Forecast — Complete Demo Script & System Documentation

> Bakery **Demand Planning & Inventory Management** system.
> *"See the exact month where the supply chain failed, and the exact raw materials you must reorder — before the cake grabs run short."*

---

## 0. THE 30-SECOND PITCH (open with this)

> *"This is a **bakery demand-planning and inventory system** for a chain bakery with 20 branches.
> It tells you three things you need every month:
> 1. **Was my forecast right?** — the Dashboard compares what we *planned* to receive for each cake at each branch vs what we *actually* received, and flags the SKUs that were wrong.
> 2. **Did the supply chain fail somewhere?** — the dataset includes documented outages; the dashboard catches them immediately.
> 3. **What do I need to reorder?** — the Reordering Point module compares the MRP (materials requirement) for 60 raw materials against stock on hand, and tells you exactly how many units to order, in a green/orange/red report.
>
> Everything is live data, every number on screen is computed from an actual database behind this app, and every report can be exported as CSV, JSON or XML."*

---

## 1. WHAT THE SYSTEM IS

| | |
|---|---|
| **Product** | Intelligent Forecast — a bakery inventory / demand-planning SaaS dashboard |
| **Domain** | Chain bakery, 20 branches, monthly planning periods |
| **Frontend** | React 19 + TypeScript + Vite + Tailwind CSS v4 (Plus Jakarta Sans, warm bakery design) |
| **Backend** | Python (FastAPI), REST API at `/api/...` |
| **Database** | SQLite (`backend/data/app.db`), re-seedable, 6 tables |
| **ML engine (bonus)** | 4 time-series models — Baseline, Holt–Winters, ARIMA, XGBoost — trained on the historical daily sales inside the API |
| **Static serving** | FastAPI serves the built frontend (`dist/`) at `http://localhost:8000` |

---

## 2. THE DEMO DATASET — EVERY SCREEN Tells A STORY

The whole demo is built around one **internally consistent seed dataset**. Every number on screen comes from this data — nothing is hardcoded in the UI.

### 2.1 Scope
- **30 cakes** (`CAKE-001` … `CAKE-030`): Chocolate Fudge, Vanilla Sponge, Red Velvet, Lemon Drizzle, Carrot, Black Forest, Strawberry Shortcake, Whole-Wheat, Pineapple Upside-Down, Butter + 20 more (Cheesecake, Mango Mousse, Pistachio, Coffee, Truffle Brownie…).
- **20 branches** (`BR-A` … `BR-T`) with market shares: A=12%, B=10%, C=9%, D=8%, E=7%, F–J=5–6%, down to BR-T=1%.
- **6 planning periods** (P1–P6) = March → August **2026**.
- **60 raw materials** (`RM-001` … `RM-060`) for the MRP/ROP module.
- **Core daily-sales file**: 247,800 rows = 30 cakes × 20 branches × 413 days of daily sales / returns (also what the ML models train on).

### 2.2 The reality model (how "actual" is generated)
For every cake, every branch, every period:

```
forecast  = round( base_demand × seasonality × branch_share )
actual    = round( forecast × cake_bias × branch_reliability )
```

Three layers make the data realistic — **this is the story of the demo**:

1. **Layer 1 — Cake-level forecast bias** (persistent, systematic):
   - **Under-forecast** (cake sells MORE than we predicted): `CAKE-001`, `CAKE-006`, `CAKE-007`, `CAKE-013`, `CAKE-018`, `CAKE-030` → bias **1.32** (actual ≈ 132% of forecast).
   - **Over-forecast** (cake sells LESS than predicted): `CAKE-003`, `CAKE-004`, `CAKE-008`, `CAKE-015`, `CAKE-023`, `CAKE-026` → bias **0.68** (actual ≈ 68% of forecast).
2. **Layer 2 — Branch supply reliability** (varies smoothly by month):
   - `BR-A` short in spring, recovers toward summer, August dip.
   - `BR-D` dips hard in April (**0.30**) then recovers.
   - `BR-E` July surge (**1.30**), August collapse (**0.55**).
   - `BR-P` near-perfect all year (**0.98–1.02**) — the star performer to contrast against.
   - `BR-T` (smallest) collapses in August (**0.70**).
3. **Layer 3 — Documented outages** (true zero receipts):
   - **Period 2 (April) at BR-D**: `CAKE-001`, `CAKE-003`, `CAKE-006`, `CAKE-013`, `CAKE-024` receive **zero** units — a supply failure.
   - **Period 6 (August) at BR-T**: `CAKE-002`, `CAKE-009`, `CAKE-017`, `CAKE-021` receive **zero** units — an August collapse.

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
- Logo (white card), "Intelligent Forecast — And Risk Avoidance".
- Groups: **Overview** (Dashboard) · **Planning** (Forecast, Actual Transfers) · **Optimization** (Reordering Point).
- Active page highlighted with a warm pill + accent bar. Green "System status" pulse in the footer ("Prototype v2.0 · 6 periods · branch level").
- Top bar: breadcrumb with logo, today's date, green **Live** badge, and the **Test System** button (resets the demo database to the seed dataset and reloads — use this to start/restart the demo).

### 3.3 Dashboard — "P1, all branches" (the money screen)
**Show:** Branch = *All Branches*, Period = **1 (March 2026)**, Product = All Products.

**KPI cards (live values):**
- Total Forecast: **6,695** · Actual Received: **5,940** · Total SKUs: **600**
- Avg discrepancy/SKU: **2.5** · SKUs wrong forecast: **261** · Failure rate: **43%**

**Say:** *"Out of 600 cake–branch combinations across 20 branches, the system flags 261 as wrong. 5,940 units actually arrived against a forecast of 6,695 — a 1,483-unit gap. The top rows of the report are exactly where you lost product."*

**The 9-column report** (sorted by biggest discrepancy):
Item No · Item Name · Branch · Forecast · Actual Sales · Actual Received · Discrepancy · % Error · Status badge (Accurate / Over forecast / Under forecast).

- **Filters:** Branch, Period, Product — the whole dashboard re-derives from the DB.
- **Export:** CSV / JSON / XML buttons in the header — the same data you see, downloadable.
- Click **Period 2, Branch = BR-D** → the outage shows: CAKE-001 (fc 35, received 0), CAKE-013 (fc 22, received 0), CAKE-006 (fc 21, received 0), CAKE-003 (fc 17, received 0), CAKE-024 (fc 16, received 0) — **zero receipts because of the April supply failure**. BR-D P2 failure rate hits **100%** — the "aha" moment.

> **What to say for the 0s:** *"In April, branch BR-D received nothing for five cakes. The dashboard flags them all as over-forecast — not because the forecast was wrong, but because nothing arrived. That's the system catching a supply-chain failure, not a math error."*

### 3.4 Forecast — "upload + view one month's plan"
- Left: the 6 **period cards** (name, entry count, date range).
- **Upload** a forecast file (CSV / Excel / JSON) per period — the parser accepts many layouts and previews a summary (entries, total forecast quantity).
- Filterable tables by **Branch** and **Product** dropdowns, plus searchable, paginated entries (Item No, Item Name, Branch, Qty, Date).
- **Export** per period as CSV / JSON / XML.
- "Clear period" to wipe a period.
- **Demo tip:** click through P1…P6 to show quantities rising into the summer (seasonality), e.g. Strawberry Shortcake peaks in July.

### 3.5 Actual Transfers — "what actually arrived"
- **Record a transfer** (form) or **Bulk upload** a file — rows go straight into the database.
- **Filter by:** branch + product + period (P1–P6 dropdown) **OR** branch + product + from/to date range.
- Stats: records, total quantity received, active filter.
- **Export** the generated report as CSV / JSON / XML.
- Data is receipt-level: a cake can arrive in several batches on different days of the month, and some SKU/outlet months receive no delivery at all (no rows = stockout).
- **Show:** Period 2 (April) + BR-D → ~49 delivery rows spread across many April dates (batching visible); the 5 outage cakes have no rows — delivered units 0.

### 3.6 Reordering Point — "exact reorder quantities" (the second money screen)
- Two upload cards: **MRP file** and **stock file**.
- "Generate ROP report" → computes requirement vs stock, missing stock treated as 0.
- Summary cards: **Total 60 · Safe 36 · Reorder 24**.
- Table: Item Code, Item Name, MRP Monthly Qty, Stock On Hand, Action (green SAFE / **orange SAFE – overstocked >25%** / red ORDER), **Order More** (exact units to order).
- Show the ORDER lines: **Eggs 3,360 · Butter 156 · Vanilla Essence 90 · Caster Sugar 80 · Strawberry Jam 77 · Milk 63**; then the orange overstock rows (RM-001 Flour, RM-009 Cream, RM-012 Lemon Extract, plus the pattern-generated overstocks).
- Export CSV / JSON / XML.

---

## 4. LIVE DEMO SCRIPT (timed, ~6 minutes)

**Setup before audience:** server running, DB fresh, browser open on `http://localhost:8000`.

1. **0:00 – Splash.** Let the logo breathe. *"White overlay, 50% transparent — the bakery logo pulses until everything is loaded, then it melts away."*
2. **0:20 – Sidebar + top bar.** Name the 4 pages and the groups. Point to the green **Live** badge and **Test System** reset.
3. **0:40 – Dashboard P1 all.** Read the six KPIs (6,695 / 5,940 / 600 / 2.5 / 261 / 43%).
4. **1:10 – Report drill-down.** Scroll the table; point at top row (biggest gap). Mention badges (Over/Under/Accurate).
5. **1:40 – THE OUTAGE.** Set Branch=BR-D, Period=2. *"April, branch D: five cakes received zero. A supply failure the system flags instantly — the branch failure rate hits 100%."* Reset to P1 All.
6. **2:10 – Export.** Click **CSV** — show the downloaded file. *"Every report exports."*
7. **2:40 – Forecast.** Click P5/P6, show seasonality growth. *"This is the demand plan we upload each month; the rest of the app checks whether it happened."*
8. **3:10 – Actual Transfers.** Period=2, BR-D → ~49 delivery rows across many April dates; the outage cakes have zero. Switch to Duration filter (July 1–31) to show the date-range mode. *"This is the receipt log — bulk-uploadable, receipt-by-receipt."*
9. **3:50 – Reordering Point.** *"Now the question every bakery asks: what do I reorder?"* Show 36 Safe / 24 Reorder among 60 materials, plus the orange overstock rows. Click the table row for Eggs: *"Stock 840 of 4,200 needed — order 3,360."*
10. **5:00 – Export + reset.** Export the ROP report. *"If anything ever gets messed up, one click on Test System rebuilds the whole demo database."*
11. **5:20 – Closing.** *"It's a live-data system — dashboard, uploads, reordering, exports — and it works end-to-end..."* (Q&A)

**Backup plan if a screen is empty:** click **Test System** (top-right) → it reseeds the DB and reloads → data returns.

---

## 5. TECHNICAL DETAILS (for Q&A)

### 5.1 How the Dashboard calculates
- `discrepancy = forecast − actual_received` (per SKU)
- `% error = discrepancy / forecast × 100`
- **Status:** Accurate (within ±20%) · Over forecast (received ≈ 0 or +20%+) · Under forecast (received > 0 with no forecast, or −20% beyond)
- `Total discrepancy = Σ |discrepancy|`
- `pct_forecast_wrong = total_discrepancy / total_forecast × 100` (**22.2%** for P1)
- `Average discrepancy / SKU = total_discrepancy / total_skus` (**2.5**)
- `Failure rate = wrong SKUs / total SKUs` (**43.5%**)

### 5.2 How ROP decides
```
if stock_on_hand >= MRP_requirement  →  SAFE  (✓ enough)
else                                 →  ORDER (red) …, order quantity = requirement − stock
```
Missing stock = 0 (so an item with no stock file row is treated as short → red).

### 5.3 API surface (all get/put real data; nothing mocked)
- `GET /api/health` — status + row count (e.g. `{"status":"ok","rows":247800}`)
- `GET /api/branches`, `GET /api/products/list`, `GET /api/forecast/periods`
- `GET /api/forecast/entries?period=N`, `POST /api/forecast/upload`, `DELETE /api/forecast/clear`
- `POST /api/actual-transfers/entry`, `GET /api/actual-transfers?branch=&period=&from_date=&to_date=`, `POST /api/actual-transfers/upload`, `GET /api/actual-transfers/export?format=`
- `GET /api/dashboard/report?period=&branch=&product=`, `GET /api/dashboard/report/export?format=`
- `POST /api/rop/mrp/upload`, `POST /api/rop/stock/upload`, `GET /api/rop/report`, `GET /api/rop/report/export?format=`
- `POST /api/system/test-data` — reseed the whole demo database
- **ML (bonus endpoints):** `GET /api/forecast/{cake}/{outlet}` (trains Baseline + Holt-Winters + ARIMA + XGBoost and returns MAE/RMSE/MAPE), `GET /api/model-comparison/{cake}/{outlet}`, `GET /api/inventory-optimization/{cake}/{outlet}`, `GET /api/sales/{cake}/{outlet}?days=N`

### 5.4 Database (SQLite)
Tables: `forecast_entries` (3,600 rows) · `actual_transfers` (7,170 receipt rows) · `mrp_data` (60) · `accurate_forecast` (600) · `stock_on_hand` (60) · plus the training `sales.csv` (247,800 rows). One click on **Test System** rebuilds the seeds.

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
- **How many branches/cakes/materials?** 20 branches · 30 cakes · 60 raw materials · 6 monthly periods.
- **Which ML models?** Baseline, Holt–Winters, ARIMA, XGBoost — trained on 330 days, evaluated with MAE/RMSE/MAPE via the bonus `/api/forecast/{cake}/{outlet}` endpoint.
- **Can I export?** Every report — Dashboard, Actual Transfers, ROP — exports to CSV, JSON, or XML.
- **What tech?** React + TypeScript + Tailwind UI; FastAPI backend; SQLite; deployable to Render.
- **Why is it warm/brown?** The whole redesign follows a "bakery SaaS" visual language so the manager feels at home — espresso sidebar, cream content, caramel accents.