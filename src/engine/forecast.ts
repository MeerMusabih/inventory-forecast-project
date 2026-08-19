import type { DailySales, ForecastResult, Product, Outlet, InventorySnapshot } from '../data/types'

function seededRand(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function calculateAverageDailySales(
  sales: DailySales[],
  productId: string,
  outletId: string,
  days: number = 30,
  cutoffDate?: string,
  salesByProductOutlet?: Record<string, DailySales[]>
): number {
  let filtered: DailySales[]
  if (salesByProductOutlet) {
    filtered = salesByProductOutlet[`${productId}:${outletId}`] || []
  } else {
    filtered = sales.filter(s => s.productId === productId && s.outletId === outletId)
  }
  if (cutoffDate) {
    filtered = filtered.filter(s => s.date <= cutoffDate)
  }
  const recent = filtered
    .slice(-days)

  if (recent.length === 0) return 0
  return recent.reduce((sum, s) => sum + (s.unitsSold - (s.unitsReturned || 0)), 0) / recent.length
}

export function calculateSalesVelocity(
  sales: DailySales[],
  productId: string,
  outletId: string
): { current: number; previous: number; change: number } {
  const sorted = sales
    .filter(s => s.productId === productId && s.outletId === outletId)
    .sort((a, b) => b.date.localeCompare(a.date))

  const last30 = sorted.slice(0, 30)
  const prev30 = sorted.slice(30, 60)

  const current = last30.length > 0 ? last30.reduce((s, x) => s + (x.unitsSold - (x.unitsReturned || 0)), 0) / last30.length : 0
  const previous = prev30.length > 0 ? prev30.reduce((s, x) => s + (x.unitsSold - (x.unitsReturned || 0)), 0) / prev30.length : 0

  return {
    current,
    previous,
    change: previous > 0 ? ((current - previous) / previous) * 100 : 0,
  }
}

function getLatestStock(inventory: InventorySnapshot[], productId: string, outletId: string): number {
  const matches = inventory
    .filter(s => s.productId === productId && s.outletId === outletId)
    .sort((a, b) => b.date.localeCompare(a.date))
  return matches.length > 0 ? matches[0].closingStock : 0
}

export function forecastDemand(
  sales: DailySales[],
  productId: string,
  outletId: string,
  forecastDays: number = 14,
  inventory?: InventorySnapshot[],
  salesByProductOutlet?: Record<string, DailySales[]>
): ForecastResult {
  let sorted: DailySales[]
  if (salesByProductOutlet) {
    sorted = salesByProductOutlet[`${productId}:${outletId}`] || []
  } else {
    sorted = sales
      .filter(s => s.productId === productId && s.outletId === outletId)
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  if (sorted.length === 0) {
    return {
      productId,
      outletId,
      currentStock: 0,
      historicalAvgDaily: 0,
      recentAvgDaily: 0,
      predictedDemand: 0,
      daysUntilStockout: 0,
      trend: 'stable',
      confidence: 'low',
      forecastDays: [],
    }
  }

  const last90 = sorted.slice(-90)
  const last30 = sorted.slice(-30)
  const last7 = sorted.slice(-7)

  const historicalAvg = sorted.reduce((s, x) => s + (x.unitsSold - (x.unitsReturned || 0)), 0) / sorted.length
  const recentAvg30 = last30.length > 0 ? last30.reduce((s, x) => s + (x.unitsSold - (x.unitsReturned || 0)), 0) / last30.length : 0
  const recentAvg7 = last7.length > 0 ? last7.reduce((s, x) => s + (x.unitsSold - (x.unitsReturned || 0)), 0) / last7.length : 0

  const weights = [0.5, 0.3, 0.2]
  const weightedAvg = (recentAvg7 * weights[0] + recentAvg30 * weights[1] + historicalAvg * weights[2])

  const firstHalf = last90.slice(0, 45)
  const secondHalf = last90.slice(45)
  const avgFirst = firstHalf.length > 0 ? firstHalf.reduce((s, x) => s + (x.unitsSold - (x.unitsReturned || 0)), 0) / firstHalf.length : 0
  const avgSecond = secondHalf.length > 0 ? secondHalf.reduce((s, x) => s + (x.unitsSold - (x.unitsReturned || 0)), 0) / secondHalf.length : 0
  const trendSlope = avgSecond - avgFirst

  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
  if (trendSlope > 2) trend = 'increasing'
  else if (trendSlope < -2) trend = 'decreasing'

  const predictedDemand = Math.max(0.1, weightedAvg + trendSlope * 0.3)

  const currentStock = inventory
    ? getLatestStock(inventory, productId, outletId)
    : Math.max(1, Math.round(predictedDemand * 10))
  const daysUntilStockout = predictedDemand > 0 ? Math.round(currentStock / predictedDemand) : 0

  let confidence: 'high' | 'medium' | 'low' = 'low'
  if (sorted.length > 150) confidence = 'high'
  else if (sorted.length > 60) confidence = 'medium'

  const rng = seededRand(sorted.length * 13 + sorted[sorted.length - 1].unitsSold)
  const forecastDaysResult: { date: string; predicted: number }[] = []
  const lastDate = new Date(sorted[sorted.length - 1].date)
  for (let i = 1; i <= forecastDays; i++) {
    const fDate = new Date(lastDate)
    fDate.setDate(fDate.getDate() + i)
    const dayOfWeek = fDate.getDay()
    const weeklyFactor = getWeeklyPattern(dayOfWeek)
    const predicted = Math.max(0, Math.round(predictedDemand * weeklyFactor * (0.9 + rng() * 0.2)))
    forecastDaysResult.push({ date: fDate.toISOString().split('T')[0], predicted })
  }

  return {
    productId,
    outletId,
    currentStock,
    historicalAvgDaily: Math.round(historicalAvg * 10) / 10,
    recentAvgDaily: Math.round(recentAvg30 * 10) / 10,
    predictedDemand: Math.round(predictedDemand * 10) / 10,
    daysUntilStockout,
    trend,
    confidence,
    forecastDays: forecastDaysResult,
  }
}

function getWeeklyPattern(dayOfWeek: number): number {
  const patterns = [0.85, 0.90, 0.95, 1.00, 1.10, 1.25, 1.15]
  return patterns[dayOfWeek]
}

export function calculateDaysOfStock(
  currentStock: number,
  avgDailyDemand: number
): number {
  if (avgDailyDemand <= 0.1) return 0
  return Math.round(currentStock / avgDailyDemand * 10) / 10
}

export function detectLowStock(
  products: Product[],
  sales: DailySales[],
  outlets: Outlet[],
  inventory: InventorySnapshot[],
  threshold: number = 3
): { product: Product; outlet: Outlet; stock: number; daysRemaining: number }[] {
  const results: { product: Product; outlet: Outlet; stock: number; daysRemaining: number }[] = []

  for (const outlet of outlets) {
    for (const product of products) {
      const avgDemand = calculateAverageDailySales(sales, product.id, outlet.id, 30)
      if (avgDemand < 0.5) continue
      const stock = getLatestStock(inventory, product.id, outlet.id)
      const daysRemaining = Math.round(stock / avgDemand * 10) / 10

      if (daysRemaining < threshold) {
        results.push({ product, outlet, stock, daysRemaining })
      }
    }
  }

  return results.sort((a, b) => a.daysRemaining - b.daysRemaining)
}

export function detectOverstock(
  products: Product[],
  sales: DailySales[],
  outlets: Outlet[],
  inventory: InventorySnapshot[],
  threshold: number = 30
): { product: Product; outlet: Outlet; stock: number; daysRemaining: number }[] {
  const results: { product: Product; outlet: Outlet; stock: number; daysRemaining: number }[] = []

  for (const outlet of outlets) {
    for (const product of products) {
      const avgDemand = calculateAverageDailySales(sales, product.id, outlet.id, 30)
      if (avgDemand < 0.5) continue
      const stock = getLatestStock(inventory, product.id, outlet.id)
      const daysRemaining = Math.round(stock / avgDemand * 10) / 10

      if (daysRemaining > threshold) {
        results.push({ product, outlet, stock, daysRemaining })
      }
    }
  }

  return results.sort((a, b) => b.daysRemaining - a.daysRemaining)
}
