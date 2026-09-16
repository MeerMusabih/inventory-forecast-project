import { useMemo, useState } from 'react'
import { useFilteredData } from '../hooks/useFilteredData'
import { calculateAverageDailySales, calculateSalesVelocity } from '../engine/forecast'
import PageHeader from '../components/PageHeader'
import { IconSearch } from '../components/icons'
import clsx from 'clsx'

type SortKey = 'product' | 'category' | 'stock' | 'avgSales' | 'daysRemaining' | 'status' | 'returnRate'
type SortDir = 'asc' | 'desc'

export default function Inventory() {
  const { products, outlets, sales, inventory, salesByProductOutlet } = useFilteredData()
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
      stockoutDays: number
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

        let stockoutDays = 0
        if (stock === 0 && avgSales > 0.5) {
          const sortedInventory = inventory
            .filter(i => i.productId === product.id && i.outletId === outlet.id)
            .sort((a, b) => b.date.localeCompare(a.date))
          for (const inv of sortedInventory) {
            if (inv.closingStock === 0) stockoutDays++
            else break
          }
        }

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
          stockoutDays,
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
      data = data.filter(
        r =>
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
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const statusLabel: Record<string, string> = {
    critical: 'Critical',
    low_stock: 'Low stock',
    healthy: 'Healthy',
    overstock: 'Overstock',
    high_demand: 'High demand',
  }

  const statusCls: Record<string, string> = {
    critical: 'badge-danger',
    low_stock: 'badge-warn',
    healthy: 'badge-success',
    overstock: 'badge-brand',
    high_demand: 'badge-neutral',
  }

  const trendIcon: Record<string, string> = {
    increasing: '↑',
    decreasing: '↓',
    stable: '→',
  }

  const columns: { key: SortKey; label: string; align?: string }[] = [
    { key: 'product', label: 'Product' },
    { key: 'category', label: 'Category' },
    { key: 'stock', label: 'Outlet' },
    { key: 'stock', label: 'Stock' },
    { key: 'avgSales', label: 'Avg daily sales' },
    { key: 'daysRemaining', label: 'Days remaining' },
    { key: 'returnRate', label: 'Return rate' },
    { key: 'status', label: 'Status' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Stock health across every outlet — days of cover, return rate and demand trend per product."
      />

      <div className="card">
        <div className="card-body flex items-center gap-4 flex-wrap">
          <div className="relative">
            <IconSearch width={15} height={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search products, categories, outlets…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9 w-72"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="select"
          >
            <option value="all">All statuses</option>
            <option value="critical">Critical</option>
            <option value="low_stock">Low stock</option>
            <option value="high_demand">High demand</option>
            <option value="healthy">Healthy</option>
            <option value="overstock">Overstock</option>
          </select>
          <span className="badge-neutral ml-auto">{filtered.length} items</span>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col, i) => (
                  <th
                    key={i}
                    className="cursor-pointer select-none hover:text-ink whitespace-nowrap"
                    onClick={() => toggleSort(col.key)}
                  >
                    {col.label} {sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 200).map((row, i) => (
                <tr key={`${row.productId}-${row.outletId}`}>
                  <td className="font-medium text-ink whitespace-nowrap">{row.productName}</td>
                  <td>{row.category}</td>
                  <td>{row.outletName}</td>
                  <td className="font-medium text-ink">{row.estimatedStock}</td>
                  <td>{row.avgDailySales}</td>
                  <td>
                    {row.estimatedStock === 0 && row.stockoutDays > 0 ? (
                      <span className="font-medium text-danger">Out of stock · {row.stockoutDays}d</span>
                    ) : (
                      <span
                        className={clsx(
                          'font-medium',
                          row.daysRemaining < 3 ? 'text-danger' : row.daysRemaining < 7 ? 'text-warn' : 'text-ink-soft'
                        )}
                      >
                        {row.daysRemaining}
                      </span>
                    )}
                  </td>
                  <td>
                    <span
                      className={clsx(
                        'font-medium',
                        row.returnRate > 5 ? 'text-danger' : row.returnRate > 3 ? 'text-warn' : 'text-ink-soft'
                      )}
                    >
                      {row.returnRate}%
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className={statusCls[row.status]}>{statusLabel[row.status]}</span>
                      <span className="text-muted">{trendIcon[row.trend]}</span>
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
