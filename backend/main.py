from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
import pandas as pd
import numpy as np
import math
import json
import csv
import calendar
from pathlib import Path
from io import BytesIO, StringIO
from typing import Optional

from data.generator import generate_data, PRODUCT_PROFILES, OUTLETS
from models.baseline import train_baseline, predict_baseline
from models.holt_winters import train_holt_winters, predict_holt_winters
from models.arima_model import train_arima, predict_arima
from models.xgboost_model import train_xgboost, predict_xgboost
from models.evaluation import evaluate_all_models
from models.demand_correction import correct_series_for_training
from engine.inventory_optimization import optimize_inventory
from database import init_db, get_conn

app = FastAPI(title="Inventory Forecast ML API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DIST_DIR = Path(__file__).resolve().parent.parent / "dist"

DATA_CACHE = None


def get_data() -> pd.DataFrame:
    global DATA_CACHE
    if DATA_CACHE is None:
        csv_path = Path("data/sales.csv")
        if csv_path.exists():
            DATA_CACHE = pd.read_csv(csv_path)
        else:
            DATA_CACHE = generate_data()
            DATA_CACHE.to_csv(csv_path, index=False)
    return DATA_CACHE


@app.on_event("startup")
def startup():
    init_db()
    get_data()
    print(f"Data loaded: {len(DATA_CACHE)} rows")


@app.get("/api/health")
def health():
    return {"status": "ok", "rows": len(get_data())}


@app.get("/api/products")
def list_products():
    return PRODUCT_PROFILES


@app.get("/api/outlets")
def list_outlets():
    return OUTLETS


@app.get("/api/sales/{product_id}/{outlet_id}")
def get_sales(product_id: str, outlet_id: str, days: int = 365):
    df = get_data()
    mask = (df["product_id"] == product_id) & (df["outlet_id"] == outlet_id)
    filtered = df[mask].sort_values("date").tail(days)
    return {
        "dates": filtered["date"].tolist(),
        "units_sold": filtered["units_sold"].tolist(),
        "revenue": filtered["revenue"].tolist(),
        "closing_stock": filtered["closing_stock"].tolist(),
    }


@app.get("/api/forecast/entries/export")
def export_forecast_entries(period: int = 1, format: str = "csv"):
    rows = get_forecast_entries(period=period, limit=100000)
    fieldnames = ["period", "item_no", "item_name", "branch", "quantity", "date"]
    return _serialize_report(rows, fieldnames, format, f"forecast-p{period}")


@app.get("/api/forecast/{product_id}/{outlet_id}")
def get_forecast(product_id: str, outlet_id: str, model_type: str = "all", steps: int = 30):
    df = get_data()
    mask = (df["product_id"] == product_id) & (df["outlet_id"] == outlet_id)
    product_data = df[mask].sort_values("date")

    if len(product_data) < 30:
        raise HTTPException(400, "Insufficient data")

    corrected_series = correct_series_for_training(product_data)
    train_size = max(30, int(len(corrected_series) * 0.8))
    train_series = corrected_series.iloc[:train_size]
    test_series = corrected_series.iloc[train_size:]

    results = {}

    if model_type in ("all", "baseline"):
        model = train_baseline(train_series)
        pred = predict_baseline(model, steps)
        results["baseline_sma"] = {
            "predictions": pred["predictions"],
            "lower_bound": pred["lower_bound"],
            "upper_bound": pred["upper_bound"],
            "params": {"window": model["window"], "sma": round(model["sma"], 2)},
        }

    if model_type in ("all", "holt_winters"):
        try:
            model = train_holt_winters(train_series)
            pred = predict_holt_winters(model, steps)
            results["holt_winters"] = {
                "predictions": pred["predictions"],
                "lower_bound": pred["lower_bound"],
                "upper_bound": pred["upper_bound"],
                "params": {"alpha": model["alpha"], "beta": model["beta"], "gamma": model["gamma"]},
            }
        except Exception as e:
            results["holt_winters"] = {"error": str(e)}

    if model_type in ("all", "arima"):
        try:
            model = train_arima(train_series)
            pred = predict_arima(model, steps)
            results["arima"] = {
                "predictions": pred["predictions"],
                "lower_bound": pred["lower_bound"],
                "upper_bound": pred["upper_bound"],
                "params": {"order": model["order"], "aic": model["aic"]},
            }
        except Exception as e:
            results["arima"] = {"error": str(e)}

    if model_type in ("all", "xgboost"):
        try:
            model = train_xgboost(product_data)
            pred = predict_xgboost(model, product_data, steps)
            results["xgboost"] = {
                "predictions": pred["predictions"],
                "lower_bound": pred["lower_bound"],
                "upper_bound": pred["upper_bound"],
                "top_features": model["top_features"][:5],
            }
        except Exception as e:
            results["xgboost"] = {"error": str(e)}

    future_dates = pd.date_range(
        start=pd.Timestamp(corrected_series.index[-1]) + pd.Timedelta(days=1),
        periods=steps,
    ).strftime("%Y-%m-%d").tolist()

    return {
        "product_id": product_id,
        "outlet_id": outlet_id,
        "train_size": train_size,
        "test_size": len(test_series),
        "future_dates": future_dates,
        "actual": {"dates": corrected_series.index.tolist(), "values": corrected_series.values.tolist()},
        "models": results,
    }


@app.get("/api/model-comparison/{product_id}/{outlet_id}")
def compare_models(product_id: str, outlet_id: str):
    df = get_data()
    mask = (df["product_id"] == product_id) & (df["outlet_id"] == outlet_id)
    product_data = df[mask].sort_values("date")

    if len(product_data) < 60:
        raise HTTPException(400, "Need at least 60 days of data for comparison")

    corrected_series = correct_series_for_training(product_data)
    split = int(len(corrected_series) * 0.7)
    train = corrected_series.iloc[:split]
    test = corrected_series.iloc[split:]

    comparison = evaluate_all_models(train, test, product_data)

    best_model = min(
        [(k, v) for k, v in comparison.items() if "rmse" in v],
        key=lambda x: x[1]["rmse"],
        default=None,
    )

    return {
        "product_id": product_id,
        "outlet_id": outlet_id,
        "train_size": len(train),
        "test_size": len(test),
        "models": comparison,
        "best_model": best_model[0] if best_model else None,
    }


@app.get("/api/inventory-optimization/{product_id}/{outlet_id}")
def get_inventory_optimization(product_id: str, outlet_id: str):
    df = get_data()
    return optimize_inventory(df, product_id, outlet_id)


@app.get("/api/batch-forecast")
def batch_forecast(steps: int = 14):
    df = get_data()
    summary = []
    for product_id in df["product_id"].unique():
        for outlet_id in df["outlet_id"].unique():
            mask = (df["product_id"] == product_id) & (df["outlet_id"] == outlet_id)
            pdata = df[mask].sort_values("date")
            if len(pdata) < 30:
                continue
            corrected = correct_series_for_training(pdata)
            model = train_holt_winters(corrected)
            pred = predict_holt_winters(model, steps)
            last_stock = float(pdata["closing_stock"].iloc[-1])
            avg_demand = float(corrected.tail(30).mean())
            days_left = last_stock / avg_demand if avg_demand > 0 else 0
            summary.append({
                "product_id": product_id,
                "outlet_id": outlet_id,
                "avg_demand_30d": round(avg_demand, 1),
                "current_stock": round(last_stock, 0),
                "days_of_stock": round(days_left, 1),
                "predicted_avg": round(float(np.mean(pred["predictions"])), 1),
                "model_params": {"alpha": model["alpha"], "beta": model["beta"], "gamma": model["gamma"]},
            })

    summary.sort(key=lambda x: x["days_of_stock"])
    return {"total": len(summary), "forecasts": summary}


# ---------------------------------------------------------------------------
# New system endpoints: Forecast uploads, Actual transfers, Dashboard, ROP, export
# ---------------------------------------------------------------------------

BRANCHES = [
    {"id": "branch-a", "code": "BR-A", "name": "Branch A"},
    {"id": "branch-b", "code": "BR-B", "name": "Branch B"},
    {"id": "branch-c", "code": "BR-C", "name": "Branch C"},
    {"id": "branch-d", "code": "BR-D", "name": "Branch D"},
    {"id": "branch-e", "code": "BR-E", "name": "Branch E"},
    {"id": "branch-f", "code": "BR-F", "name": "Branch F"},
    {"id": "branch-g", "code": "BR-G", "name": "Branch G"},
    {"id": "branch-h", "code": "BR-H", "name": "Branch H"},
    {"id": "branch-i", "code": "BR-I", "name": "Branch I"},
    {"id": "branch-j", "code": "BR-J", "name": "Branch J"},
    {"id": "branch-k", "code": "BR-K", "name": "Branch K"},
    {"id": "branch-l", "code": "BR-L", "name": "Branch L"},
    {"id": "branch-m", "code": "BR-M", "name": "Branch M"},
    {"id": "branch-n", "code": "BR-N", "name": "Branch N"},
    {"id": "branch-o", "code": "BR-O", "name": "Branch O"},
    {"id": "branch-p", "code": "BR-P", "name": "Branch P"},
    {"id": "branch-q", "code": "BR-Q", "name": "Branch Q"},
    {"id": "branch-r", "code": "BR-R", "name": "Branch R"},
    {"id": "branch-s", "code": "BR-S", "name": "Branch S"},
    {"id": "branch-t", "code": "BR-T", "name": "Branch T"},
]

BRANCH_BY_CODE = {b["code"]: b for b in BRANCHES}

SALES_BY_KEY_CACHE = None


def get_sales_by_key():
    """Aggregate external sales data by product:branch once, then cache it."""
    global SALES_BY_KEY_CACHE
    if SALES_BY_KEY_CACHE is not None:
        return SALES_BY_KEY_CACHE
    sales_by_key = {}
    try:
        df = get_data()
        outlets_map = {o["id"]: o["name"] for o in OUTLETS}
        df = df.copy()
        df["outlet_name"] = df["outlet_id"].map(outlets_map).fillna(df["outlet_id"])
        df["sales_key"] = df["product_id"] + ":" + df["outlet_name"]
        sales_by_key = df.groupby("sales_key")["units_sold"].sum().to_dict()
    except Exception:
        pass
    SALES_BY_KEY_CACHE = sales_by_key
    return sales_by_key


def _normalize_headers(headers):
    """Map messy CSV headers to canonical column names."""
    mapping = {}
    for h in headers:
        if h is None:
            continue
        key = str(h).strip().lower()
        key_alias = (
            key.replace(" ", "_")
            .replace("-", "_")
            .replace(".", "")
            .replace("/", "_")
            .replace("%", "")
            .replace(":", "")
            .replace("(", "")
            .replace(")", "")
        )
        if key_alias in ("item_no", "itemno", "item", "item_number", "product_no", "product_code", "item_code", "sku", "code"):
            mapping[h] = "item_no"
        elif key_alias in ("item_name", "itemname", "item,item", "product_name", "product", "name", "description", "requirement_name", "name_of_requirement"):
            mapping[h] = "item_name"
        elif key_alias in ("branch", "branch_code", "branchname", "outlet", "outlet_code", "branch_name"):
            mapping[h] = "branch"
        elif key_alias in ("quantity", "qty", "qty_received", "forecast_qty", "units", "demand", "sum_of_requirement_quantities", "quantity_received"):
            mapping[h] = "quantity"
        elif key_alias in ("date", "date_received", "transaction_date", "receipt_date", "delivery_date"):
            mapping[h] = "date"
        elif key_alias in ("row_label", "rowlabel", "row", "sno", "sr"):
            mapping[h] = "row_label"
        elif key_alias in ("product_name", "product", "material", "raw_material"):
            mapping[h] = "product_name"
        elif key_alias in ("sum_of_requirement_quantities", "requirement_qty", "requirement_quantity", "requirement", "mrp_monthly"):
            mapping[h] = "requirement_qty"
        elif key_alias in ("unit", "uom"):
            mapping[h] = "unit"
        elif key_alias in ("lead_time", "lead_time_month", "lt", "lead_time_in_month", "lead_time_months"):
            mapping[h] = "lead_time"
        elif key_alias in ("sigma_demand", "sd_demand", "std_demand", "σ_demand_in_month", "sigma_demand_in_month", "sigma_demand_month", "demand_std", "sigma_d"):
            mapping[h] = "sigma_demand"
        elif key_alias in ("sigma_lead_time", "sigma_lead", "std_lead", "σ_lead_time_in_month", "sigma_lead_time_in_month", "lead_time_std", "sigma_lt"):
            mapping[h] = "sigma_lead_time"
        elif key_alias in ("service_level", "service_level_pct", "service_level_percent", "service_level_", "sl", "problem_happen"):
            mapping[h] = "service_level"
        elif key_alias in ("unit_price", "price", "cost", "unit_cost", "unitprice"):
            mapping[h] = "unit_price"
        elif key_alias in ("ordering_cost", "order_cost", "co", "setup_cost", "ordering_cost_co", "order_qty_cost"):
            mapping[h] = "ordering_cost"
        elif key_alias in ("holding_cost", "holding_cost_h", "h", "carrying_cost", "inventory_cost", "holding"):
            mapping[h] = "holding_cost"
        elif key_alias in ("stock_on_hand", "stock", "on_hand", "quantity_on_hand", "current_stock", "opening_stock", "stockonthhand"):
            mapping[h] = "stock_on_hand"
        elif key_alias in ("moq", "min_order_qty", "minimum_order_qty", "moq_issue_supplier", "minimum_order_quantity"):
            mapping[h] = "moq"
    return mapping


def _parse_upload_file(file: UploadFile):
    """Parse CSV / Excel / JSON into list of dict rows."""
    content = file.file.read()
    filename = (file.filename or "").lower()

    if filename.endswith(".xlsx") or filename.endswith(".xls"):
        df = pd.read_excel(BytesIO(content))
        rows = df.to_dict("records")
    elif filename.endswith(".json"):
        rows = json.loads(content.decode("utf-8"))
        if isinstance(rows, dict) and "rows" in rows:
            rows = rows["rows"]
    else:
        text = content.decode("utf-8-sig", errors="replace")
        df = pd.read_csv(StringIO(text))
        rows = df.to_dict("records")
    return rows


@app.get("/api/branches")
def list_branches():
    return BRANCHES


@app.get("/api/forecast/periods")
def forecast_periods():
    conn = get_conn()
    cur = conn.execute(
        "SELECT period, COUNT(*) AS entries, MAX(date) AS last_date, MIN(date) AS first_date "
        "FROM forecast_entries GROUP BY period ORDER BY period"
    )
    rows = cur.fetchall()
    counts = {r["period"]: r["entries"] for r in rows}
    first_dates = {r["period"]: r["first_date"] for r in rows}
    last_dates = {r["period"]: r["last_date"] for r in rows}
    conn.close()
    period_names = {1: "March", 2: "April", 3: "May", 4: "June", 5: "July", 6: "August"}
    periods = []
    for p in range(1, 7):
        periods.append({
            "period": p,
            "name": f"Period {p} ({period_names.get(p, '')})",
            "entries": counts.get(p, 0),
            "first_date": first_dates.get(p),
            "last_date": last_dates.get(p),
        })
    return periods


@app.get("/api/forecast/entries")
def get_forecast_entries(period: int = 1, limit: int = 20000):
    conn = get_conn()
    cur = conn.execute(
        "SELECT id, period, item_no, item_name, branch, quantity, date FROM forecast_entries "
        "WHERE period = ? ORDER BY id LIMIT ?",
        (period, limit),
    )
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.post("/api/forecast/upload")
async def upload_forecast(period: int = 1, file: UploadFile = File(...)):
    rows = _parse_upload_file(file)
    if not rows:
        raise HTTPException(400, "File is empty")

    mapping = _normalize_headers(list(rows[0].keys()))

    def col(aliases):
        for r in rows:
            for h, canon in mapping.items():
                if canon in aliases:
                    return h
        return None

    item_no_col = col(["item_no"])
    item_name_col = col(["item_name"])
    branch_col = col(["branch"])
    qty_col = col(["quantity"])
    date_col = col(["date"])

    if not item_no_col or not qty_col:
        raise HTTPException(400, "Missing required columns: item_no / item_name / branch / quantity / date")

    conn = get_conn()
    rows_to_insert = []
    for r in rows:
        item_no = str(r.get(item_no_col, "")).strip()
        if not item_no:
            continue
        qty = r.get(qty_col, 0)
        try:
            qty = float(qty)
        except (TypeError, ValueError):
            qty = 0
        item_name = str(r.get(item_name_col, "")) if item_name_col else ""
        branch = str(r.get(branch_col, "")) if branch_col else ""
        date = str(r.get(date_col, "")) if date_col else ""
        rows_to_insert.append((period, item_no, item_name, branch, qty, date))

    conn.executemany(
        "INSERT INTO forecast_entries (period, item_no, item_name, branch, quantity, date) VALUES (?,?,?,?,?,?)",
        rows_to_insert,
    )
    conn.commit()
    conn.close()
    return {"inserted": len(rows_to_insert), "skipped": len(rows) - len(rows_to_insert), "period": period}


@app.delete("/api/forecast/clear")
def clear_forecast(period: int = 1):
    conn = get_conn()
    conn.execute("DELETE FROM forecast_entries WHERE period = ?", (period,))
    conn.commit()
    conn.close()
    return {"cleared": period}


@app.post("/api/actual-transfers/entry")
def add_actual_transfer(payload: dict):
    branch_code = str(payload.get("branch_code", "")).strip()
    item_code = str(payload.get("item_code", "")).strip()
    item_name = str(payload.get("item_name", "")).strip()
    quantity = float(payload.get("quantity", 0))
    date = str(payload.get("date", "")).strip()
    if not item_code:
        raise HTTPException(400, "Missing item_code")
    conn = get_conn()
    conn.execute(
        "INSERT INTO actual_transfers (branch_code, item_code, item_name, quantity, date) VALUES (?,?,?,?,?)",
        (branch_code, item_code, item_name, quantity, date),
    )
    conn.commit()
    conn.close()
    return {"ok": True}


@app.get("/api/actual-transfers")
def get_actual_transfers(branch: str = "", item_code: str = "", from_date: str = "",
                         to_date: str = "", period: int = 0):
    """Return actual transfers. Filter by branch, product (item code), a forecast
    period (P1..P6), or a from/to date range."""
    conn = get_conn()
    sql = "SELECT id, branch_code, item_code, item_name, quantity, date FROM actual_transfers WHERE 1=1"
    params = []
    if branch and branch != "all":
        sql += " AND branch_code = ?"
        params.append(branch)
    if item_code and item_code != "all":
        sql += " AND item_code = ?"
        params.append(item_code)
    if period:
        dates = [
            r["date"] for r in conn.execute(
                "SELECT date FROM forecast_entries WHERE period = ?", (period,)
            ).fetchall() if r["date"]
        ]
        if dates:
            start = min(dates)[:10]
            y, m = int(start[:4]), int(start[5:7])
            last_day = calendar.monthrange(y, m)[1]
            end = f"{start[:8]}{last_day:02d}"
            sql += " AND date >= ? AND date <= ?"
            params.extend([start, end])
    if from_date:
        sql += " AND date >= ?"
        params.append(from_date)
    if to_date:
        sql += " AND date <= ?"
        params.append(to_date)
    sql += " ORDER BY date DESC, id DESC"
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.get("/api/actual-transfers/export")
def export_actual_transfers(format: str = "csv", branch: str = "", item_code: str = "",
                            period: int = 0, from_date: str = "", to_date: str = ""):
    data = get_actual_transfers(branch, item_code, from_date, to_date, period)
    fieldnames = ["id", "branch_code", "item_code", "item_name", "quantity", "date"]
    filename = "actual-transfers"
    if period:
        filename += f"-p{period}"
    if item_code:
        filename += f"-{item_code}"
    return _serialize_report(data, fieldnames, format, filename)


@app.post("/api/actual-transfers/upload")
async def upload_actual_transfers(file: UploadFile = File(...)):
    rows = _parse_upload_file(file)
    if not rows:
        raise HTTPException(400, "File is empty")
    mapping = _normalize_headers(list(rows[0].keys()))

    def col(aliases):
        for h, canon in mapping.items():
            if canon in aliases:
                return h
        return None

    branch_col = col(["branch"])
    item_code_col = col(["item_no"])
    item_name_col = col(["item_name"])
    qty_col = col(["quantity"])
    date_col = col(["date"])

    if not item_code_col or not qty_col:
        raise HTTPException(400, "Missing required columns: item code and quantity")

    conn = get_conn()
    rows_to_insert = []
    for r in rows:
        item_code = str(r.get(item_code_col, "")).strip()
        if not item_code:
            continue
        qty = r.get(qty_col, 0)
        try:
            qty = float(qty)
        except (TypeError, ValueError):
            qty = 0
        rows_to_insert.append((
            str(r.get(branch_col, "")) if branch_col else "",
            item_code,
            str(r.get(item_name_col, "")) if item_name_col else "",
            qty,
            str(r.get(date_col, "")) if date_col else "",
        ))

    conn.executemany(
        "INSERT INTO actual_transfers (branch_code, item_code, item_name, quantity, date) VALUES (?,?,?,?,?)",
        rows_to_insert,
    )
    conn.commit()
    conn.close()
    return {"inserted": len(rows_to_insert), "skipped": len(rows) - len(rows_to_insert)}


@app.get("/api/dashboard/report")
def dashboard_report(
    branch: str = "all",
    period: int = 1,
    product: str = "all",
    from_date: str = "",
    to_date: str = "",
):
    """Compare forecast vs actual received per SKU and report discrepancies."""
    conn = get_conn()

    f_params = [period]
    f_sql = "SELECT item_no, item_name, branch, quantity, date FROM forecast_entries WHERE period = ?"
    if branch != "all":
        f_sql += " AND branch = ?"
        f_params.append(branch)
    if product != "all":
        f_sql += " AND (item_no = ? OR item_name = ?)"
        f_params.extend([product, product])
    forecast_rows = conn.execute(f_sql, f_params).fetchall()

    # Derive the period's date window (e.g. March = 2026-03-01..2026-03-31)
    period_dates = [r["date"] for r in forecast_rows if r["date"]]
    period_start = min(period_dates)[:10] if period_dates else ""
    period_end = ""
    if period_start:
        y, m = int(period_start[:4]), int(period_start[5:7])
        last_day = calendar.monthrange(y, m)[1]
        period_end = f"{period_start[:8]}{last_day:02d}"

    a_params = []
    a_sql = "SELECT branch_code, item_code, item_name, quantity, date FROM actual_transfers WHERE 1=1"
    if branch != "all":
        a_sql += " AND branch_code = ?"
        a_params.append(branch)
    if product != "all":
        a_sql += " AND (item_code = ? OR item_name = ?)"
        a_params.extend([product, product])
    if period_start:
        a_sql += " AND date >= ?"
        a_params.append(period_start)
    if period_dates:
        a_sql += " AND date <= ?"
        a_params.append(period_end)
    if from_date:
        a_sql += " AND date >= ?"
        a_params.append(from_date)
    if to_date:
        a_sql += " AND date <= ?"
        a_params.append(to_date)
    actual_rows = conn.execute(a_sql, a_params).fetchall()
    conn.close()

    # Also derive "actual sales" from loaded sales data for the branch/outlet window
    sales_by_key = get_sales_by_key()

    # Aggregate forecast by (item_no, item_name, branch)
    forecast_agg = {}
    for r in forecast_rows:
        key = (r["item_no"], (r["item_name"] or ""), (r["branch"] or ""))
        f = forecast_agg.setdefault(key, {"forecast": 0, "entries": 0})
        f["forecast"] += float(r["quantity"] or 0)
        f["entries"] += 1

    # Aggregate actual received by (item_code, item_name, branch)
    actual_agg = {}
    for r in actual_rows:
        key = (r["item_code"], (r["item_name"] or ""), (r["branch_code"] or ""))
        a = actual_agg.setdefault(key, {"actual_received": 0, "entries": 0})
        a["actual_received"] += float(r["quantity"] or 0)
        a["entries"] += 1

    report = []
    all_keys = set(forecast_agg.keys()) | set(actual_agg.keys())
    for key in all_keys:
        item_no, item_name, branch_name = key
        f = forecast_agg.get(key, {})
        a = actual_agg.get(key, {})
        forecast_qty = f.get("forecast", 0)
        actual_received = a.get("actual_received", 0)
        actual_sales = sales_by_key.get(f"{item_no}:{branch_name}", 0)
        discrepancy = forecast_qty - actual_received
        pct_error = (discrepancy / forecast_qty * 100) if forecast_qty else 0
        status = "accurate"
        if forecast_qty == 0 and actual_received > 0:
            status = "under-forecast"
        elif actual_received == 0 and forecast_qty > 0:
            status = "over-forecast"
        elif abs(pct_error) > 20:
            status = "over-forecast" if discrepancy > 0 else "under-forecast"
        report.append({
            "item_no": item_no,
            "item_name": item_name or item_no,
            "branch": branch_name or branch,
            "forecast": round(forecast_qty, 2),
            "actual_sales": round(actual_sales, 2),
            "actual_received": round(actual_received, 2),
            "discrepancy": round(discrepancy, 2),
            "pct_error": round(pct_error, 1),
            "status": status,
        })

    report.sort(key=lambda x: -abs(x["discrepancy"]))

    total_forecast = sum(r["forecast"] for r in report)
    total_actual = sum(r["actual_received"] for r in report)
    total_discrepancy = sum(abs(r["discrepancy"]) for r in report)
    wrong_skus = [r for r in report if r["status"] != "accurate"]
    pct_forecast_wrong = (total_discrepancy / total_forecast * 100) if total_forecast else 0

    return {
        "filters": {"branch": branch, "period": period, "product": product},
        "summary": {
            "total_skus": len(report),
            "total_forecast": round(total_forecast, 2),
            "total_actual_received": round(total_actual, 2),
            "total_discrepancy": round(total_discrepancy, 2),
            "wrong_skus_count": len(wrong_skus),
            "pct_forecast_wrong": round(pct_forecast_wrong, 1),
            "average_discrepancy": round(total_discrepancy / len(report), 2) if report else 0,
            "failure_rate": round(len(wrong_skus) / len(report) * 100, 1) if report else 0,
        },
        "report": report,
    }


@app.get("/api/products/list")
def list_products(from_uploads: int = 1):
    """Combined product catalog: seed products + unique items from uploaded data."""
    conn = get_conn()
    uploaded = conn.execute(
        "SELECT DISTINCT item_no AS code, item_name AS name FROM forecast_entries "
        "UNION SELECT DISTINCT item_code AS code, item_name AS name FROM actual_transfers"
    ).fetchall()
    conn.close()

    result = []
    for p in PRODUCT_PROFILES:
        result.append({"code": p["id"], "name": p["name"]})
    seen = {p["id"] for p in PRODUCT_PROFILES}
    for row in uploaded:
        if row["code"] and row["code"] not in seen:
            result.append({"code": row["code"], "name": row["name"] or row["code"]})
            seen.add(row["code"])
    return result


def _esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def _serialize_report(report, fieldnames, fmt, filename_base):
    """Serialize a list of row dicts to CSV/JSON/XML and return a FastAPI Response."""
    fmt = fmt.lower()
    if fmt == "json":
        return Response(
            json.dumps(report, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": f'attachment; filename="{filename_base}.json"'},
        )
    if fmt == "xml":
        xml_rows = []
        for r in report:
            row_parts = "".join(f"<{fn}>{_esc(r.get(fn, ''))}</{fn}>" for fn in fieldnames)
            xml_rows.append(f"  <row>{row_parts}</row>")
        content = '<?xml version="1.0" encoding="UTF-8"?>\n<report>\n' + "\n".join(xml_rows) + "\n</report>\n"
        return Response(
            content,
            media_type="application/xml",
            headers={"Content-Disposition": f'attachment; filename="{filename_base}.xml"'},
        )
    # CSV (default)
    buf = StringIO()
    writer = csv.DictWriter(buf, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(report)
    content = "\ufeff" + buf.getvalue()  # BOM for Excel
    return Response(
        content,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename_base}.csv"'},
    )


@app.get("/api/export")
def export_report(
    format: str = "csv",
    branch: str = "all",
    period: int = 1,
    product: str = "all",
):
    data = dashboard_report(branch, period, product)
    report = data["report"]
    fieldnames = ["item_no", "item_name", "branch", "forecast", "actual_sales", "actual_received", "discrepancy", "pct_error", "status"]
    return _serialize_report(report, fieldnames, format, f"dashboard-p{period}-{branch}")


def _esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


@app.post("/api/rop/mrp/upload")
async def upload_mrp(file: UploadFile = File(...)):
    rows = _parse_upload_file(file)
    if not rows:
        raise HTTPException(400, "File is empty")
    mapping = _normalize_headers(list(rows[0].keys()))

    def col(aliases):
        for h, canon in mapping.items():
            if canon in aliases:
                return h
        return None

    code_col = col(["item_no", "row_label", "code"])
    name_col = col(["product_name", "item_name", "raw_material"])
    req_col = col(["requirement_qty", "quantity", "mrp_monthly", "demand"])
    unit_col = col(["unit"])
    lt_col = col(["lead_time"])
    sd_col = col(["sigma_demand"])
    slt_col = col(["sigma_lead_time"])
    sl_col = col(["service_level"])
    price_col = col(["unit_price"])
    oc_col = col(["ordering_cost"])
    hc_col = col(["holding_cost"])
    soh_col = col(["stock_on_hand"])
    moq_col = col(["moq"])

    def fnum(r, key, default=0.0):
        if not key:
            return default
        try:
            return float(r.get(key) or default)
        except (TypeError, ValueError):
            return default

    conn = get_conn()
    conn.execute("DELETE FROM mrp_data")
    rows_to_insert = []
    for r in rows:
        name = str(r.get(name_col, "")).strip() if name_col else ""
        code = str(r.get(code_col, "")).strip() if code_col else ""
        qty = fnum(r, req_col)
        unit = str(r.get(unit_col, "")).strip() if unit_col else ""
        if not name and not code:
            continue
        rows_to_insert.append((
            code,
            name,
            qty,
            unit,
            fnum(r, lt_col, 1.0),
            fnum(r, sd_col),
            fnum(r, slt_col),
            fnum(r, sl_col, 95.0),
            fnum(r, price_col),
            fnum(r, oc_col),
            fnum(r, hc_col),
            fnum(r, soh_col),
            fnum(r, moq_col),
        ))

    conn.executemany(
        "INSERT INTO mrp_data (code, product_name, mrp_monthly, unit, lead_time_month, sigma_demand, sigma_lead_time, service_level, unit_price, ordering_cost, holding_cost, stock_on_hand, moq) "
        "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
        rows_to_insert,
    )
    conn.commit()
    conn.close()
    return {"inserted": len(rows_to_insert)}


@app.post("/api/rop/forecast/upload")
async def upload_accurate_forecast(file: UploadFile = File(...)):
    rows = _parse_upload_file(file)
    if not rows:
        raise HTTPException(400, "File is empty")
    mapping = _normalize_headers(list(rows[0].keys()))

    def col(aliases):
        for h, canon in mapping.items():
            if canon in aliases:
                return h
        return None

    item_no_col = col(["item_no"])
    item_name_col = col(["item_name"])
    branch_col = col(["branch"])
    qty_col = col(["quantity"])
    date_col = col(["date"])

    conn = get_conn()
    conn.execute("DELETE FROM accurate_forecast")
    inserted = 0
    for r in rows:
        item_no = str(r.get(item_no_col, "")).strip()
        if not item_no:
            continue
        conn.execute(
            "INSERT INTO accurate_forecast (item_no, item_name, branch, quantity, date) VALUES (?,?,?,?,?)",
            (
                item_no,
                str(r.get(item_name_col, "")) if item_name_col else "",
                str(r.get(branch_col, "")) if branch_col else "",
                float(r.get(qty_col, 0) or 0),
                str(r.get(date_col, "")) if date_col else "",
            ),
        )
        inserted += 1
    conn.commit()
    conn.close()
    return {"inserted": inserted}


@app.post("/api/rop/stock/upload")
async def upload_stock(file: UploadFile = File(...)):
    """Replace the stock-on-hand snapshot used by the ROP report."""
    rows = _parse_upload_file(file)
    if not rows:
        raise HTTPException(400, "File is empty")
    mapping = _normalize_headers(list(rows[0].keys()))

    def col(aliases):
        for h, canon in mapping.items():
            if canon in aliases:
                return h
        return None

    code_col = col(["item_no", "row_label", "code"])
    name_col = col(["item_name", "product_name"])
    qty_col = col(["quantity", "stock_on_hand"])

    if not code_col or not qty_col:
        raise HTTPException(400, "Missing required columns: item code and stock on hand")

    conn = get_conn()
    conn.execute("DELETE FROM stock_on_hand")
    inserted = 0
    for r in rows:
        code = str(r.get(code_col, "")).strip()
        if not code:
            continue
        qty = r.get(qty_col, 0)
        try:
            qty = float(qty)
        except (TypeError, ValueError):
            qty = 0
        conn.execute(
            "INSERT INTO stock_on_hand (item_code, item_name, quantity) VALUES (?,?,?)",
            (code, str(r.get(name_col, "")) if name_col else "", qty),
        )
        inserted += 1
    conn.commit()
    conn.close()
    return {"inserted": inserted}


SAMPLE_DIR = Path(__file__).resolve().parent.parent / "sample_data"


def _rows_from_path(path: Path):
    if path.name.lower().endswith((".xlsx", ".xls")):
        return pd.read_excel(path).to_dict("records")
    return pd.read_csv(path, encoding="utf-8-sig").to_dict("records")


def _find_col(mapping, aliases):
    for h, canon in mapping.items():
        if canon in aliases:
            return h
    return None


@app.post("/api/system/test-data")
def reset_test_data():
    """Clear all tables and reload the canonical sample_data set."""
    conn = get_conn()
    counts = {}
    try:
        conn.execute("DELETE FROM forecast_entries")
        inserted = 0
        for period in range(1, 7):
            path = SAMPLE_DIR / f"forecast_p{period}.csv"
            if not path.exists():
                continue
            rows = _rows_from_path(path)
            mapping = _normalize_headers(list(rows[0].keys()))
            item_no_col = _find_col(mapping, ["item_no"])
            item_name_col = _find_col(mapping, ["item_name"])
            branch_col = _find_col(mapping, ["branch"])
            qty_col = _find_col(mapping, ["quantity"])
            date_col = _find_col(mapping, ["date"])
            to_insert = []
            for r in rows:
                item_no = str(r.get(item_no_col, "")).strip() if item_no_col else ""
                if not item_no:
                    continue
                qty = 0
                if qty_col:
                    try:
                        qty = float(r.get(qty_col) or 0)
                    except (TypeError, ValueError):
                        qty = 0
                to_insert.append((
                    period,
                    item_no,
                    str(r.get(item_name_col, "")) if item_name_col else "",
                    str(r.get(branch_col, "")) if branch_col else "",
                    qty,
                    str(r.get(date_col, "")) if date_col else "",
                ))
            conn.executemany(
                "INSERT INTO forecast_entries (period, item_no, item_name, branch, quantity, date) VALUES (?,?,?,?,?,?)",
                to_insert,
            )
            inserted += len(to_insert)
        counts["forecast"] = inserted

        conn.execute("DELETE FROM actual_transfers")
        rows = _rows_from_path(SAMPLE_DIR / "actual_transfers.csv")
        mapping = _normalize_headers(list(rows[0].keys()))
        branch_col = _find_col(mapping, ["branch"])
        item_code_col = _find_col(mapping, ["item_no"])
        item_name_col = _find_col(mapping, ["item_name"])
        qty_col = _find_col(mapping, ["quantity"])
        date_col = _find_col(mapping, ["date"])
        to_insert = []
        for r in rows:
            item_code = str(r.get(item_code_col, "")).strip() if item_code_col else ""
            if not item_code:
                continue
            qty = 0
            if qty_col:
                try:
                    qty = float(r.get(qty_col) or 0)
                except (TypeError, ValueError):
                    qty = 0
            to_insert.append((
                str(r.get(branch_col, "")) if branch_col else "",
                item_code,
                str(r.get(item_name_col, "")) if item_name_col else "",
                qty,
                str(r.get(date_col, "")) if date_col else "",
            ))
        conn.executemany(
            "INSERT INTO actual_transfers (branch_code, item_code, item_name, quantity, date) VALUES (?,?,?,?,?)",
            to_insert,
        )
        counts["actual_transfers"] = len(to_insert)

        conn.execute("DELETE FROM mrp_data")
        rows = _rows_from_path(SAMPLE_DIR / "MRP_full.xlsx")
        mapping = _normalize_headers(list(rows[0].keys()))
        code_col = _find_col(mapping, ["item_no", "row_label", "code"])
        name_col = _find_col(mapping, ["product_name", "item_name", "raw_material"])
        req_col = _find_col(mapping, ["requirement_qty", "quantity", "mrp_monthly", "demand"])
        unit_col = _find_col(mapping, ["unit"])
        lt_col = _find_col(mapping, ["lead_time"])
        sd_col = _find_col(mapping, ["sigma_demand"])
        slt_col = _find_col(mapping, ["sigma_lead_time"])
        sl_col = _find_col(mapping, ["service_level"])
        price_col = _find_col(mapping, ["unit_price"])
        oc_col = _find_col(mapping, ["ordering_cost"])
        hc_col = _find_col(mapping, ["holding_cost"])
        soh_col = _find_col(mapping, ["stock_on_hand"])
        moq_col = _find_col(mapping, ["moq"])

        def fnum(r, key, default=0.0):
            if not key:
                return default
            try:
                return float(r.get(key) or default)
            except (TypeError, ValueError):
                return default

        to_insert = []
        for r in rows:
            name = str(r.get(name_col, "")).strip() if name_col else ""
            code = str(r.get(code_col, "")).strip() if code_col else ""
            if not name and not code:
                continue
            to_insert.append((
                code,
                name,
                fnum(r, req_col),
                str(r.get(unit_col, "")).strip() if unit_col else "",
                fnum(r, lt_col, 1.0),
                fnum(r, sd_col),
                fnum(r, slt_col),
                fnum(r, sl_col, 95.0),
                fnum(r, price_col),
                fnum(r, oc_col),
                fnum(r, hc_col),
                fnum(r, soh_col),
                fnum(r, moq_col),
            ))
        conn.executemany(
            "INSERT INTO mrp_data (code, product_name, mrp_monthly, unit, lead_time_month, sigma_demand, sigma_lead_time, service_level, unit_price, ordering_cost, holding_cost, stock_on_hand, moq) "
            "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
            to_insert,
        )
        counts["mrp"] = len(to_insert)

        conn.execute("DELETE FROM accurate_forecast")
        rows = _rows_from_path(SAMPLE_DIR / "accurate_forecast.csv")
        mapping = _normalize_headers(list(rows[0].keys()))
        item_no_col = _find_col(mapping, ["item_no"])
        item_name_col = _find_col(mapping, ["item_name"])
        branch_col = _find_col(mapping, ["branch"])
        qty_col = _find_col(mapping, ["quantity"])
        date_col = _find_col(mapping, ["date"])
        inserted = 0
        for r in rows:
            item_no = str(r.get(item_no_col, "")).strip() if item_no_col else ""
            if not item_no:
                continue
            qty = 0
            if qty_col:
                try:
                    qty = float(r.get(qty_col) or 0)
                except (TypeError, ValueError):
                    qty = 0
            conn.execute(
                "INSERT INTO accurate_forecast (item_no, item_name, branch, quantity, date) VALUES (?,?,?,?,?)",
                (
                    item_no,
                    str(r.get(item_name_col, "")) if item_name_col else "",
                    str(r.get(branch_col, "")) if branch_col else "",
                    qty,
                    str(r.get(date_col, "")) if date_col else "",
                ),
            )
            inserted += 1
        counts["accurate_forecast"] = inserted

        conn.execute("DELETE FROM stock_on_hand")
        rows = _rows_from_path(SAMPLE_DIR / "stock_on_hand.csv")
        mapping = _normalize_headers(list(rows[0].keys()))
        item_code_col = _find_col(mapping, ["item_no", "item_code", "code", "row_label"])
        item_name_col = _find_col(mapping, ["item_name", "product_name", "raw_material"])
        qty_col = _find_col(mapping, ["quantity", "stock_on_hand", "on_hand"])
        to_insert = []
        for r in rows:
            item_code = str(r.get(item_code_col, "")).strip() if item_code_col else ""
            if not item_code:
                continue
            qty = 0
            if qty_col:
                try:
                    qty = float(r.get(qty_col) or 0)
                except (TypeError, ValueError):
                    qty = 0
            to_insert.append((
                item_code,
                str(r.get(item_name_col, "")) if item_name_col else "",
                qty,
            ))
        conn.executemany(
            "INSERT INTO stock_on_hand (item_code, item_name, quantity) VALUES (?,?,?)",
            to_insert,
        )
        counts["stock_on_hand"] = len(to_insert)

        conn.commit()
    finally:
        conn.close()
    return {"ok": True, "counts": counts}


@app.get("/api/rop/report")
def rop_report():
    """Compare MRP monthly requirement against stock on hand.

    - SAFE (green): stock on hand covers the requirement.
    - SAFE overstocked (orange): stock exceeds the requirement by >25% - still safe.
    - ORDER (red): short - order_qty tells how much more to order.
    Stock comes from the uploaded stock_on_hand snapshot; a row with no stock
    entry counts as 0 (short).
    """
    conn = get_conn()
    mrp_rows = conn.execute("SELECT code, product_name, mrp_monthly FROM mrp_data").fetchall()
    stock_map = {
        r["item_code"]: float(r["quantity"] or 0)
        for r in conn.execute("SELECT item_code, quantity FROM stock_on_hand").fetchall()
    }
    conn.close()

    result = []
    for row in mrp_rows:
        code = str(row["code"] or "").strip() or str(row["product_name"] or "").strip()
        demand = float(row["mrp_monthly"] or 0)
        on_hand = stock_map.get(code, 0)

        if on_hand >= demand:
            overstocked = on_hand > demand * 1.25
            action = "SAFE - overstocked" if overstocked else "SAFE - enough stock"
            notes = "Stock exceeds +25% above requirement" if overstocked else "Stock covers requirement"
            order_qty = 0
        else:
            overstocked = False
            order_qty = math.ceil(demand - on_hand)
            action = f"ORDER {order_qty} units"
            notes = f"Order {order_qty} more units"

        result.append({
            "code": code,
            "raw_material": row["product_name"],
            "mrp_monthly": round(demand, 2),
            "stock_on_hand": round(on_hand, 2),
            "action": action,
            "order_more": order_qty,
            "notes": notes,
            "overstocked": overstocked,
        })

    # Largest shortages first
    result.sort(key=lambda x: x["mrp_monthly"] - x["stock_on_hand"], reverse=True)
    safe = sum(1 for r in result if r["action"].startswith("SAFE"))
    return {
        "total": len(result),
        "safe": safe,
        "reorder": len(result) - safe,
        "report": result,
    }


@app.get("/api/rop/report/export")
def export_rop_report(format: str = "csv"):
    data = rop_report()
    report = data["report"]
    fieldnames = [
        "code", "raw_material", "mrp_monthly", "stock_on_hand", "action", "order_more",
    ]
    return _serialize_report(report, fieldnames, format, "rop-report")


if DIST_DIR.exists():
    app.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="assets")

    @app.get("/")
    async def serve_index():
        return FileResponse(DIST_DIR / "index.html")

    @app.get("/{full_path:path}")
    async def serve_react(request: Request, full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = DIST_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(DIST_DIR / "index.html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
