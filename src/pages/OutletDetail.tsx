import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../store/DataContext'
import { calculateAverageDailySales, forecastDemand } from '../engine/forecast'
import { calculateOutletHealth } from '../engine/kpi'
import { generateRecommendations } from '../engine/recommendations'
import { detectTransferOpportunities } from '../engine/transfers'
import clsx from 'clsx'

export default function OutletDetail() {
  const { id } = useParams<{ id: string }>()
  const { products, outlets, sales, inventory, salesByProductOutlet } = useData()
  const navigate = useNavigate()

  const outlet = outlets.find(o => o.id === id)

  const outletData = useMemo(() => {
    if (!id) return null

    const productForecasts = products.map(product => {
      const f = forecastDemand(sales, product.id, id, 14, inventory, salesByProductOutlet)
      return { product, forecast: f }
    })

    const lowStock = productForecasts
      .filter(pf => pf.forecast.daysUntilStockout < 5)
      .sort((a, b) => a.forecast.daysUntilStockout - b.forecast.daysUntilStockout)

    const overstocked = productForecasts
      .filter(pf => pf.forecast.daysUntilStockout > 40)
      .sort((a, b) => b.forecast.daysUntilStockout - a.forecast.daysUntilStockout)

    const fastMoving = productForecasts
      .filter(pf => pf.forecast.recentAvgDaily > 15)
      .sort((a, b) => b.forecast.recentAvgDaily - a.forecast.recentAvgDaily)

    const slowMoving = productForecasts
      .filter(pf => pf.forecast.recentAvgDaily < 3 && pf.forecast.currentStock > 20)
      .sort((a, b) => a.forecast.recentAvgDaily - b.forecast.recentAvgDaily)

    const totalStock = productForecasts.reduce((s, pf) => s + pf.forecast.currentStock, 0)
    const totalValue = productForecasts.reduce((s, pf) => s + pf.forecast.currentStock * pf.product.sellingPrice, 0)

    const health = calculateOutletHealth(products, outlets.filter(o => o.id === id), sales, inventory)

    const recs = generateRecommendations(
      products,
      outlets.filter(o => o.id === id),
      sales,
      inventory
    )

    const transfers = detectTransferOpportunities(products, outlets, sales, inventory)
      .filter(t => t.fromOutletId === id || t.toOutletId === id)

    return {
      productForecasts,
      lowStock,
      overstocked,
      fastMoving,
      slowMoving,
      totalStock,
      totalValue,
      health: health[0],
      recommendations: recs.slice(0, 10),
      transfers: transfers.slice(0, 5),
    }
  }, [id, products, outlets, sales])

  if (!outlet || !outletData) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">Outlet not found</p>
        <button onClick={() => navigate('/outlets')} className="text-primary-600 text-sm mt-2 hover:underline">
          ← Back to Outlets
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/outlets')}
        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
        ← Back to Outlets
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{outlet.name} — Inventory Health</h1>
            <p className="text-sm text-gray-500 mt-1">{outlet.location}</p>
          </div>
          <div className={clsx(
            'w-16 h-16 rounded-xl flex items-center justify-center text-white text-xl font-bold',
            (outletData.health?.healthScore || 0) >= 80 ? 'bg-green-500' :
            (outletData.health?.healthScore || 0) >= 60 ? 'bg-yellow-500' :
            'bg-red-500'
          )}>
            {outletData.health?.healthScore || 0}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Total Stock</p>
            <p className="text-lg font-bold text-gray-900">{outletData.totalStock.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Est. Value</p>
            <p className="text-lg font-bold text-gray-900">${Math.round(outletData.totalValue).toLocaleString()}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <p className="text-xs text-red-500">Low Stock</p>
            <p className="text-lg font-bold text-red-700">{outletData.lowStock.length}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-xs text-purple-500">Overstocked</p>
            <p className="text-lg font-bold text-purple-700">{outletData.overstocked.length}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <p className="text-xs text-orange-500">Fast Moving</p>
            <p className="text-lg font-bold text-orange-700">{outletData.fastMoving.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Low Stock Items</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {outletData.lowStock.length === 0 && (
              <p className="text-sm text-gray-400 py-4 text-center">No low stock items</p>
            )}
            {outletData.lowStock.map(pf => (
              <div
                key={pf.product.id}
                className="flex items-center justify-between py-2 px-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100"
                onClick={() => navigate(`/products/${pf.product.id}`)}
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{pf.product.name}</p>
                  <p className="text-xs text-gray-500">{pf.product.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">
                    ~{pf.forecast.daysUntilStockout}d
                  </p>
                  <p className="text-xs text-gray-400">stock left</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Fast Moving Products</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {outletData.fastMoving.map(pf => (
              <div
                key={pf.product.id}
                className="flex items-center justify-between py-2 px-3 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100"
                onClick={() => navigate(`/products/${pf.product.id}`)}
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{pf.product.name}</p>
                  <p className="text-xs text-gray-500">{pf.product.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-600">
                    {pf.forecast.recentAvgDaily}/day
                  </p>
                  <p className="text-xs text-gray-400">
                    {pf.forecast.currentStock} in stock
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {outletData.transfers.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Transfer Opportunities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {outletData.transfers.map((t, i) => (
              <div key={i} className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800">{t.productName}</p>
                <div className="mt-2 space-y-1">
                  {t.fromOutletId === id ? (
                    <p className="text-xs text-blue-600">
                      <span className="font-medium">Outbound:</span> {t.suggestedTransfer} units → {t.toOutletName}
                    </p>
                  ) : (
                    <p className="text-xs text-blue-600">
                      <span className="font-medium">Inbound:</span> {t.suggestedTransfer} units ← {t.fromOutletName}
                    </p>
                  )}
                  <p className="text-xs text-blue-500 italic">{t.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Full Inventory</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium text-gray-500">Product</th>
                <th className="text-right py-2 font-medium text-gray-500">Stock</th>
                <th className="text-right py-2 font-medium text-gray-500">Avg Sales</th>
                <th className="text-right py-2 font-medium text-gray-500">Predicted</th>
                <th className="text-right py-2 font-medium text-gray-500">Days Left</th>
                <th className="text-right py-2 font-medium text-gray-500">Reorder Qty</th>
                <th className="text-right py-2 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {outletData.productForecasts
                .sort((a, b) => a.forecast.daysUntilStockout - b.forecast.daysUntilStockout)
                .map(pf => (
                <tr
                  key={pf.product.id}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/products/${pf.product.id}`)}
                >
                  <td className="py-2.5 font-medium text-gray-800">{pf.product.name}</td>
                  <td className="py-2.5 text-right text-gray-700">{pf.forecast.currentStock}</td>
                  <td className="py-2.5 text-right text-gray-600">{pf.forecast.recentAvgDaily}</td>
                  <td className="py-2.5 text-right text-primary-600 font-medium">{pf.forecast.predictedDemand}</td>
                  <td className="py-2.5 text-right">
                    <span className={clsx(
                      'font-semibold',
                      pf.forecast.daysUntilStockout < 3 ? 'text-red-600' :
                      pf.forecast.daysUntilStockout < 7 ? 'text-orange-600' :
                      'text-gray-700'
                    )}>
                      ~{pf.forecast.daysUntilStockout}d
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-gray-600">
                    {Math.round(pf.forecast.predictedDemand * 14)}
                  </td>
                  <td className="py-2.5 text-right">
                    <span className={clsx(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      pf.forecast.daysUntilStockout < 3 ? 'bg-red-100 text-red-700' :
                      pf.forecast.daysUntilStockout < 7 ? 'bg-orange-100 text-orange-700' :
                      pf.forecast.daysUntilStockout > 40 ? 'bg-purple-100 text-purple-700' :
                      'bg-green-100 text-green-700'
                    )}>
                      {pf.forecast.daysUntilStockout < 3 ? 'Critical' :
                       pf.forecast.daysUntilStockout < 7 ? 'Low Stock' :
                       pf.forecast.daysUntilStockout > 40 ? 'Overstock' : 'Healthy'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
