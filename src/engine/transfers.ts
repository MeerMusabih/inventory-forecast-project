import type { DailySales, Product, Outlet, TransferOpportunity, InventorySnapshot } from '../data/types'
import { calculateAverageDailySales } from './forecast'

function getLatestStock(inventory: InventorySnapshot[], productId: string, outletId: string): number {
  const matches = inventory
    .filter(s => s.productId === productId && s.outletId === outletId)
    .sort((a, b) => b.date.localeCompare(a.date))
  return matches.length > 0 ? matches[0].closingStock : 0
}

export function detectTransferOpportunities(
  products: Product[],
  outlets: Outlet[],
  sales: DailySales[],
  inventory: InventorySnapshot[],
  salesByProductOutlet?: Record<string, DailySales[]>
): TransferOpportunity[] {
  const opportunities: TransferOpportunity[] = []

  for (const product of products) {
    const outletData = outlets.map(outlet => {
      const avgDemand = calculateAverageDailySales(sales, product.id, outlet.id, 30, undefined, salesByProductOutlet)
      const stock = getLatestStock(inventory, product.id, outlet.id)
      return { outlet, avgDemand, stock }
    })

    for (let i = 0; i < outletData.length; i++) {
      for (let j = 0; j < outletData.length; j++) {
        if (i === j) continue
        const from = outletData[i]
        const to = outletData[j]

        if (from.avgDemand < 0.5 || to.avgDemand < 0.5) continue

        const surplus = from.stock - from.avgDemand * 20
        const deficit = to.avgDemand * 7 - to.stock

        if (surplus > 10 && deficit > 5 && from.avgDemand < to.avgDemand * 0.6) {
          const transferQty = Math.min(Math.round(surplus * 0.3), Math.round(deficit), 80)
          if (transferQty > 5) {
            const reason = from.avgDemand < to.avgDemand * 0.4
              ? `${product.name} has significantly lower demand at ${from.outlet.name} than at ${to.outlet.name}.`
              : `${from.outlet.name} has excess inventory of ${product.name} while ${to.outlet.name} needs stock replenishment.`

            opportunities.push({
              productId: product.id,
              productName: product.name,
              fromOutletId: from.outlet.id,
              fromOutletName: from.outlet.name,
              fromStock: from.stock,
              fromDemand: Math.round(from.avgDemand * 10) / 10,
              toOutletId: to.outlet.id,
              toOutletName: to.outlet.name,
              toStock: to.stock,
              toDemand: Math.round(to.avgDemand * 10) / 10,
              suggestedTransfer: transferQty,
              reason,
            })
          }
        }
      }
    }
  }

  const seen = new Set<string>()
  return opportunities
    .filter(opp => {
      const key = `${opp.productId}-${opp.fromOutletId}-${opp.toOutletId}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => b.suggestedTransfer - a.suggestedTransfer)
    .slice(0, 20)
}
