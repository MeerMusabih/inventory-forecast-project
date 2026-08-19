import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFilteredData } from '../hooks/useFilteredData'
import { calculateOutletHealth } from '../engine/kpi'
import clsx from 'clsx'

export default function Outlets() {
  const { allProducts, allOutlets, allSales, inventory } = useFilteredData()
  const navigate = useNavigate()

  const health = useMemo(() => calculateOutletHealth(allProducts, allOutlets, allSales, inventory), [allProducts, allOutlets, allSales, inventory])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Outlets</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of all store locations and their inventory health</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {health.map(h => {
          const outlet = allOutlets.find(o => o.id === h.outletId)
          return (
            <div
              key={h.outletId}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/outlets/${h.outletId}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{h.outletName}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{outlet?.location}</p>
                  <span className={clsx(
                    'text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block',
                    outlet?.type === 'urban' ? 'bg-blue-50 text-blue-700' :
                    outlet?.type === 'suburban' ? 'bg-green-50 text-green-700' :
                    'bg-orange-50 text-orange-700'
                  )}>
                    {outlet?.type}
                  </span>
                </div>
                <div className={clsx(
                  'w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-bold',
                  h.healthScore >= 80 ? 'bg-green-500' :
                  h.healthScore >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                )}>
                  {h.healthScore}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Total Stock</p>
                  <p className="text-sm font-bold text-gray-800">{h.totalStock.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Products</p>
                  <p className="text-sm font-bold text-gray-800">{h.totalProducts}</p>
                </div>
                <div className={clsx(
                  'rounded-lg p-3',
                  h.lowStock > 15 ? 'bg-red-50' : 'bg-gray-50'
                )}>
                  <p className={clsx('text-xs', h.lowStock > 15 ? 'text-red-500' : 'text-gray-500')}>Low Stock</p>
                  <p className={clsx('text-sm font-bold', h.lowStock > 15 ? 'text-red-700' : 'text-gray-800')}>
                    {h.lowStock}
                  </p>
                </div>
                <div className={clsx(
                  'rounded-lg p-3',
                  h.predictedStockouts > 10 ? 'bg-red-50' : 'bg-gray-50'
                )}>
                  <p className={clsx('text-xs', h.predictedStockouts > 10 ? 'text-red-500' : 'text-gray-500')}>
                    Stockouts
                  </p>
                  <p className={clsx('text-sm font-bold', h.predictedStockouts > 10 ? 'text-red-700' : 'text-gray-800')}>
                    {h.predictedStockouts}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  Health: {h.healthScore >= 80 ? 'Good' : h.healthScore >= 60 ? 'Needs Attention' : 'Critical'}
                </span>
                <span className="text-xs text-primary-600 font-medium">View Details →</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
