import { useMemo, useState } from 'react'
import { useFilteredData } from '../hooks/useFilteredData'
import { generateRecommendations } from '../engine/recommendations'
import { detectTransferOpportunities } from '../engine/transfers'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

type Priority = 'all' | 'critical' | 'high' | 'medium' | 'low'

export default function Recommendations() {
  const { products, outlets, sales, inventory, salesByProductOutlet } = useFilteredData()
  const navigate = useNavigate()
  const [priorityFilter, setPriorityFilter] = useState<Priority>('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const recommendations = useMemo(() => generateRecommendations(products, outlets, sales, inventory, salesByProductOutlet), [products, outlets, sales, inventory, salesByProductOutlet])
  const transfers = useMemo(() => detectTransferOpportunities(products, outlets, sales, inventory, salesByProductOutlet), [products, outlets, sales, inventory, salesByProductOutlet])

  const filtered = useMemo(() => {
    let recs = recommendations
    if (priorityFilter !== 'all') {
      recs = recs.filter(r => r.priority === priorityFilter)
    }
    if (typeFilter !== 'all') {
      recs = recs.filter(r => r.type === typeFilter)
    }
    return recs
  }, [recommendations, priorityFilter, typeFilter])

  const priorityCounts = useMemo(() => ({
    critical: recommendations.filter(r => r.priority === 'critical').length,
    high: recommendations.filter(r => r.priority === 'high').length,
    medium: recommendations.filter(r => r.priority === 'medium').length,
    low: recommendations.filter(r => r.priority === 'low').length,
  }), [recommendations])

  const priorityColor: Record<string, string> = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200',
  }

  const typeLabel: Record<string, string> = {
    critical_restock: 'Critical Restock',
    high_restock: 'High Priority Restock',
    medium_restock: 'Medium Restock',
    overstock: 'Overstock',
    transfer: 'Transfer',
    healthy: 'Healthy',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory Recommendations</h1>
        <p className="text-sm text-gray-500 mt-1">
          AI-powered decision support for inventory management
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: 'critical' as Priority, label: 'Critical', count: priorityCounts.critical, color: 'bg-red-500' },
          { key: 'high' as Priority, label: 'High', count: priorityCounts.high, color: 'bg-orange-500' },
          { key: 'medium' as Priority, label: 'Medium', count: priorityCounts.medium, color: 'bg-yellow-500' },
          { key: 'low' as Priority, label: 'Low', count: priorityCounts.low, color: 'bg-green-500' },
        ].map(p => (
          <button
            key={p.key}
            onClick={() => setPriorityFilter(priorityFilter === p.key ? 'all' : p.key)}
            className={clsx(
              'rounded-xl border p-4 text-left transition-all',
              priorityFilter === p.key ? 'ring-2 ring-primary-500 border-primary-300' : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{p.label}</span>
              <span className={clsx('w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold', p.color)}>
                {p.count}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="all">All Types</option>
          <option value="critical_restock">Critical Restock</option>
          <option value="high_restock">High Restock</option>
          <option value="medium_restock">Medium Restock</option>
          <option value="overstock">Overstock</option>
          <option value="healthy">Healthy</option>
        </select>
        <span className="text-sm text-gray-400">{filtered.length} recommendations</span>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-lg">No recommendations matching your filters</p>
          </div>
        )}
        {filtered.map(rec => (
          <div
            key={rec.id}
            className={clsx(
              'bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow',
              priorityColor[rec.priority]
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={clsx(
                    'text-xs px-2 py-0.5 rounded-full font-semibold',
                    priorityColor[rec.priority]
                  )}>
                    {rec.priority.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">{typeLabel[rec.type] || rec.type}</span>
                </div>
                <p className="text-sm font-medium text-gray-800">{rec.message}</p>
                <p className="text-sm text-gray-600 mt-1">{rec.action}</p>
                {rec.details && (
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    {rec.details.currentStock !== undefined && (
                      <span>Stock: <strong className="text-gray-700">{rec.details.currentStock}</strong></span>
                    )}
                    {rec.details.predictedDemand !== undefined && (
                      <span>Demand: <strong className="text-gray-700">{rec.details.predictedDemand}/day</strong></span>
                    )}
                    {rec.details.daysRemaining !== undefined && (
                      <span>Days left: <strong className="text-gray-700">{rec.details.daysRemaining}</strong></span>
                    )}
                    {rec.details.recommendedQty !== undefined && (
                      <span>Reorder: <strong className="text-primary-600">{rec.details.recommendedQty} units</strong></span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                  {rec.outletName}
                </span>
                <button
                  onClick={() => navigate(`/products/${rec.productId}`)}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  View →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {transfers.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Transfer Opportunities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transfers.map((t, i) => (
              <div key={i} className="bg-white rounded-xl border border-blue-200 p-5">
                <h3 className="text-sm font-semibold text-blue-800">{t.productName}</h3>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex-1 bg-red-50 rounded-lg p-3">
                    <p className="text-xs text-red-500 font-medium">From: {t.fromOutletName}</p>
                    <p className="text-sm text-red-700">{t.fromStock} units in stock</p>
                    <p className="text-xs text-red-500">{t.fromDemand}/day demand</p>
                  </div>
                  <div className="text-blue-500 text-lg font-bold">→</div>
                  <div className="flex-1 bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-500 font-medium">To: {t.toOutletName}</p>
                    <p className="text-sm text-green-700">{t.toStock} units in stock</p>
                    <p className="text-xs text-green-500">{t.toDemand}/day demand</p>
                  </div>
                </div>
                <div className="mt-3 bg-blue-50 rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-blue-700">Suggested Transfer: {t.suggestedTransfer} units</p>
                  <p className="text-xs text-blue-600 mt-1">{t.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
