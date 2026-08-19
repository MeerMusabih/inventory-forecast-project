import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'
import { useData } from './DataContext'

interface FilterContextValue {
  selectedOutlet: string
  setSelectedOutlet: (id: string) => void
  selectedCategory: string
  setSelectedCategory: (id: string) => void
  selectedProduct: string
  setSelectedProduct: (id: string) => void
  dateRange: { start: string; end: string }
  setDateRange: (range: { start: string; end: string }) => void
  stockStatus: string
  setStockStatus: (status: string) => void
}

const FilterContext = createContext<FilterContextValue | null>(null)

export function FilterProvider({ children }: { children: ReactNode }) {
  const { sales } = useData()

  const dataRange = useMemo(() => {
    if (sales.length === 0) return { start: '2025-07-01', end: '2026-08-18' }
    const dates = sales.map(s => s.date).sort()
    return { start: dates[0], end: dates[dates.length - 1] }
  }, [sales])

  const [selectedOutlet, setSelectedOutlet] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState('all')
  const [dateRange, setDateRange] = useState(dataRange)
  const [stockStatus, setStockStatus] = useState('all')

  return (
    <FilterContext.Provider value={{
      selectedOutlet, setSelectedOutlet,
      selectedCategory, setSelectedCategory,
      selectedProduct, setSelectedProduct,
      dateRange, setDateRange,
      stockStatus, setStockStatus,
    }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters(): FilterContextValue {
  const ctx = useContext(FilterContext)
  if (!ctx) throw new Error('useFilters must be used within FilterProvider')
  return ctx
}
