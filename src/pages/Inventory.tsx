import { useMemo, useState } from 'react'
import { useFilteredData } from '../hooks/useFilteredData'
import { calculateAverageDailySales, calculateSalesVelocity } from '../engine/forecast'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

type SortKey = 'product' | 'category' | 'stock' | 'avgSales' | 'daysRemaining' | 'status' | 'returnRate'
type SortDir = 'asc' | 'desc'

export default function Inventory() {
  const { products, outlets, sales, inventory, salesByProductOutlet } = useFilteredData()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('status')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [statusFilter, setStatusFilter] = useState('all')

  const inventoryData = useMemo(() => {
    const rows: {
      productId: string
      productName: string
      category: string
      outletId: string
      outletName: string
      avgDailySales: number
      estimatedStock: number
      daysRemaining: number
      status: string
      trend: string
      totalReturns: number
      returnRate: number
    }[] = []

    for (const outlet of outlets) {
      for (const product of products) {
        const avgSales = calculateAverageDailySales(sales, product.id, outlet.id, 30, undefined, salesByProductOutlet)

        const closingStock = inventory
          .filter(i => i.productId === product.id && i.outletId === outlet.id)
          .sort((a, b) => b.date.localeCompare(a.date))
        const stock = closingStock.length > 0 ? closingStock[0].closingStock : 0

        const productSales = salesByProductOutlet[`${product.id}:${outlet.id}`] || []
        const totalSold = productSales.reduce((sum, s) => sum + s.unitsSold, 0)
        const totalReturned = productSales.reduce((sum, s) => sum + (s.unitsReturned || 0), 0)
        const returnRate = totalSold > 0 ? Math.round((totalReturned / totalSold) * 100 * 10) / 10 : 0

        if (avgSales < 0.5 && stock === 0) continue
        const daysRemaining = avgSales > 0 ? stock / avgSales : stock > 0 ? 999 : 0

        let status = 'healthy'
        if (stock === 0 && avgSales > 0.5) status = 'critical'
        else if (daysRemaining < 2) status = 'critical'
        else if (daysRemaining < 5) status = 'low_stock'
        else if (daysRemaining > 30) status = 'overstock'
        else if (avgSales > 20) status = 'high_demand'

        const velocity = calculateSalesVelocity(sales, product.id, outlet.id)
        let trend: string = 'stable'
        if (velocity.change > 10) trend = 'increasing'
        else if (velocity.change < -10) trend = 'decreasing'

        rows.push({
          productId: product.id,
          productName: product.name,
          category: product.category,
          outletId: outlet.id,
          outletName: outlet.name,
          avgDailySales: Math.round(avgSales * 10) / 10,
          estimatedStock: stock,
          daysRemaining: Math.round(daysRemaining * 10) / 10,
          status,
          trend,
          totalReturns: totalReturned,
          returnRate,
        })
      }
    }

    return rows
  }, [products, outlets, sales, inventory, salesByProductOutlet])

  const filtered = useMemo(() => {
    let data = inventoryData

    if (search) {
      const q = search.toLowerCase()
      data = data.filter(r =>
        r.productName.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.outletName.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== 'all') {
      data = data.filter(r => r.status === statusFilter)
    }

    data.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'product': cmp = a.productName.localeCompare(b.productName); break
        case 'category': cmp = a.category.localeCompare(b.category); break
        case 'stock': cmp = a.estimatedStock - b.estimatedStock; break
        case 'avgSales': cmp = a.avgDailySales - b.avgDailySales; break
        case 'daysRemaining': cmp = a.daysRemaining - b.daysRemaining; break
        case 'returnRate': cmp = a.returnRate - b.returnRate; break
        case 'status': {
          const order: Record<string, number> = { critical: 0, low_stock: 1, high_demand: 2, healthy: 3, overstock: 4 }
          cmp = (order[a.status] || 0) - (order[b.status] || 0)
          break
        }
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return data
  }, [inventoryData, search, sortKey, sortDir, statusFilter])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const statusLabel: Record<string, string> = {
    critical: 'Critical',
    low_stock: 'Low Stock',
    healthy: 'Healthy',
    overstock: 'Overstock',
    high_demand: 'High Demand',
  }

  const statusCls: Record<string, string> = {
    critical: 'bg-red-100 text-red-700',
    low_stock: 'bg-orange-100 text-orange-700',
    healthy: 'bg-green-100 text-green-700',
    overstock: 'bg-purple-100 text-purple-700',
    high_demand: 'bg-blue-100 text-blue-700',
  }

  const trendIcon: Record<string, string> = {
    increasing: '↑',
    decreasing: '↓',
    stable: '→',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-sm text-gray-500 mt-1">Detailed inventory status across all outlets</p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search products, categories, outlets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-4 py-2 w-72 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="critical">Critical</option>
          <option value="low_stock">Low Stock</option>
          <option value="high_demand">High Demand</option>
          <option value="healthy">Healthy</option>
          <option value="overstock">Overstock</option>
        </select>
        <span className="text-sm text-gray-400">{filtered.length} items</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {[
                  { key: 'product' as SortKey, label: 'Product' },
                  { key: 'category' as SortKey, label: 'Category' },
                  { key: 'stock' as SortKey, label: 'Outlet' },
                  { key: 'stock' as SortKey, label: 'Stock' },
                  { key: 'avgSales' as SortKey, label: 'Avg Daily Sales' },
                  { key: 'daysRemaining' as SortKey, label: 'Days Remaining' },
                  { key: 'returnRate' as SortKey, label: 'Return Rate' },
                  { key: 'status' as SortKey, label: 'Status' },
                ].map((col, i) => (
                  <th
                    key={i}
                    className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={() => toggleSort(col.key)}
                  >
                    {col.label} {sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 200).map((row, i) => (
                <tr
                  key={`${row.productId}-${row.outletId}`}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/products/${row.productId}`)}
                >
                  <td className="px-4 py-3 font-medium text-gray-800">{row.productName}</td>
                  <td className="px-4 py-3 text-gray-500">{row.category}</td>
                  <td className="px-4 py-3 text-gray-600">{row.outletName}</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{row.estimatedStock}</td>
                  <td className="px-4 py-3 text-gray-600">{row.avgDailySales}</td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'font-medium',
                      row.daysRemaining < 3 ? 'text-red-600' :
                      row.daysRemaining < 7 ? 'text-orange-600' :
                      'text-gray-700'
                    )}>
                      {row.daysRemaining}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'text-sm font-medium',
                      row.returnRate > 5 ? 'text-red-600' :
                      row.returnRate > 3 ? 'text-orange-600' :
                      'text-gray-600'
                    )}>
                      {row.returnRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', statusCls[row.status])}>
                        {statusLabel[row.status]}
                      </span>
                      <span className="text-gray-400">{trendIcon[row.trend]}</span>
                    </div>
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
