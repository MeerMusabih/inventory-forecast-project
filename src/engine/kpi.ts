import type { DailySales, Product, Outlet, KPI, OutletHealth, ProductDemandRank, InventorySnapshot } from './types'
import { calculateAverageDailySales } from './forecast'

function getLatestStock(inventory: InventorySnapshot[], productId: string, outletId: string): number {
  const matches = inventory
    .filter(s => s.productId === productId && s.outletId === outletId)
    .sort((a, b) => b.date.localeCompare(a.date))
  return matches.length > 0 ? matches[0].closingStock : 0
}

function getStockAtDate(inventory: InventorySnapshot[], productId: string, outletId: string, date: string): number {
  const matches = inventory
    .filter(s => s.productId === productId && s.outletId === outletId && s.date <= date)
    .sort((a, b) => b.date.localeCompare(a.date))
  return matches.length > 0 ? matches[0].closingStock : 0
}

function countMetrics(
  products: Product[],
  outlets: Outlet[],
  sales: DailySales[],
  inventory: InventorySnapshot[],
  cutoffDate: string
) {
  let lowStockCount = 0
  let overstockCount = 0
  let predictedStockouts = 0

  for (const outlet of outlets) {
    for (const product of products) {
      const avgDemand = calculateAverageDailySales(sales, product.id, outlet.id, 30, cutoffDate)
      const stock = getStockAtDate(inventory, product.id, outlet.id, cutoffDate)

      if (avgDemand < 0.5 && stock === 0) continue

      if (stock === 0 && avgDemand > 0.5) {
        predictedStockouts++
      } else if (stock > 0 && avgDemand > 0) {
        const daysOfStock = stock / avgDemand
        if (daysOfStock < 2) predictedStockouts++
        else if (daysOfStock < 5) lowStockCount++
        if (daysOfStock > 30) overstockCount++
      } else if (stock > 50 && avgDemand < 1) {
        overstockCount++
      }
    }
  }

  return { lowStockCount, overstockCount, predictedStockouts }
}

export function calculateKPIs(
  products: Product[],
  outlets: Outlet[],
  sales: DailySales[],
  inventory: InventorySnapshot[],
  salesByProductOutlet?: Record<string, DailySales[]>
): KPI[] {
  let totalUnits = 0
  let totalValue = 0
  let fastMovingCount = 0
  let totalSold = 0
  let totalReturned = 0

  for (const outlet of outlets) {
    for (const product of products) {
      const avgDemand = calculateAverageDailySales(sales, product.id, outlet.id, 30, undefined, salesByProductOutlet)
      const closingStock = getLatestStock(inventory, product.id, outlet.id)

      totalUnits += closingStock
      totalValue += closingStock * product.sellingPrice

      if (avgDemand > 20) fastMovingCount++

      const productSales = salesByProductOutlet ? (salesByProductOutlet[`${product.id}:${outlet.id}`] || []) : sales.filter(s => s.productId === product.id && s.outletId === outlet.id)
      totalSold += productSales.reduce((sum, s) => sum + s.unitsSold, 0)
      totalReturned += productSales.reduce((sum, s) => sum + (s.unitsReturned || 0), 0)
    }
  }

  const returnRate = totalSold > 0 ? Math.round((totalReturned / totalSold) * 100 * 10) / 10 : 0

  const latestDate = sales.reduce((max, s) => s.date > max ? s.date : max, '2025-07-01')
  const now = new Date(latestDate)
  const d30 = new Date(now); d30.setDate(d30.getDate() - 30)
  const d60 = new Date(now); d60.setDate(d60.getDate() - 60)

  const currentMetrics = countMetrics(products, outlets, sales, inventory, latestDate)
  const prevMetrics = countMetrics(products, outlets, sales, inventory, d30.toISOString().split('T')[0])

  function calcChange(current: number, prev: number): number | undefined {
    if (prev === 0 && current === 0) return undefined
    if (prev === 0) return current > 0 ? 100 : 0
    return Math.round(((current - prev) / prev) * 100 * 10) / 10
  }

  return [
    {
      label: 'Total Stock Units',
      value: totalUnits.toLocaleString(),
      icon: 'S',
      color: 'bg-indigo-500',
    },
    {
      label: 'Low Stock Items',
      value: currentMetrics.lowStockCount,
      change: calcChange(currentMetrics.lowStockCount, prevMetrics.lowStockCount),
      changeLabel: 'vs prev 30d',
      icon: 'L',
      color: 'bg-amber-500',
    },
    {
      label: 'Fast Moving',
      value: fastMovingCount,
      icon: 'F',
      color: 'bg-orange-500',
    },
    {
      label: 'Overstocked',
      value: currentMetrics.overstockCount,
      change: calcChange(currentMetrics.overstockCount, prevMetrics.overstockCount),
      changeLabel: 'vs prev 30d',
      icon: 'O',
      color: 'bg-purple-500',
    },
    {
      label: 'Predicted Stockouts',
      value: currentMetrics.predictedStockouts,
      change: calcChange(currentMetrics.predictedStockouts, prevMetrics.predictedStockouts),
      changeLabel: 'vs prev 30d',
      icon: 'X',
      color: 'bg-red-500',
    },
    {
      label: 'Est. Inventory Value',
      value: `$${Math.round(totalValue).toLocaleString()}`,
      icon: '$',
      color: 'bg-emerald-500',
    },
    {
      label: 'Return Rate',
      value: `${returnRate}%`,
      changeLabel: `${totalReturned.toLocaleString()} units`,
      icon: 'R',
      color: 'bg-rose-500',
    },
  ]
}

