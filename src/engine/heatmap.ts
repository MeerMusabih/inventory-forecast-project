import type { DailySales, Product, Outlet, HeatmapCell } from '../data/types'
import { calculateAverageDailySales } from './forecast'

export function buildDemandHeatmap(
  products: Product[],
  outlets: Outlet[],
  sales: DailySales[],
  salesByProductOutlet?: Record<string, DailySales[]>
): HeatmapCell[] {
  const cells: HeatmapCell[] = []

  for (const product of products) {
    for (const outlet of outlets) {
      const avgDailySales = calculateAverageDailySales(sales, product.id, outlet.id, 30, undefined, salesByProductOutlet)
      cells.push({
        productId: product.id,
        productName: product.name,
        outletId: outlet.id,
        outletName: outlet.name,
        avgDailySales: Math.round(avgDailySales * 10) / 10,
      })
    }
  }

  const maxDemand = Math.max(...cells.map(c => c.avgDailySales), 1)

  for (const cell of cells) {
    const normalized = cell.avgDailySales / maxDemand
    let level: HeatmapCell['level'] = 'very_low'
    if (normalized > 0.8) level = 'very_high'
    else if (normalized > 0.6) level = 'high'
    else if (normalized > 0.4) level = 'medium'
    else if (normalized > 0.2) level = 'low'
    cell.level = level
  }

  return cells
}
