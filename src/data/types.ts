export interface Outlet {
  id: string
  name: string
  location: string
  type: 'urban' | 'suburban' | 'highway'
}

export interface Product {
  id: string
  name: string
  category: string
  supplier: string
  unit: string
  cost: number
  sellingPrice: number
  reorderPoint: number
  averageDailyDemand: number
}

export interface DailySales {
  date: string
  outletId: string
  productId: string
  unitsSold: number
  unitsReturned: number
  revenue: number
}

export interface InventorySnapshot {
  date: string
  outletId: string
  productId: string
  openingStock: number
  unitsSold: number
  unitsReturned: number
  receivedStock: number
  closingStock: number
}

export interface ForecastResult {
  productId: string
  outletId: string
  currentStock: number
  historicalAvgDaily: number
  recentAvgDaily: number
  predictedDemand: number
  daysUntilStockout: number
  trend: 'increasing' | 'decreasing' | 'stable'
  confidence: 'high' | 'medium' | 'low'
  forecastDays: { date: string; predicted: number }[]
}

export interface Recommendation {
  id: string
  type: 'critical_restock' | 'high_restock' | 'medium_restock' | 'overstock' | 'transfer' | 'healthy'
  priority: 'critical' | 'high' | 'medium' | 'low'
  productId: string
  productName: string
  outletId: string
  outletName: string
  message: string
  action: string
  details?: {
    currentStock?: number
    predictedDemand?: number
    daysRemaining?: number
    recommendedQty?: number
    fromOutlet?: string
    toOutlet?: string
    transferQty?: number
  }
}

export interface TransferOpportunity {
  productId: string
  productName: string
  fromOutletId: string
  fromOutletName: string
  fromStock: number
  fromDemand: number
  toOutletId: string
  toOutletName: string
  toStock: number
  toDemand: number
  suggestedTransfer: number
  reason: string
}

export interface KPI {
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: string
  color: string
}

export interface OutletHealth {
  outletId: string
  outletName: string
  totalProducts: number
  totalStock: number
  lowStock: number
  overstocked: number
  predictedStockouts: number
  healthScore: number
}

export interface ProductDemandRank {
  productId: string
  productName: string
  category: string
  totalDemand: number
  avgDailyDemand: number
  rank: number
}

export interface HeatmapCell {
  productId: string
  productName: string
  outletId: string
  outletName: string
  avgDailySales: number
  level: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
}
