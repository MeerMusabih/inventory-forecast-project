from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import pandas as pd
import numpy as np
from pathlib import Path

from data.generator import generate_data, PRODUCT_PROFILES, OUTLETS
from models.baseline import train_baseline, predict_baseline
from models.holt_winters import train_holt_winters, predict_holt_winters
from models.arima_model import train_arima, predict_arima
from models.xgboost_model import train_xgboost, predict_xgboost
from models.evaluation import evaluate_all_models
from models.demand_correction import correct_series_for_training
from engine.inventory_optimization import optimize_inventory

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


if DIST_DIR.exists():
    app.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="assets")

    @app.get("/")
    async def serve_index():
        return FileResponse(DIST_DIR / "index.html")

    @app.get("/{full_path:path}")
    async def serve_react(request: Request, full_path: str):
        file_path = DIST_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(DIST_DIR / "index.html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
