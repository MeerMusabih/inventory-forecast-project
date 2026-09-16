from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
import pandas as pd
import numpy as np
import math
import statistics
import json
import csv
from pathlib import Path
from io import BytesIO, StringIO
from typing import Optional
from scipy import stats as scipy_stats

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
        elif key_alias in ("item_name", "itemname", "item,item", "product_name", "product", "name", "description"):
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
        elif key_alias in ("sum_of_requirement_quantities", "requirement_qty", "requirement", "mrp_monthly"):
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
        elif key_alias in ("stock_on_hand", "stock", "on_hand", "current_stock", "opening_stock", "stockonthhand"):
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
    periods = []
    for p in range(1, 7):
        periods.append({
            "period": p,
            "name": f"Period {p}",
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
def get_actual_transfers(branch: str = "", from_date: str = "", to_date: str = ""):
    conn = get_conn()
    sql = "SELECT id, branch_code, item_code, item_name, quantity, date FROM actual_transfers WHERE 1=1"
    params = []
    if branch and branch != "all":
        sql += " AND branch_code = ?"
        params.append(branch)
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

    a_params = []
    a_sql = "SELECT branch_code, item_code, item_name, quantity, date FROM actual_transfers WHERE 1=1"
    if branch != "all":
        a_sql += " AND branch_code = ?"
        a_params.append(branch)
    if product != "all":
        a_sql += " AND (item_code = ? OR item_name = ?)"
        a_params.extend([product, product])
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


def _z_score(service_level):
    return scipy_stats.norm.ppf(float(service_level) / 100.0)


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


@app.get("/api/rop/report")
def rop_report(
    service_level: float = 95.0,
    ordering_cost: float = 0.0,
    holding_cost: float = 0.0,
    default_lead_time: float = 1.0,
):
    """Generate the ROP table comparing MRP vs Stock on Hand.
    Optional global params fill in for rows where the MRP file left them blank.
    """
    conn = get_conn()
    mrp_rows = conn.execute("SELECT * FROM mrp_data").fetchall()
    fc_rows = conn.execute("SELECT item_no, quantity FROM accurate_forecast").fetchall()

    # Estimate stock on hand from the core inventory data when available
    stock_by_name = {}
    try:
        df = get_data()
        latest_idx = df.groupby("product_id")["date"].idxmax()
        latest_snapshot = df.loc[latest_idx]
        for _, row in latest_snapshot.iterrows():
            key = str(row["product_id"])
            stock_by_name[key] = float(row.get("closing_stock", 0) or 0)
    except Exception:
        pass

    # Demand std per product from accurate forecast (per item_no)
    demand_std_map = {}
    demand_vals = {}
    for r in fc_rows:
        demand_vals.setdefault(r["item_no"], []).append(float(r["quantity"] or 0))
    for k, v in demand_vals.items():
        demand_std_map[k] = statistics.pstdev(v) if len(v) > 1 else 0.0

    result = []
    for row in mrp_rows:
        demand = float(row["mrp_monthly"] or 0)
        lead_time = float(row["lead_time_month"] or 0) or default_lead_time
        sigma_demand = float(row["sigma_demand"] or 0) or demand_std_map.get(row["code"] or row["product_name"], 0)
        sigma_lead = float(row["sigma_lead_time"] or 0)
        service_level = float(row["service_level"] or 0) or service_level
        unit_price = float(row["unit_price"] or 0)
        ordering_cost = float(row["ordering_cost"] or 0) or ordering_cost
        holding_cost = float(row["holding_cost"] or 0) or holding_cost
        moq = float(row["moq"] or 0)

        z = _z_score(service_level)
        # Safety stock = Z * sqrt(LT * sigma_d^2 + demand^2 * sigma_LT^2)
        variance = lead_time * sigma_demand ** 2 + demand ** 2 * sigma_lead ** 2
        safety_stock = z * math.sqrt(variance) if variance > 0 else 0
        rop_monthly = demand * lead_time + safety_stock
        annual_demand = demand * 12
        eoq = math.sqrt((2 * annual_demand * ordering_cost) / holding_cost) if holding_cost > 0 and ordering_cost > 0 else 0
        stock_on_hand = float(row["stock_on_hand"] or 0)
        if stock_on_hand == 0:
            stock_on_hand = stock_by_name.get(row["code"] or row["product_name"], 0)

        if stock_on_hand >= rop_monthly:
            action = "SAFE - no order needed"
            notes = "Stock covers ROP"
        else:
            order_qty = rop_monthly - stock_on_hand
            if moq and order_qty < moq:
                order_qty = moq
            action = f"ORDER {math.ceil(order_qty)} units"
            notes = "Below ROP - reorder required"

        inv_rop_cost = rop_monthly * unit_price
        inv_cost_ss = safety_stock * unit_price * holding_cost

        result.append({
            "code": row["code"],
            "raw_material": row["product_name"],
            "mrp_monthly": round(demand, 2),
            "lead_time_month": round(lead_time, 2),
            "sigma_demand": round(sigma_demand, 2),
            "sigma_lead_time": round(sigma_lead, 2),
            "service_level": round(service_level, 1),
            "z_score": round(z, 4),
            "safety_stock": round(safety_stock, 2),
            "rop_per_month": round(rop_monthly, 2),
            "notes": notes,
            "unit_price": round(unit_price, 2),
            "ordering_cost": round(ordering_cost, 2),
            "holding_cost": round(holding_cost, 2),
            "eoq": round(eoq, 2),
            "stock_on_hand": round(stock_on_hand, 2),
            "action": action,
            "moq": round(moq, 2),
            "inventory_rop_cost": round(inv_rop_cost, 2),
            "inv_cost_ss": round(inv_cost_ss, 2),
        })

    result.sort(key=lambda x: x["rop_per_month"] - x["stock_on_hand"], reverse=True)
    safe = sum(1 for r in result if r["action"].startswith("SAFE"))
    conn.close()
    return {
        "total": len(result),
        "safe": safe,
        "reorder": len(result) - safe,
        "report": result,
    }


@app.get("/api/rop/report/export")
def export_rop_report(
    format: str = "csv",
    service_level: float = 95.0,
    ordering_cost: float = 50.0,
    holding_cost: float = 0.1,
    default_lead_time: float = 1.0,
):
    data = rop_report(service_level, ordering_cost, holding_cost, default_lead_time)
    report = data["report"]
    fieldnames = [
        "code", "raw_material", "mrp_monthly", "lead_time_month", "sigma_demand",
        "sigma_lead_time", "service_level", "z_score", "safety_stock", "rop_per_month",
        "notes", "unit_price", "ordering_cost", "holding_cost", "eoq",
        "stock_on_hand", "action", "moq", "inventory_rop_cost", "inv_cost_ss",
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
