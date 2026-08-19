import { useMemo, useState } from 'react'
import { useFilteredData } from '../hooks/useFilteredData'
import { forecastDemand } from '../engine/forecast'
import ForecastChart from '../components/charts/ForecastChart'
import type { ForecastResult } from '../data/types'
import clsx from 'clsx'

export default function Forecast() {
  const { products, outlets, sales, inventory, salesByProductOutlet } = useFilteredData()
  const [selectedForecast, setSelectedForecast] = useState<ForecastResult | null>(null)

  const forecasts = useMemo(() => {
    const results: ForecastResult[] = []
    for (const outlet of outlets) {
      for (const product of products) {
        const f = forecastDemand(sales, product.id, outlet.id, 14, inventory, salesByProductOutlet)
        if (f.historicalAvgDaily > 1) {
          results.push(f)
        }
      }
    }
    return results.sort((a, b) => {
      const priority: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
      if (a.daysUntilStockout < 3 && b.daysUntilStockout >= 3) return -1
      if (b.daysUntilStockout < 3 && a.daysUntilStockout >= 3) return 1
      return a.daysUntilStockout - b.daysUntilStockout
    })
  }, [products, outlets, sales, salesByProductOutlet])

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Demand Forecast</h1>
        <p className="text-sm text-gray-500 mt-1">
          Predicted demand based on historical sales patterns — Prototype Model
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-5 max-h-[800px] overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Product Forecasts</h3>
          <div className="space-y-1">
            {forecasts.slice(0, 100).map((f, i) => (
              <button
                key={`${f.productId}-${f.outletId}`}
                onClick={() => setSelectedForecast(f)}
                className={clsx(
                  'w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors',
                  selectedForecast?.productId === f.productId && selectedForecast?.outletId === f.outletId
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'hover:bg-gray-50 text-gray-700'
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium truncate">{productsByName[f.productId]}</p>
                    <p className="text-xs text-gray-400">{outletsByName[f.outletId]}</p>
                  </div>
                  <div className="text-right">
                    <p className={clsx(
                      'font-semibold',
                      f.daysUntilStockout < 3 ? 'text-red-600' :
                      f.daysUntilStockout < 7 ? 'text-orange-600' :
                      'text-gray-600'
                    )}>
                      {f.daysUntilStockout}d
                    </p>
                    <p className="text-xs text-gray-400">stock left</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedForecast ? (
            <>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-lg font-bold text-gray-900">
                  {productsByName[selectedForecast.productId]}
                </h3>
                <p className="text-sm text-gray-500">{outletsByName[selectedForecast.outletId]}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Current Stock</p>
                    <p className="text-lg font-bold text-gray-900">{selectedForecast.currentStock}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Historical Avg</p>
                    <p className="text-lg font-bold text-gray-900">{selectedForecast.historicalAvgDaily}</p>
                    <p className="text-xs text-gray-400">units/day</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Predicted Demand</p>
                    <p className="text-lg font-bold text-primary-600">{selectedForecast.predictedDemand}</p>
                    <p className="text-xs text-gray-400">units/day</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Days Until Stockout</p>
                    <p className={clsx(
                      'text-lg font-bold',
                      selectedForecast.daysUntilStockout < 3 ? 'text-red-600' :
                      selectedForecast.daysUntilStockout < 7 ? 'text-orange-600' :
                      'text-green-600'
                    )}>
                      ~{selectedForecast.daysUntilStockout} days
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <span className={clsx(
                    'text-xs px-2 py-1 rounded-full font-medium',
                    selectedForecast.confidence === 'high' ? 'bg-green-50 text-green-700' :
                    selectedForecast.confidence === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-red-50 text-red-700'
                  )}>
                    {selectedForecast.confidence} confidence
                  </span>
                  <span className={clsx(
                    'text-xs px-2 py-1 rounded-full font-medium',
                    selectedForecast.trend === 'increasing' ? 'bg-blue-50 text-blue-700' :
                    selectedForecast.trend === 'decreasing' ? 'bg-orange-50 text-orange-700' :
                    'bg-gray-50 text-gray-700'
                  )}>
                    Trend: {selectedForecast.trend}
                  </span>
                </div>
              </div>

              <ForecastChart forecast={selectedForecast} />

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Daily Forecast Breakdown</h3>
                <div className="grid grid-cols-7 gap-2">
                  {selectedForecast.forecastDays.map((d, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-400">{new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                      <p className="text-xs text-gray-500">{new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      <p className="text-sm font-bold text-gray-800 mt-1">{d.predicted}</p>
                      <p className="text-xs text-gray-400">units</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-400 text-lg">← Select a product to view its demand forecast</p>
              <p className="text-gray-300 text-sm mt-2">Choose from the list on the left to see predicted demand, confidence levels, and daily breakdowns</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
