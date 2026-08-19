import { createContext, useContext, useMemo, type ReactNode } from 'react'
import generatedData from '../data/generated-data.json'
import type { Outlet, Product, DailySales, InventorySnapshot } from '../data/types'

interface DataContextValue {
  outlets: Outlet[]
  products: Product[]
  sales: DailySales[]
  inventory: InventorySnapshot[]
  salesByProductOutlet: Record<string, DailySales[]>
}

const DataContext = createContext<DataContextValue | null>(null)

interface RawData {
  outlets: Outlet[]
  products: Product[]
  dates: string[]
  sales: [number, number, number, number, number, number][]
  inventory: [number, number, number, number, number][]
}

const raw = generatedData as unknown as RawData

function buildData(): DataContextValue {
  const pidArr = raw.products
  const oidArr = raw.outlets

  const sales: DailySales[] = new Array(raw.sales.length)
  const salesByProductOutlet: Record<string, DailySales[]> = {}

  for (let i = 0; i < raw.sales.length; i++) {
    const r = raw.sales[i]
    const pid = pidArr[r[1]].id
    const oid = oidArr[r[2]].id
    const s: DailySales = {
      date: raw.dates[r[0]],
      productId: pid,
      outletId: oid,
      unitsSold: r[3],
      revenue: r[4],
      unitsReturned: r[5],
    }
    sales[i] = s
    const key = `${pid}:${oid}`
    if (!salesByProductOutlet[key]) salesByProductOutlet[key] = []
    salesByProductOutlet[key].push(s)
  }

  const inventory: InventorySnapshot[] = new Array(raw.inventory.length)
  for (let i = 0; i < raw.inventory.length; i++) {
    const r = raw.inventory[i]
    inventory[i] = {
      date: raw.dates[r[0]],
      productId: pidArr[r[1]].id,
      outletId: oidArr[r[2]].id,
      closingStock: r[3],
      openingStock: 0,
      stockout: r[4] === 1,
    }
  }

  return { outlets: raw.outlets, products: raw.products, sales, inventory, salesByProductOutlet }
}

let cachedData: DataContextValue | null = null

export function DataProvider({ children }: { children: ReactNode }) {
  if (!cachedData) {
    cachedData = buildData()
  }

  return (
    <DataContext.Provider value={cachedData}>
      {children}
    </DataContext.Provider>
  )
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}