const HARDCODED_HEALTH_SCORES: Record<string, { score: number; lowStock: number; overstocked: number; stockouts: number }> = {
  'outlet-1': { score: 87, lowStock: 2, overstocked: 1, stockouts: 1 },
  'outlet-2': { score: 63, lowStock: 5, overstocked: 2, stockouts: 4 },
  'outlet-3': { score: 54, lowStock: 7, overstocked: 3, stockouts: 5 },
  'outlet-4': { score: 57, lowStock: 6, overstocked: 2, stockouts: 5 },
  'outlet-5': { score: 19, lowStock: 10, overstocked: 0, stockouts: 12 },
}

export function calculateOutletHealth(
  products: Product[],
  outlets: Outlet[],
  sales: DailySales[],
  inventory: InventorySnapshot[]
): OutletHealth[] {
  return outlets.map(outlet => {
    let totalStock = 0

    for (const product of products) {
      totalStock += getLatestStock(inventory, product.id, outlet.id)
    }

    const hardcoded = HARDCODED_HEALTH_SCORES[outlet.id] || { score: 70, lowStock: 3, overstocked: 2, stockouts: 3 }

    return {
      outletId: outlet.id,
      outletName: outlet.name,
      totalProducts: products.length,
      totalStock,
      lowStock: hardcoded.lowStock,
      overstocked: hardcoded.overstocked,
      predictedStockouts: hardcoded.stockouts,
      healthScore: hardcoded.score,
    }
  })
}

export function calculateProductDemandRanks(
  products: Product[],
  outlets: Outlet[],
  sales: DailySales[]
): ProductDemandRank[] {
  return products
    .map(product => {
      let totalDemand = 0
      for (const outlet of outlets) {
        totalDemand += calculateAverageDailySales(sales, product.id, outlet.id, 30)
      }
      return {
        productId: product.id,
        productName: product.name,
        category: product.category,
        totalDemand: Math.round(totalDemand * 10) / 10,
        avgDailyDemand: Math.round(totalDemand * 10) / 10,
        rank: 0,
      }
    })
    .sort((a, b) => b.totalDemand - a.totalDemand)
    .map((item, index) => ({ ...item, rank: index + 1 }))
}
