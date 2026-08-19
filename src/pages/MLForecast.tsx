import { useMemo, useState, useEffect } from 'react'
import { useFilteredData } from '../hooks/useFilteredData'
import { getModelComparison, getInventoryOptimization, type ModelComparison, type InventoryOptimization } from '../api/client'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'
import clsx from 'clsx'

const MODEL_COLORS: Record<string, string> = {
  baseline_sma: '#94a3b8',
  holt_winters: '#3b82f6',
  arima: '#10b981',
  xgboost: '#f59e0b',
}

const MODEL_LABELS: Record<string, string> = {
  baseline_sma: 'Baseline SMA',
  holt_winters: 'Holt-Winters',
  arima: 'ARIMA',
  xgboost: 'XGBoost',
}

export default function MLForecast() {
  const { products, outlets } = useFilteredData()
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [selectedOutlet, setSelectedOutlet] = useState<string>('')
  const [comparison, setComparison] = useState<ModelComparison | null>(null)
  const [optimization, setOptimization] = useState<InventoryOptimization | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const productsByName = useMemo(() => {
    const map: Record<string, string> = {}
    for (const p of products) map[p.id] = p.name
    return map
  }, [products])

  const outletsByName = useMemo(() => {
    const map: Record<string, string> = {}
    for (const o of outlets) map[o.id] = o.name
    return map
  }, [outlets])

  useEffect(() => {
    if (!selectedProduct || !selectedOutlet) return
    setLoading(true)
    setError(null)
    Promise.all([
      getModelComparison(selectedProduct, selectedOutlet),
      getInventoryOptimization(selectedProduct, selectedOutlet),
    ])
      .then(([comp, opt]) => {
        setComparison(comp)
        setOptimization(opt)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [selectedProduct, selectedOutlet])

  const radarData = useMemo(() => {
    if (!comparison) return []
    return Object.entries(comparison.models)
      .filter(([_, v]) => v && 'rmse' in v)
      .map(([name, v]) => ({
        model: MODEL_LABELS[name] || name,
        accuracy: Math.max(0, 100 - ((v as any).rmse / 2)),
        speed: name === 'xgboost' ? 90 : name === 'arima' ? 75 : name === 'holt_winters' ? 85 : 95,
        adaptability: name === 'xgboost' ? 85 : name === 'arima' ? 60 : name === 'holt_winters' ? 70 : 20,
        interpretability: name === 'xgboost' ? 70 : name === 'arima' ? 50 : name === 'holt_winters' ? 80 : 95,
      }))
  }, [comparison])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ML Model Comparison</h1>
        <p className="text-sm text-gray-500 mt-1">
          Compare 4 machine learning models — SMA, Holt-Winters, ARIMA, XGBoost
        </p>
      </div>

      {/* Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Outlet</label>
            <select
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select an outlet</option>
              {outlets.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-3">Training ML models...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 rounded-xl border border-red-200 p-5">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {!loading && comparison && (
        <>
          {/* Model Accuracy Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Model Accuracy (RMSE)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={Object.entries(comparison.models)
                    .filter(([_, v]) => v && 'rmse' in v)
                    .map(([name, v]) => ({
                      name: MODEL_LABELS[name] || name,
                      rmse: (v as any).rmse,
                      improvement: (v as any).improvement_vs_baseline || 0,
                    }))}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === 'rmse' ? value.toFixed(2) : `+${value.toFixed(1)}%`,
                      name === 'rmse' ? 'RMSE' : 'Improvement',
                    ]}
                  />
                  <Bar dataKey="rmse" radius={[0, 4, 4, 0]}>
                    {Object.entries(comparison.models)
                      .filter(([_, v]) => v && 'rmse' in v)
                      .map(([name]) => (
                        <Cell key={name} fill={MODEL_COLORS[name] || '#94a3b8'} />
                      ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Model Characteristics</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="model" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Accuracy" dataKey="accuracy" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                  <Radar name="Adaptability" dataKey="adaptability" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                  <Radar name="Interpretability" dataKey="interpretability" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Detailed Metrics</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-gray-600 font-medium">Model</th>
                    <th className="text-right py-2 px-3 text-gray-600 font-medium">RMSE</th>
                    <th className="text-right py-2 px-3 text-gray-600 font-medium">MAE</th>
                    <th className="text-right py-2 px-3 text-gray-600 font-medium">MAPE</th>
                    <th className="text-right py-2 px-3 text-gray-600 font-medium">Bias</th>
                    <th className="text-right py-2 px-3 text-gray-600 font-medium">Improvement</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(comparison.models)
                    .filter(([_, v]) => v && 'rmse' in v)
                    .sort(([_, a], [__, b]) => ((a as any).rmse || 999) - ((b as any).rmse || 999))
                    .map(([name, v]) => {
                      const data = v as any
                      const isBest = name === comparison.best_model
                      return (
                        <tr key={name} className={clsx(
                          'border-b border-gray-100',
                          isBest && 'bg-green-50'
                        )}>
                          <td className="py-2 px-3 font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: MODEL_COLORS[name] }}></div>
                              {MODEL_LABELS[name] || name}
                              {isBest && (
                                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Best</span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-right">{data.rmse.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right">{data.mae.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right">{data.mape.toFixed(1)}%</td>
                          <td className="py-2 px-3 text-right">
                            <span className={data.bias > 0 ? 'text-blue-600' : 'text-orange-600'}>
                              {data.bias > 0 ? '+' : ''}{data.bias.toFixed(1)}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            {data.improvement_vs_baseline !== undefined ? (
                              <span className="text-green-600 font-medium">
                                +{data.improvement_vs_baseline.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* XGBoost Feature Importance */}
          {comparison.models.xgboost && 'top_features' in comparison.models.xgboost && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">XGBoost — Feature Importance</h3>
              <div className="space-y-2">
                {(comparison.models.xgboost as any).top_features.map((f: any, i: number) => (
                  <div key={f.name} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-4">{i + 1}.</span>
                    <span className="text-sm text-gray-700 w-32 font-mono">{f.name}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-3">
                      <div
                        className="bg-amber-500 rounded-full h-3 transition-all"
                        style={{ width: `${f.importance * 100 * 4}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 w-12 text-right">{(f.importance * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inventory Optimization */}
          {optimization && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Inventory Optimization</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-medium">Economic Order Qty</p>
                    <p className="text-xl font-bold text-blue-800">{optimization.optimization.eoq}</p>
                    <p className="text-xs text-blue-500">units per order</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-600 font-medium">Safety Stock</p>
                    <p className="text-xl font-bold text-green-800">{optimization.optimization.safety_stock}</p>
                    <p className="text-xs text-green-500">buffer units</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-xs text-orange-600 font-medium">Reorder Point</p>
                    <p className="text-xl font-bold text-orange-800">{optimization.optimization.reorder_point}</p>
                    <p className="text-xs text-orange-500">units trigger</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-purple-600 font-medium">Service Level</p>
                    <p className="text-xl font-bold text-purple-800">
                      {(optimization.optimization.service_level_target * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-purple-500">target fill rate</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Current Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Stock</span>
                    <span className="font-bold text-gray-900">{optimization.current_status.current_stock} units</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Days of Stock</span>
                    <span className={clsx(
                      'font-bold',
                      optimization.current_status.days_of_stock < 3 ? 'text-red-600' :
                      optimization.current_status.days_of_stock < 7 ? 'text-orange-600' :
                      'text-green-600'
                    )}>
                      {optimization.current_status.days_of_stock} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Stockout Risk</span>
                    <span className={clsx(
                      'text-xs px-2 py-1 rounded-full font-medium',
                      optimization.current_status.stockout_risk === 'high' ? 'bg-red-100 text-red-700' :
                      optimization.current_status.stockout_risk === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    )}>
                      {optimization.current_status.stockout_risk}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Zero-Sales Days (30d)</span>
                    <span className="font-bold text-gray-900">{optimization.current_status.zero_sales_days_30d}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Demand Trend</span>
                    <span className={clsx(
                      'font-bold',
                      optimization.demand_stats.demand_trend_pct > 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {optimization.demand_stats.demand_trend_pct > 0 ? '+' : ''}
                      {optimization.demand_stats.demand_trend_pct}%
                    </span>
                  </div>
                </div>

                {/* Weekly Pattern */}
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Weekly Demand Pattern</p>
                  <div className="grid grid-cols-7 gap-1">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                      const val = optimization.weekly_pattern[i]
                      const max = Math.max(...optimization.weekly_pattern)
                      const pct = max > 0 ? (val / max) * 100 : 0
                      return (
                        <div key={day} className="text-center">
                          <div className="h-16 bg-gray-100 rounded flex items-end justify-center">
                            <div
                              className="w-full bg-blue-500 rounded-t transition-all"
                              style={{ height: `${pct}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{day}</p>
                          <p className="text-xs text-gray-400">{val.toFixed(0)}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!loading && !comparison && selectedProduct && selectedOutlet && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-lg">Select a product and outlet to compare models</p>
        </div>
      )}
    </div>
  )
}
