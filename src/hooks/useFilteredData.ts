import { useMemo } from 'react'
import { useData } from '../store/DataContext'
import { useFilters } from '../store/FilterContext'
import type { DailySales, Product, Outlet } from '../data/types'

export function useFilteredData() {
  const { products, outlets, sales, inventory, salesByProductOutlet } = useData()
  const { selectedOutlet, selectedCategory, dateRange } = useFilters()

  const filteredOutlet = useMemo(() => {
    if (selectedOutlet === 'all') return outlets
    return outlets.filter(o => o.id === selectedOutlet)
  }, [outlets, selectedOutlet])

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products
    return products.filter(p => p.category === selectedCategory)
  }, [products, selectedCategory])

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const inOutlet = selectedOutlet === 'all' || s.outletId === selectedOutlet
      const inProduct = filteredProducts.some(p => p.id === s.productId)
      const inDate = s.date >= dateRange.start && s.date <= dateRange.end
      return inOutlet && inProduct && inDate
    })
  }, [sales, selectedOutlet, filteredProducts, dateRange])

  return {
    products: filteredProducts,
    outlets: filteredOutlet,
    sales: filteredSales,
    allProducts: products,
    allOutlets: outlets,
    allSales: sales,
    inventory,
    salesByProductOutlet,
  }
}
