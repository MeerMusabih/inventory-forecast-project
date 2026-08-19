import { useMemo, useState } from 'react'
import { useFilteredData } from '../hooks/useFilteredData'
import { calculateAverageDailySales } from '../engine/forecast'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

export default function Products() {
  const { products, outlets, sales, inventory, salesByProductOutlet } = useFilteredData()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category))
    return Array.from(cats).sort()
  }, [products])

  const productData = useMemo(() => {
    return products
      .filter(p => {
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false
        return true
      })
      .map(product => {
        let totalDemand = 0
        let totalStock = 0
        let minDays = Infinity
        let maxDays = 0

        for (const outlet of outlets) {
          const avg = calculateAverageDailySales(sales, product.id, outlet.id, 30, undefined, salesByProductOutlet)
          const closingStock = inventory
            .filter(i => i.productId === product.id && i.outletId === outlet.id)
            .sort((a, b) => b.date.localeCompare(a.date))
          const stock = closingStock.length > 0 ? closingStock[0].closingStock : 0

          totalDemand += avg
          totalStock += stock
          if (avg > 0 && stock > 0) {
            const days = stock / avg
            minDays = Math.min(minDays, days)
            maxDays = Math.max(maxDays, days)
          }
        }

        const avgDaily = totalDemand / (outlets.length || 1)

        return {
          ...product,
          totalDemand: Math.round(totalDemand * 10) / 10,
          avgDailyDemand: Math.round(avgDaily * 10) / 10,
          totalStock,
          minDaysRemaining: minDays === Infinity ? 0 : Math.round(minDays * 10) / 10,
          maxDaysRemaining: Math.round(maxDays * 10) / 10,
        }
      })
      .sort((a, b) => b.totalDemand - a.totalDemand)
  }, [products, outlets, sales, inventory, search, selectedCategory])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-sm text-gray-500 mt-1">Product catalog with demand analysis across all outlets</p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        />
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <span className="text-sm text-gray-400">{productData.length} products</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {productData.map(p => (
          <div
            key={p.id}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/products/${p.id}`)}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{p.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{p.category} · {p.supplier}</p>
              </div>
              <span className={clsx(
                'text-xs px-2 py-0.5 rounded-full font-medium',
                p.minDaysRemaining < 3 ? 'bg-red-100 text-red-700' :
                p.minDaysRemaining < 7 ? 'bg-orange-100 text-orange-700' :
                'bg-green-100 text-green-700'
              )}>
                {p.minDaysRemaining < 3 ? 'Critical' :
                 p.minDaysRemaining < 7 ? 'Low Stock' : 'Healthy'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div>
                <p className="text-xs text-gray-400">Avg Daily</p>
                <p className="text-sm font-semibold text-gray-800">{p.avgDailyDemand}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Stock</p>
                <p className="text-sm font-semibold text-gray-800">{p.totalStock.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Min Days</p>
                <p className={clsx(
                  'text-sm font-semibold',
                  p.minDaysRemaining < 3 ? 'text-red-600' :
                  p.minDaysRemaining < 7 ? 'text-orange-600' :
                  'text-gray-800'
                )}>
                  {p.minDaysRemaining}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>${p.sellingPrice} retail</span>
              <span>${p.cost} cost</span>
              <span className="text-primary-600 font-medium">View Details →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
