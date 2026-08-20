const API_BASE = "";

export interface ForecastResult {
  product_id: string;
  outlet_id: string;
  train_size: number;
  test_size: number;
  future_dates: string[];
  actual: { dates: string[]; values: number[] };
  models: {
    baseline_sma?: {
      predictions: number[];
      lower_bound: number[];
      upper_bound: number[];
      params: { window: number; sma: number };
    };
    holt_winters?: {
      predictions: number[];
      lower_bound: number[];
      upper_bound: number[];
      params: { alpha: number; beta: number; gamma: number };
    };
    arima?: {
      predictions: number[];
      lower_bound: number[];
      upper_bound: number[];
      params: { order: number[]; aic: number };
    };
    xgboost?: {
      predictions: number[];
      lower_bound: number[];
      upper_bound: number[];
      top_features: { name: string; importance: number }[];
    };
  };
}

export interface ModelComparison {
  product_id: string;
  outlet_id: string;
  train_size: number;
  test_size: number;
  best_model: string;
  models: {
    baseline_sma?: {
      mae: number;
      rmse: number;
      mape: number;
      bias: number;
      improvement_vs_baseline?: number;
    };
    holt_winters?: {
      mae: number;
      rmse: number;
      mape: number;
      bias: number;
      improvement_vs_baseline?: number;
      params?: { alpha: number; beta: number; gamma: number };
    };
    arima?: {
      mae: number;
      rmse: number;
      mape: number;
      bias: number;
      improvement_vs_baseline?: number;
      params?: { order: number[] };
    };
    xgboost?: {
      mae: number;
      rmse: number;
      mape: number;
      bias: number;
      improvement_vs_baseline?: number;
      top_features?: { name: string; importance: number }[];
    };
  };
}

export interface InventoryOptimization {
  product_id: string;
  outlet_id: string;
  demand_stats: {
    avg_daily: number;
    std_daily: number;
    annual_demand: number;
    demand_cv: number;
    demand_trend_pct: number;
  };
  optimization: {
    eoq: number;
    safety_stock: number;
    reorder_point: number;
    lead_time_days: number;
    service_level_target: number;
  };
  current_status: {
    current_stock: number;
    days_of_stock: number;
    stockout_risk: string;
    zero_sales_days_30d: number;
  };
  weekly_pattern: number[];
}

export interface BatchForecast {
  total: number;
  forecasts: {
    product_id: string;
    outlet_id: string;
    avg_demand_30d: number;
    current_stock: number;
    days_of_stock: number;
    predicted_avg: number;
    model_params: { alpha: number; beta: number; gamma: number };
  }[];
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function getHealth(): Promise<{ status: string; rows: number }> {
  return fetchJSON("/api/health");
}

export async function getForecast(
  productId: string,
  outletId: string,
  steps: number = 14
): Promise<ForecastResult> {
  return fetchJSON(
    `/api/forecast/${productId}/${outletId}?steps=${steps}`
  );
}

export async function getModelComparison(
  productId: string,
  outletId: string
): Promise<ModelComparison> {
  return fetchJSON(`/api/model-comparison/${productId}/${outletId}`);
}

export async function getInventoryOptimization(
  productId: string,
  outletId: string
): Promise<InventoryOptimization> {
  return fetchJSON(`/api/inventory-optimization/${productId}/${outletId}`);
}

export async function getBatchForecast(
  steps: number = 14
): Promise<BatchForecast> {
  return fetchJSON(`/api/batch-forecast?steps=${steps}`);
}

export async function getSales(
  productId: string,
  outletId: string,
  days: number = 365
): Promise<{ dates: string[]; units_sold: number[]; revenue: number[]; closing_stock: number[] }> {
  return fetchJSON(`/api/sales/${productId}/${outletId}?days=${days}`);
}
