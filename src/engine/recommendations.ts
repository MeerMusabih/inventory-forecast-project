import type { DailySales, Product, Outlet, Recommendation, InventorySnapshot } from '../data/types'
import { calculateAverageDailySales, forecastDemand } from './forecast'

let recId = 0
function nextId(): string {
  return `rec-${++recId}`
}

function getLatestStock(inventory: InventorySnapshot[], productId: string, outletId: string): number {
  const matches = inventory
    .filter(s => s.productId === productId && s.outletId === outletId)
    .sort((a, b) => b.date.localeCompare(a.date))
  return matches.length > 0 ? matches[0].closingStock : 0
}

export function generateRecommendations(
  products: Product[],
  outlets: Outlet[],
  sales: DailySales[],
  inventory: InventorySnapshot[],
  salesByProductOutlet?: Record<string, DailySales[]>
): Recommendation[] {
  const recommendations: Recommendation[] = []

  for (const outlet of outlets) {
    for (const product of products) {
      const forecast = forecastDemand(sales, product.id, outlet.id, 14, inventory, salesByProductOutlet)
      const avgDemand = calculateAverageDailySales(sales, product.id, outlet.id, 30, undefined, salesByProductOutlet)
      if (avgDemand < 0.5) continue

      const stock = getLatestStock(inventory, product.id, outlet.id)
      const daysRemaining = avgDemand > 0 ? stock / avgDemand : 0

      let stockoutDays = 0
      if (stock === 0 && avgDemand > 0.5) {
        const sortedInventory = inventory
          .filter(i => i.productId === product.id && i.outletId === outlet.id)
          .sort((a, b) => b.date.localeCompare(a.date))
        for (const inv of sortedInventory) {
          if (inv.closingStock === 0) stockoutDays++
          else break
        }
      }

      if (stock === 0 && avgDemand > 0.5) {
        const reorderQty = Math.round(avgDemand * 14)
        recommendations.push({
          id: nextId(),
          type: 'critical_restock',
          priority: 'critical',
          productId: product.id,
          productName: product.name,
          outletId: outlet.id,
          outletName: outlet.name,
          message: `${product.name} at ${outlet.name} is out of stock since ${stockoutDays} days. Demand is ${Math.round(avgDemand * 10) / 10} units/day.`,
          action: `Reorder approximately ${reorderQty} units immediately.`,
          details: {
            currentStock: stock,
            predictedDemand: Math.round(avgDemand * 10) / 10,
            daysRemaining: Math.round(daysRemaining * 10) / 10,
            recommendedQty: reorderQty,
          },
        })
      } else if (daysRemaining < 2 && avgDemand > 3) {
        const reorderQty = Math.round(avgDemand * 14)
        recommendations.push({
          id: nextId(),
          type: 'critical_restock',
          priority: 'critical',
          productId: product.id,
          productName: product.name,
          outletId: outlet.id,
          outletName: outlet.name,
          message: `${product.name} at ${outlet.name} is expected to run out within ${Math.ceil(daysRemaining)} days.`,
          action: `Reorder approximately ${reorderQty} units immediately.`,
          details: {
            currentStock: stock,
            predictedDemand: Math.round(avgDemand * 10) / 10,
            daysRemaining: Math.round(daysRemaining * 10) / 10,
            recommendedQty: reorderQty,
          },
        })
      } else if (daysRemaining < 5 && avgDemand > 2) {
        const reorderQty = Math.round(avgDemand * 10)
        recommendations.push({
          id: nextId(),
          type: 'high_restock',
          priority: 'high',
          productId: product.id,
          productName: product.name,
          outletId: outlet.id,
          outletName: outlet.name,
          message: `${product.name} at ${outlet.name} has approximately ${Math.ceil(daysRemaining)} days of stock remaining.`,
          action: `Plan to reorder ${reorderQty} units within the next few days.`,
          details: {
            currentStock: stock,
            predictedDemand: Math.round(avgDemand * 10) / 10,
            daysRemaining: Math.round(daysRemaining * 10) / 10,
            recommendedQty: reorderQty,
          },
        })
      } else if (daysRemaining > 45 && avgDemand < 5) {
        recommendations.push({
          id: nextId(),
          type: 'overstock',
          priority: 'medium',
          productId: product.id,
          productName: product.name,
          outletId: outlet.id,
          outletName: outlet.name,
          message: `${product.name} at ${outlet.name} has approximately ${Math.round(daysRemaining)} days of inventory. Sales are slow.`,
          action: 'Reduce future replenishment or consider transferring stock to an outlet with higher demand.',
          details: {
            currentStock: stock,
            predictedDemand: Math.round(avgDemand * 10) / 10,
            daysRemaining: Math.round(daysRemaining * 10) / 10,
          },
        })
      } else if (daysRemaining > 14 && daysRemaining <= 45) {
        recommendations.push({
          id: nextId(),
          type: 'healthy',
          priority: 'low',
          productId: product.id,
          productName: product.name,
          outletId: outlet.id,
          outletName: outlet.name,
          message: `${product.name} at ${outlet.name} has sufficient stock for approximately ${Math.round(daysRemaining)} days based on predicted demand.`,
          action: 'No action needed. Inventory levels are healthy.',
          details: {
            currentStock: stock,
            predictedDemand: Math.round(avgDemand * 10) / 10,
            daysRemaining: Math.round(daysRemaining * 10) / 10,
          },
        })
      }
    }
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}
