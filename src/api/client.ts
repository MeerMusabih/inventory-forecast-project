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

async function fetchText(url: string): Promise<string> {
  const res = await fetch(`${API_BASE}${url}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.text();
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

// ---------------------------------------------------------------------------
// New system API
// ---------------------------------------------------------------------------

export interface BranchInfo {
  id: string;
  code: string;
  name: string;
}

export interface ForecastPeriod {
  period: number;
  name: string;
  entries: number;
  first_date: string | null;
  last_date: string | null;
}

export interface ForecastEntry {
  id: number;
  period: number;
  item_no: string;
  item_name: string;
  branch: string;
  quantity: number;
  date: string;
}

export interface ActualTransfer {
  id: number;
  branch_code: string;
  item_code: string;
  item_name: string;
  quantity: number;
  date: string;
}

export interface DashboardRow {
  item_no: string;
  item_name: string;
  branch: string;
  forecast: number;
  actual_sales: number;
  actual_received: number;
  discrepancy: number;
  pct_error: number;
  status: string;
}

export interface DashboardReport {
  filters: { branch: string; period: number; product: string };
  summary: {
    total_skus: number;
    total_forecast: number;
    total_actual_received: number;
    total_discrepancy: number;
    wrong_skus_count: number;
    pct_forecast_wrong: number;
    average_discrepancy: number;
    failure_rate: number;
  };
  report: DashboardRow[];
}

export interface ProductCode {
  code: string;
  name: string;
}

export interface ROPRow {
  code: string;
  raw_material: string;
  mrp_monthly: number;
  lead_time_month: number;
  sigma_demand: number;
  sigma_lead_time: number;
  service_level: number;
  z_score: number;
  safety_stock: number;
  rop_per_month: number;
  notes: string;
  unit_price: number;
  ordering_cost: number;
  holding_cost: number;
  eoq: number;
  stock_on_hand: number;
  action: string;
  moq: number;
  inventory_rop_cost: number;
  inv_cost_ss: number;
}

export interface ROPReport {
  total: number;
  safe: number;
  reorder: number;
  report: ROPRow[];
}

async function postForm<T>(url: string, file: File): Promise<T> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}${url}`, { method: "POST", body: fd });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error: ${res.status} ${err}`);
  }
  return res.json();
}

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error: ${res.status} ${err}`);
  }
  return res.json();
}

export async function getBranches(): Promise<BranchInfo[]> {
  return fetchJSON("/api/branches");
}

export async function getForecastPeriods(): Promise<ForecastPeriod[]> {
  return fetchJSON("/api/forecast/periods");
}

export async function getForecastEntries(period: number): Promise<ForecastEntry[]> {
  return fetchJSON(`/api/forecast/entries?period=${period}&limit=20000`);
}

export async function uploadForecastFile(period: number, file: File): Promise<{ inserted: number; skipped: number; period: number }> {
  return postForm(`/api/forecast/upload?period=${period}`, file);
}

export async function clearForecast(period: number): Promise<{ cleared: number }> {
  const res = await fetch(`${API_BASE}/api/forecast/clear?period=${period}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getActualTransfers(
  branch: string,
  fromDate: string,
  toDate: string
): Promise<ActualTransfer[]> {
  const params = new URLSearchParams();
  if (branch && branch !== "all") params.set("branch", branch);
  if (fromDate) params.set("from_date", fromDate);
  if (toDate) params.set("to_date", toDate);
  return fetchJSON(`/api/actual-transfers?${params.toString()}`);
}

export async function addActualTransferEntry(payload: {
  branch_code: string;
  item_code: string;
  item_name?: string;
  quantity: number;
  date: string;
}): Promise<{ ok: boolean }> {
  return postJSON("/api/actual-transfers/entry", payload);
}

export async function uploadActualTransfersFile(file: File): Promise<{ inserted: number; skipped: number }> {
  return postForm("/api/actual-transfers/upload", file);
}

export async function getDashboardReport(
  branch: string,
  period: number,
  product: string
): Promise<DashboardReport> {
  const params = new URLSearchParams();
  params.set("branch", branch);
  params.set("period", String(period));
  params.set("product", product);
  return fetchJSON(`/api/dashboard/report?${params.toString()}`);
}

export async function getProductCodes(): Promise<ProductCode[]> {
  return fetchJSON("/api/products/list");
}

export async function exportDashboard(
  format: "csv" | "json" | "xml",
  branch: string,
  period: number,
  product: string
): Promise<string> {
  return fetchText(`/api/export?format=${format}&branch=${encodeURIComponent(branch)}&period=${period}&product=${encodeURIComponent(product)}`);
}

export async function exportROPReport(
  format: "csv" | "json" | "xml",
  params?: {
    service_level?: number;
    ordering_cost?: number;
    holding_cost?: number;
    default_lead_time?: number;
  }
): Promise<string> {
  const q = new URLSearchParams({ format });
  if (params) {
    if (params.service_level) q.set("service_level", String(params.service_level));
    if (params.ordering_cost) q.set("ordering_cost", String(params.ordering_cost));
    if (params.holding_cost) q.set("holding_cost", String(params.holding_cost));
    if (params.default_lead_time) q.set("default_lead_time", String(params.default_lead_time));
  }
  return fetchText(`/api/rop/report/export?${q.toString()}`);
}

export function downloadContent(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function uploadMRPFile(file: File): Promise<{ inserted: number }> {
  return postForm("/api/rop/mrp/upload", file);
}

export async function uploadAccurateForecastFile(file: File): Promise<{ inserted: number }> {
  return postForm("/api/rop/forecast/upload", file);
}

export async function getROPReport(params?: {
  service_level?: number;
  ordering_cost?: number;
  holding_cost?: number;
  default_lead_time?: number;
}): Promise<ROPReport> {
  const q = new URLSearchParams();
  if (params) {
    if (params.service_level) q.set("service_level", String(params.service_level));
    if (params.ordering_cost) q.set("ordering_cost", String(params.ordering_cost));
    if (params.holding_cost) q.set("holding_cost", String(params.holding_cost));
    if (params.default_lead_time) q.set("default_lead_time", String(params.default_lead_time));
  }
  return fetchJSON(`/api/rop/report?${q.toString()}`);
}
