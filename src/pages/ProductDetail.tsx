import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../store/DataContext'
import { useFilters } from '../store/FilterContext'
import { calculateAverageDailySales, forecastDemand } from '../engine/forecast'
import { buildDemandHeatmap } from '../engine/heatmap'
import ForecastChart from '../components/charts/ForecastChart'
import clsx from 'clsx'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { products, outlets, sales, inventory, salesByProductOutlet } = useData()
  const { selectedOutlet } = useFilters()
  const navigate = useNavigate()

  const product = products.find(p => p.id === id)

  const productSales = useMemo(() => {
    if (!id) return []
    return sales
      .filter(s => s.productId === id)
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [sales, id])

  const outletForecasts = useMemo(() => {
    if (!id) return []
    return outlets.map(outlet => {
      const f = forecastDemand(sales, id, outlet.id, 14, inventory, salesByProductOutlet)
      return { outlet, forecast: f }
    })
  }, [outlets, sales, id, inventory, salesByProductOutlet])

  const salesByDate = useMemo(() => {
    const byDate: Record<string, { date: string; units: number; revenue: number }> = {}
    for (const s of productSales) {
      if (!byDate[s.date]) byDate[s.date] = { date: s.date, units: 0, revenue: 0 }
      byDate[s.date].units += s.unitsSold
      byDate[s.date].revenue += s.revenue
    }
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)).slice(-90)
  }, [productSales])

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">Product not found</p>
        <button onClick={() => navigate('/products')} className="text-primary-600 text-sm mt-2 hover:underline">
          ← Back to Products
        </button>
      </div>
    )
  }

  const primaryOutlet = selectedOutlet !== 'all'
    ? outlets.find(o => o.id === selectedOutlet) || outlets[0]
    : outletForecasts.sort((a, b) => a.forecast.daysUntilStockout - b.forecast.daysUntilStockout)[0]?.outlet

  const primaryForecast = primaryOutlet
    ? forecastDemand(sales, product.id, primaryOutlet.id, 14, inventory)
    : null

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/products')}
        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
        ← Back to Products
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{product.category} · {product.supplier}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">${product.sellingPrice}</p>
            <p className="text-xs text-gray-400">Retail price</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Unit Cost</p>
            <p className="text-sm font-bold text-gray-900">${product.cost}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Margin</p>
            <p className="text-sm font-bold text-green-600">
              {((product.sellingPrice - product.cost) / product.sellingPrice * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Unit</p>
            <p className="text-sm font-bold text-gray-900">{product.unit}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Reorder Point</p>
            <p className="text-sm font-bold text-gray-900">{product.reorderPoint}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Avg Daily Demand</p>
            <p className="text-sm font-bold text-primary-600">{product.averageDailyDemand}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Outlets</p>
            <p className="text-sm font-bold text-gray-900">{outlets.length}</p>
          </div>
        </div>
      </div>

      {primaryForecast && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Forecast — {primaryOutlet?.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-600">Current Stock</p>
              <p className="text-xl font-bold text-blue-800">{primaryForecast.currentStock}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-600">Predicted Daily Demand</p>
              <p className="text-xl font-bold text-blue-800">{primaryForecast.predictedDemand}</p>
            </div>
            <div className={clsx(
              'rounded-lg p-3',
              primaryForecast.daysUntilStockout < 3 ? 'bg-red-50' :
              primaryForecast.daysUntilStockout < 7 ? 'bg-orange-50' : 'bg-green-50'
            )}>
              <p className={clsx(
                'text-xs',
                primaryForecast.daysUntilStockout < 3 ? 'text-red-600' :
                primaryForecast.daysUntilStockout < 7 ? 'text-orange-600' : 'text-green-600'
              )}>Days Until Stockout</p>
              <p className={clsx(
                'text-xl font-bold',
                primaryForecast.daysUntilStockout < 3 ? 'text-red-800' :
                primaryForecast.daysUntilStockout < 7 ? 'text-orange-800' : 'text-green-800'
              )}>
                ~{primaryForecast.daysUntilStockout} days
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Recommended Reorder</p>
              <p className="text-xl font-bold text-gray-800">
                {Math.round(primaryForecast.predictedDemand * 14)} units
              </p>
            </div>
          </div>
          <ForecastChart forecast={primaryForecast} height={250} />
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Outlet Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium text-gray-500">Outlet</th>
                <th className="text-right py-2 font-medium text-gray-500">Avg Daily Sales</th>
                <th className="text-right py-2 font-medium text-gray-500">Current Stock</th>
                <th className="text-right py-2 font-medium text-gray-500">Predicted Demand</th>
                <th className="text-right py-2 font-medium text-gray-500">Days Remaining</th>
                <th className="text-right py-2 font-medium text-gray-500">Trend</th>
                <th className="text-right py-2 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {outletForecasts.map(({ outlet, forecast }) => (
                <tr key={outlet.id} className="border-b border-gray-50">
                  <td className="py-3 font-medium text-gray-800">{outlet.name}</td>
                  <td className="py-3 text-right text-gray-600">{forecast.recentAvgDaily}</td>
                  <td className="py-3 text-right text-gray-700 font-medium">{forecast.currentStock}</td>
                  <td className="py-3 text-right text-primary-600 font-medium">{forecast.predictedDemand}</td>
                  <td className="py-3 text-right">
                    <span className={clsx(
                      'font-semibold',
                      forecast.daysUntilStockout < 3 ? 'text-red-600' :
                      forecast.daysUntilStockout < 7 ? 'text-orange-600' :
                      'text-green-600'
                    )}>
                      ~{forecast.daysUntilStockout} days
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className={clsx(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      forecast.trend === 'increasing' ? 'bg-blue-50 text-blue-700' :
                      forecast.trend === 'decreasing' ? 'bg-orange-50 text-orange-700' :
                      'bg-gray-50 text-gray-700'
                    )}>
                      {forecast.trend}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className={clsx(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      forecast.daysUntilStockout < 3 ? 'bg-red-100 text-red-700' :
                      forecast.daysUntilStockout < 7 ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    )}>
                      {forecast.daysUntilStockout < 3 ? 'Critical' :
                       forecast.daysUntilStockout < 7 ? 'Low Stock' : 'Healthy'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {salesByDate.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Historical Sales</h2>
          <div className="h-64 flex items-end gap-px">
            {salesByDate.map((d, i) => {
              const maxUnits = Math.max(...salesByDate.map(x => x.units))
              const height = maxUnits > 0 ? (d.units / maxUnits) * 100 : 0
              return (
                <div
                  key={i}
                  className="flex-1 bg-primary-500 rounded-t hover:bg-primary-600 transition-colors relative group"
                  style={{ height: `${height}%`, minHeight: 2 }}
                  title={`${d.date}: ${d.units} units, $${Math.round(d.revenue)}`}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {d.date}: {d.units} units
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>{salesByDate[0]?.date}</span>
            <span>{salesByDate[salesByDate.length - 1]?.date}</span>
          </div>
        </div>
      )}
    </div>
  )
}
