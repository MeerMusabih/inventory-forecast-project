import type { Outlet, Product, DailySales, InventorySnapshot } from './types'

const OUTLETS: Outlet[] = [
  { id: 'outlet-1', name: 'Main Market', location: '123 Market Street', type: 'urban' },
  { id: 'outlet-2', name: 'City Center', location: '45 Downtown Ave', type: 'urban' },
  { id: 'outlet-3', name: 'Mall Branch', location: 'Shopping Mall Level 1', type: 'urban' },
  { id: 'outlet-4', name: 'Residential Branch', location: '78 Oak Lane', type: 'suburban' },
  { id: 'outlet-5', name: 'Highway Branch', location: 'Mile 12 Highway', type: 'highway' },
]

interface ProductProfile {
  id: string
  name: string
  category: string
  supplier: string
  unit: string
  cost: number
  sellingPrice: number
  reorderPoint: number
  baseDemand: number
  volatility: number
  seasonalPeak: number | null
  weekendBoost: number
  returnRate: number
  outletWeights: Record<string, number>
  trendDirection: number
}

const PRODUCT_PROFILES: ProductProfile[] = [
  { id: 'prod-1', name: 'Milk 1L', category: 'Dairy & Eggs', supplier: 'Fresh Farms Co.', unit: 'L', cost: 0.80, sellingPrice: 1.49, reorderPoint: 50, baseDemand: 32, volatility: 0.25, seasonalPeak: null, weekendBoost: 1.15, returnRate: 0.04, outletWeights: { 'outlet-1': 1.1, 'outlet-2': 0.9, 'outlet-3': 0.5, 'outlet-4': 1.6, 'outlet-5': 0.3 }, trendDirection: 0.02 },
  { id: 'prod-2', name: 'Bread Loaf', category: 'Bakery', supplier: 'Golden Bakery', unit: 'pcs', cost: 0.40, sellingPrice: 1.29, reorderPoint: 40, baseDemand: 28, volatility: 0.20, seasonalPeak: null, weekendBoost: 1.25, returnRate: 0.04, outletWeights: { 'outlet-1': 1.2, 'outlet-2': 1.0, 'outlet-3': 0.6, 'outlet-4': 1.5, 'outlet-5': 0.4 }, trendDirection: -0.01 },
  { id: 'prod-3', name: 'Eggs (12 pack)', category: 'Dairy & Eggs', supplier: 'Fresh Farms Co.', unit: 'pack', cost: 1.50, sellingPrice: 3.49, reorderPoint: 35, baseDemand: 20, volatility: 0.30, seasonalPeak: null, weekendBoost: 1.3, returnRate: 0.03, outletWeights: { 'outlet-1': 1.1, 'outlet-2': 0.8, 'outlet-3': 0.4, 'outlet-4': 1.7, 'outlet-5': 0.25 }, trendDirection: 0.03 },
  { id: 'prod-4', name: 'Coca-Cola 1.5L', category: 'Beverages', supplier: 'Beverage Dist.', unit: 'L', cost: 0.60, sellingPrice: 1.99, reorderPoint: 45, baseDemand: 24, volatility: 0.35, seasonalPeak: 180, weekendBoost: 1.4, returnRate: 0.03, outletWeights: { 'outlet-1': 1.0, 'outlet-2': 1.1, 'outlet-3': 1.5, 'outlet-4': 0.7, 'outlet-5': 1.8 }, trendDirection: 0.01 },
  { id: 'prod-5', name: 'Cooking Oil 1L', category: 'Cooking Essentials', supplier: 'Golden Oils Ltd.', unit: 'L', cost: 1.20, sellingPrice: 3.29, reorderPoint: 30, baseDemand: 14, volatility: 0.15, seasonalPeak: null, weekendBoost: 1.05, returnRate: 0.01, outletWeights: { 'outlet-1': 1.2, 'outlet-2': 0.9, 'outlet-3': 0.5, 'outlet-4': 1.4, 'outlet-5': 0.6 }, trendDirection: 0.0 },
  { id: 'prod-6', name: 'Rice 5kg', category: 'Grains & Pasta', supplier: 'Asian Foods Inc.', unit: 'bag', cost: 2.50, sellingPrice: 6.99, reorderPoint: 25, baseDemand: 11, volatility: 0.12, seasonalPeak: null, weekendBoost: 1.1, returnRate: 0.01, outletWeights: { 'outlet-1': 1.3, 'outlet-2': 0.8, 'outlet-3': 0.4, 'outlet-4': 1.5, 'outlet-5': 0.5 }, trendDirection: 0.0 },
  { id: 'prod-7', name: 'Chicken Breast 1kg', category: 'Meat & Poultry', supplier: 'Farm Fresh Meats', unit: 'kg', cost: 3.00, sellingPrice: 7.99, reorderPoint: 20, baseDemand: 16, volatility: 0.40, seasonalPeak: null, weekendBoost: 1.35, returnRate: 0.05, outletWeights: { 'outlet-1': 1.2, 'outlet-2': 1.0, 'outlet-3': 0.7, 'outlet-4': 1.3, 'outlet-5': 0.4 }, trendDirection: 0.02 },
  { id: 'prod-8', name: 'Mineral Water 1.5L', category: 'Beverages', supplier: 'Aqua Pure', unit: 'L', cost: 0.20, sellingPrice: 0.99, reorderPoint: 60, baseDemand: 38, volatility: 0.20, seasonalPeak: 170, weekendBoost: 1.5, returnRate: 0.02, outletWeights: { 'outlet-1': 1.0, 'outlet-2': 1.1, 'outlet-3': 1.3, 'outlet-4': 0.8, 'outlet-5': 2.2 }, trendDirection: 0.04 },
  { id: 'prod-9', name: 'Biscuits Pack', category: 'Snacks', supplier: 'Sweet Treats Co.', unit: 'pack', cost: 0.80, sellingPrice: 2.49, reorderPoint: 30, baseDemand: 17, volatility: 0.30, seasonalPeak: null, weekendBoost: 1.3, returnRate: 0.02, outletWeights: { 'outlet-1': 1.0, 'outlet-2': 0.9, 'outlet-3': 1.4, 'outlet-4': 0.6, 'outlet-5': 1.2 }, trendDirection: -0.01 },
  { id: 'prod-10', name: 'Tea Bags (100)', category: 'Beverages', supplier: 'Tea House Ltd.', unit: 'pack', cost: 1.00, sellingPrice: 3.99, reorderPoint: 25, baseDemand: 9, volatility: 0.18, seasonalPeak: 350, weekendBoost: 1.05, returnRate: 0.02, outletWeights: { 'outlet-1': 1.1, 'outlet-2': 1.0, 'outlet-3': 0.5, 'outlet-4': 1.3, 'outlet-5': 0.7 }, trendDirection: 0.0 },
  { id: 'prod-11', name: 'Sugar 1kg', category: 'Cooking Essentials', supplier: 'Sweet Supply Co.', unit: 'kg', cost: 0.60, sellingPrice: 1.79, reorderPoint: 35, baseDemand: 13, volatility: 0.10, seasonalPeak: null, weekendBoost: 1.05, returnRate: 0.01, outletWeights: { 'outlet-1': 1.2, 'outlet-2': 0.9, 'outlet-3': 0.4, 'outlet-4': 1.4, 'outlet-5': 0.5 }, trendDirection: 0.0 },
  { id: 'prod-12', name: 'Butter 250g', category: 'Dairy & Eggs', supplier: 'Fresh Farms Co.', unit: 'pcs', cost: 1.00, sellingPrice: 2.99, reorderPoint: 25, baseDemand: 11, volatility: 0.22, seasonalPeak: 340, weekendBoost: 1.2, returnRate: 0.04, outletWeights: { 'outlet-1': 1.0, 'outlet-2': 0.8, 'outlet-3': 0.6, 'outlet-4': 1.3, 'outlet-5': 0.4 }, trendDirection: -0.02 },
  { id: 'prod-13', name: 'Pasta 500g', category: 'Grains & Pasta', supplier: 'Italian Foods', unit: 'pack', cost: 0.50, sellingPrice: 1.69, reorderPoint: 30, baseDemand: 15, volatility: 0.18, seasonalPeak: null, weekendBoost: 1.15, returnRate: 0.01, outletWeights: { 'outlet-1': 1.1, 'outlet-2': 1.0, 'outlet-3': 0.7, 'outlet-4': 1.2, 'outlet-5': 0.6 }, trendDirection: 0.01 },
  { id: 'prod-14', name: 'Tomato Sauce', category: 'Cooking Essentials', supplier: 'Italian Foods', unit: 'jar', cost: 0.70, sellingPrice: 2.29, reorderPoint: 25, baseDemand: 10, volatility: 0.20, seasonalPeak: null, weekendBoost: 1.1, returnRate: 0.02, outletWeights: { 'outlet-1': 1.1, 'outlet-2': 0.9, 'outlet-3': 0.6, 'outlet-4': 1.3, 'outlet-5': 0.5 }, trendDirection: 0.0 },
  { id: 'prod-15', name: 'Potatoes 2kg', category: 'Fresh Produce', supplier: 'Green Valley Farms', unit: 'bag', cost: 1.00, sellingPrice: 2.99, reorderPoint: 30, baseDemand: 18, volatility: 0.30, seasonalPeak: null, weekendBoost: 1.2, returnRate: 0.06, outletWeights: { 'outlet-1': 1.3, 'outlet-2': 0.7, 'outlet-3': 0.3, 'outlet-4': 1.5, 'outlet-5': 0.3 }, trendDirection: 0.01 },
  { id: 'prod-16', name: 'Onions 1kg', category: 'Fresh Produce', supplier: 'Green Valley Farms', unit: 'kg', cost: 0.40, sellingPrice: 1.29, reorderPoint: 25, baseDemand: 14, volatility: 0.25, seasonalPeak: null, weekendBoost: 1.15, returnRate: 0.05, outletWeights: { 'outlet-1': 1.2, 'outlet-2': 0.8, 'outlet-3': 0.3, 'outlet-4': 1.4, 'outlet-5': 0.35 }, trendDirection: 0.0 },
  { id: 'prod-17', name: 'Apples 1kg', category: 'Fresh Produce', supplier: 'Green Valley Farms', unit: 'kg', cost: 1.20, sellingPrice: 3.49, reorderPoint: 20, baseDemand: 12, volatility: 0.35, seasonalPeak: 280, weekendBoost: 1.25, returnRate: 0.07, outletWeights: { 'outlet-1': 1.0, 'outlet-2': 0.9, 'outlet-3': 0.8, 'outlet-4': 1.2, 'outlet-5': 0.5 }, trendDirection: 0.02 },
  { id: 'prod-18', name: 'Bananas 1kg', category: 'Fresh Produce', supplier: 'Tropical Fruits Ltd.', unit: 'kg', cost: 0.50, sellingPrice: 1.49, reorderPoint: 25, baseDemand: 20, volatility: 0.30, seasonalPeak: null, weekendBoost: 1.2, returnRate: 0.08, outletWeights: { 'outlet-1': 1.1, 'outlet-2': 1.0, 'outlet-3': 0.9, 'outlet-4': 1.3, 'outlet-5': 0.6 }, trendDirection: 0.01 },
  { id: 'prod-19', name: 'Orange Juice 1L', category: 'Beverages', supplier: 'Beverage Dist.', unit: 'L', cost: 0.90, sellingPrice: 2.99, reorderPoint: 20, baseDemand: 9, volatility: 0.25, seasonalPeak: 170, weekendBoost: 1.3, returnRate: 0.03, outletWeights: { 'outlet-1': 0.9, 'outlet-2': 1.0, 'outlet-3': 1.2, 'outlet-4': 0.7, 'outlet-5': 0.8 }, trendDirection: -0.01 },
  { id: 'prod-20', name: 'Chips Pack', category: 'Snacks', supplier: 'Snack Attack Co.', unit: 'pack', cost: 0.60, sellingPrice: 1.99, reorderPoint: 35, baseDemand: 19, volatility: 0.35, seasonalPeak: 170, weekendBoost: 1.5, returnRate: 0.02, outletWeights: { 'outlet-1': 0.8, 'outlet-2': 1.0, 'outlet-3': 1.6, 'outlet-4': 0.5, 'outlet-5': 1.8 }, trendDirection: 0.03 },
  { id: 'prod-21', name: 'Yogurt 500g', category: 'Dairy & Eggs', supplier: 'Fresh Farms Co.', unit: 'cup', cost: 0.70, sellingPrice: 2.29, reorderPoint: 25, baseDemand: 13, volatility: 0.28, seasonalPeak: 170, weekendBoost: 1.2, returnRate: 0.05, outletWeights: { 'outlet-1': 1.0, 'outlet-2': 0.9, 'outlet-3': 0.8, 'outlet-4': 1.3, 'outlet-5': 0.4 }, trendDirection: 0.02 },
  { id: 'prod-22', name: 'Cheese Slices', category: 'Dairy & Eggs', supplier: 'Fresh Farms Co.', unit: 'pack', cost: 1.20, sellingPrice: 3.49, reorderPoint: 20, baseDemand: 8, volatility: 0.20, seasonalPeak: null, weekendBoost: 1.15, returnRate: 0.03, outletWeights: { 'outlet-1': 1.0, 'outlet-2': 0.9, 'outlet-3': 0.7, 'outlet-4': 1.2, 'outlet-5': 0.3 }, trendDirection: 0.0 },
  { id: 'prod-23', name: 'Frozen Peas 500g', category: 'Frozen Foods', supplier: 'FreezeFresh', unit: 'bag', cost: 0.80, sellingPrice: 2.49, reorderPoint: 20, baseDemand: 7, volatility: 0.15, seasonalPeak: 350, weekendBoost: 1.1, returnRate: 0.03, outletWeights: { 'outlet-1': 0.9, 'outlet-2': 0.7, 'outlet-3': 0.5, 'outlet-4': 1.3, 'outlet-5': 0.3 }, trendDirection: -0.01 },
  { id: 'prod-24', name: 'Ice Cream 500ml', category: 'Frozen Foods', supplier: 'Sweet Treats Co.', unit: 'tub', cost: 1.00, sellingPrice: 3.99, reorderPoint: 15, baseDemand: 10, volatility: 0.45, seasonalPeak: 170, weekendBoost: 1.6, returnRate: 0.04, outletWeights: { 'outlet-1': 0.8, 'outlet-2': 0.9, 'outlet-3': 1.8, 'outlet-4': 1.0, 'outlet-5': 0.5 }, trendDirection: 0.01 },
  { id: 'prod-25', name: 'Chocolate Bar', category: 'Snacks', supplier: 'Sweet Treats Co.', unit: 'pcs', cost: 0.50, sellingPrice: 1.79, reorderPoint: 40, baseDemand: 21, volatility: 0.30, seasonalPeak: 340, weekendBoost: 1.35, returnRate: 0.02, outletWeights: { 'outlet-1': 0.9, 'outlet-2': 1.0, 'outlet-3': 1.5, 'outlet-4': 0.6, 'outlet-5': 1.3 }, trendDirection: 0.0 },
  { id: 'prod-26', name: 'Peanut Butter 500g', category: 'Cooking Essentials', supplier: 'Nutty Best', unit: 'jar', cost: 1.50, sellingPrice: 4.49, reorderPoint: 15, baseDemand: 6, volatility: 0.12, seasonalPeak: null, weekendBoost: 1.05, returnRate: 0.01, outletWeights: { 'outlet-1': 1.0, 'outlet-2': 0.8, 'outlet-3': 0.6, 'outlet-4': 1.2, 'outlet-5': 0.4 }, trendDirection: 0.0 },
  { id: 'prod-27', name: 'Instant Noodles', category: 'Grains & Pasta', supplier: 'Asian Foods Inc.', unit: 'pack', cost: 0.30, sellingPrice: 1.29, reorderPoint: 50, baseDemand: 26, volatility: 0.30, seasonalPeak: 350, weekendBoost: 1.4, returnRate: 0.01, outletWeights: { 'outlet-1': 0.8, 'outlet-2': 0.9, 'outlet-3': 1.2, 'outlet-4': 0.6, 'outlet-5': 2.0 }, trendDirection: 0.02 },
  { id: 'prod-28', name: 'Detergent 1L', category: 'Household', supplier: 'CleanHome Supplies', unit: 'L', cost: 1.50, sellingPrice: 4.99, reorderPoint: 20, baseDemand: 7, volatility: 0.10, seasonalPeak: null, weekendBoost: 1.0, returnRate: 0.02, outletWeights: { 'outlet-1': 1.1, 'outlet-2': 0.8, 'outlet-3': 0.5, 'outlet-4': 1.4, 'outlet-5': 0.4 }, trendDirection: 0.0 },
  { id: 'prod-29', name: 'Toilet Paper (6 rolls)', category: 'Household', supplier: 'CleanHome Supplies', unit: 'pack', cost: 1.20, sellingPrice: 3.99, reorderPoint: 25, baseDemand: 9, volatility: 0.08, seasonalPeak: null, weekendBoost: 1.0, returnRate: 0.02, outletWeights: { 'outlet-1': 1.1, 'outlet-2': 0.9, 'outlet-3': 0.6, 'outlet-4': 1.3, 'outlet-5': 0.5 }, trendDirection: 0.0 },
  { id: 'prod-30', name: 'Hand Soap', category: 'Household', supplier: 'CleanHome Supplies', unit: 'pcs', cost: 0.80, sellingPrice: 2.49, reorderPoint: 20, baseDemand: 8, volatility: 0.12, seasonalPeak: 350, weekendBoost: 1.0, returnRate: 0.02, outletWeights: { 'outlet-1': 1.0, 'outlet-2': 0.9, 'outlet-3': 0.7, 'outlet-4': 1.2, 'outlet-5': 0.5 }, trendDirection: 0.01 },
  { id: 'prod-31', name: 'Soda Can 330ml', category: 'Beverages', supplier: 'Beverage Dist.', unit: 'can', cost: 0.30, sellingPrice: 1.29, reorderPoint: 60, baseDemand: 30, volatility: 0.35, seasonalPeak: 170, weekendBoost: 1.6, returnRate: 0.03, outletWeights: { 'outlet-1': 0.7, 'outlet-2': 0.9, 'outlet-3': 1.8, 'outlet-4': 0.4, 'outlet-5': 2.5 }, trendDirection: 0.01 },
  { id: 'prod-32', name: 'Energy Drink 250ml', category: 'Beverages', supplier: 'Beverage Dist.', unit: 'can', cost: 0.50, sellingPrice: 2.49, reorderPoint: 30, baseDemand: 14, volatility: 0.40, seasonalPeak: 170, weekendBoost: 1.7, returnRate: 0.03, outletWeights: { 'outlet-1': 0.6, 'outlet-2': 0.8, 'outlet-3': 1.6, 'outlet-4': 0.3, 'outlet-5': 2.2 }, trendDirection: 0.05 },
  { id: 'prod-33', name: 'Sunflower Oil 1L', category: 'Cooking Essentials', supplier: 'Golden Oils Ltd.', unit: 'L', cost: 1.30, sellingPrice: 3.49, reorderPoint: 25, baseDemand: 11, volatility: 0.12, seasonalPeak: null, weekendBoost: 1.05, returnRate: 0.01, outletWeights: { 'outlet-1': 1.2, 'outlet-2': 0.8, 'outlet-3': 0.4, 'outlet-4': 1.4, 'outlet-5': 0.5 }, trendDirection: 0.0 },
  { id: 'prod-34', name: 'Canned Beans 400g', category: 'Grains & Pasta', supplier: 'Pantry Essentials', unit: 'can', cost: 0.40, sellingPrice: 1.49, reorderPoint: 30, baseDemand: 9, volatility: 0.15, seasonalPeak: null, weekendBoost: 1.1, returnRate: 0.01, outletWeights: { 'outlet-1': 1.0, 'outlet-2': 0.8, 'outlet-3': 0.5, 'outlet-4': 1.1, 'outlet-5': 0.7 }, trendDirection: -0.01 },
  { id: 'prod-35', name: 'Honey 500g', category: 'Cooking Essentials', supplier: 'Natural Goods', unit: 'jar', cost: 2.00, sellingPrice: 6.99, reorderPoint: 12, baseDemand: 4, volatility: 0.20, seasonalPeak: 340, weekendBoost: 1.1, returnRate: 0.01, outletWeights: { 'outlet-1': 1.0, 'outlet-2': 0.9, 'outlet-3': 0.7, 'outlet-4': 1.1, 'outlet-5': 0.3 }, trendDirection: 0.01 },
  { id: 'prod-36', name: 'Coffee 200g', category: 'Beverages', supplier: 'Bean There Ltd.', unit: 'pack', cost: 2.50, sellingPrice: 7.99, reorderPoint: 20, baseDemand: 8, volatility: 0.18, seasonalPeak: 350, weekendBoost: 1.15, returnRate: 0.02, outletWeights: { 'outlet-1': 1.1, 'outlet-2': 1.2, 'outlet-3': 0.8, 'outlet-4': 1.0, 'outlet-5': 0.5 }, trendDirection: 0.02 },
  { id: 'prod-37', name: 'Chewing Gum', category: 'Snacks', supplier: 'Sweet Treats Co.', unit: 'pack', cost: 0.20, sellingPrice: 0.99, reorderPoint: 40, baseDemand: 16, volatility: 0.25, seasonalPeak: null, weekendBoost: 1.4, returnRate: 0.02, outletWeights: { 'outlet-1': 0.7, 'outlet-2': 0.9, 'outlet-3': 1.8, 'outlet-4': 0.4, 'outlet-5': 1.5 }, trendDirection: -0.02 },
  { id: 'prod-38', name: 'Baby Diapers', category: 'Household', supplier: 'BabyCare Inc.', unit: 'pack', cost: 4.00, sellingPrice: 12.99, reorderPoint: 15, baseDemand: 5, volatility: 0.10, seasonalPeak: null, weekendBoost: 1.0, returnRate: 0.03, outletWeights: { 'outlet-1': 1.0, 'outlet-2': 0.7, 'outlet-3': 0.3, 'outlet-4': 1.5, 'outlet-5': 0.2 }, trendDirection: 0.01 },
  { id: 'prod-39', name: 'Shampoo 400ml', category: 'Household', supplier: 'CleanHome Supplies', unit: 'btl', cost: 1.50, sellingPrice: 5.49, reorderPoint: 15, baseDemand: 5, volatility: 0.10, seasonalPeak: null, weekendBoost: 1.0, returnRate: 0.02, outletWeights: { 'outlet-1': 1.1, 'outlet-2': 0.9, 'outlet-3': 0.6, 'outlet-4': 1.2, 'outlet-5': 0.4 }, trendDirection: 0.0 },
  { id: 'prod-40', name: 'Toothpaste', category: 'Household', supplier: 'CleanHome Supplies', unit: 'pcs', cost: 0.80, sellingPrice: 2.99, reorderPoint: 20, baseDemand: 7, volatility: 0.10, seasonalPeak: null, weekendBoost: 1.0, returnRate: 0.02, outletWeights: { 'outlet-1': 1.0, 'outlet-2': 0.9, 'outlet-3': 0.6, 'outlet-4': 1.2, 'outlet-5': 0.4 }, trendDirection: 0.0 },
]

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gaussianRandom(rng: () => number): number {
  let u = 0, v = 0
  while (u === 0) u = rng()
  while (v === 0) v = rng()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

interface StockProfile {
  initialStockMultiplier: number
  reorderFrequency: number
  reorderQuantityMultiplier: number
  hasSupplyIssue: boolean
  supplyIssueStart: number
  supplyIssueEnd: number
}

export function generateData() {
  const rng = mulberry32(54321)
  const sales: DailySales[] = []
  const inventory: InventorySnapshot[] = []

  const startDate = new Date('2025-07-01')
  const endDate = new Date('2026-08-18')
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  const products: Product[] = PRODUCT_PROFILES.map(p => ({
    id: p.id, name: p.name, category: p.category, supplier: p.supplier,
    unit: p.unit, cost: p.cost, sellingPrice: p.sellingPrice,
    reorderPoint: p.reorderPoint, averageDailyDemand: p.baseDemand,
  }))

  const stockProfiles: Record<string, Record<string, StockProfile>> = {}
  for (const outlet of OUTLETS) {
    stockProfiles[outlet.id] = {}
    for (const profile of PRODUCT_PROFILES) {
      const r = rng()
      let sp: StockProfile

      if (r < 0.05) {
        sp = {
          initialStockMultiplier: 0.5 + rng() * 0.5,
          reorderFrequency: 5 + rng() * 3,
          reorderQuantityMultiplier: 1.5 + rng() * 1,
          hasSupplyIssue: true,
          supplyIssueStart: Math.floor(totalDays * (0.3 + rng() * 0.4)),
          supplyIssueEnd: Math.min(totalDays, Math.floor(totalDays * (0.3 + rng() * 0.4)) + 15),
        }
      } else if (r < 0.15) {
        sp = {
          initialStockMultiplier: 6 + rng() * 10,
          reorderFrequency: 4 + rng() * 3,
          reorderQuantityMultiplier: 2 + rng() * 2,
          hasSupplyIssue: false,
          supplyIssueStart: 0,
          supplyIssueEnd: 0,
        }
      } else if (r < 0.30) {
        sp = {
          initialStockMultiplier: 1 + rng() * 1.5,
          reorderFrequency: 7 + rng() * 5,
          reorderQuantityMultiplier: 1 + rng() * 0.8,
          hasSupplyIssue: false,
          supplyIssueStart: 0,
          supplyIssueEnd: 0,
        }
      } else if (r < 0.45) {
        const start = Math.floor(totalDays * (0.5 + rng() * 0.3))
        sp = {
          initialStockMultiplier: 3 + rng() * 3,
          reorderFrequency: 5 + rng() * 4,
          reorderQuantityMultiplier: 1.5 + rng() * 1,
          hasSupplyIssue: true,
          supplyIssueStart: start,
          supplyIssueEnd: Math.min(totalDays, start + Math.floor(10 + rng() * 15)),
        }
      } else {
        sp = {
          initialStockMultiplier: 1.5 + rng() * 3,
          reorderFrequency: 5 + rng() * 6,
          reorderQuantityMultiplier: 1 + rng() * 1.5,
          hasSupplyIssue: false,
          supplyIssueStart: 0,
          supplyIssueEnd: 0,
        }
      }

      stockProfiles[outlet.id][profile.id] = sp
    }
  }

  const stock: Record<string, Record<string, number>> = {}
  for (const outlet of OUTLETS) {
    stock[outlet.id] = {}
    for (const profile of PRODUCT_PROFILES) {
      const sp = stockProfiles[outlet.id][profile.id]
      const outletWeight = profile.outletWeights[outlet.id] || 1
      stock[outlet.id][profile.id] = Math.round(profile.baseDemand * outletWeight * sp.initialStockMultiplier)
    }
  }

  for (let d = 0; d < totalDays; d++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + d)
    const dateStr = date.toISOString().split('T')[0]
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6

    const dayProgress = d / totalDays

    for (const outlet of OUTLETS) {
      for (const profile of PRODUCT_PROFILES) {
        const outletWeight = profile.outletWeights[outlet.id] || 1
        const sp = stockProfiles[outlet.id][profile.id]

        let demand = profile.baseDemand * outletWeight

        demand *= 1 + gaussianRandom(rng) * profile.volatility

        if (isWeekend) {
          demand *= profile.weekendBoost
        }

        if (profile.seasonalPeak !== null) {
          const dist = Math.abs(dayOfYear - profile.seasonalPeak)
          const seasonalDist = Math.min(dist, 365 - dist)
          const seasonalEffect = Math.exp(-(seasonalDist * seasonalDist) / (2 * 25 * 25)) * 0.5
          demand *= 1 + seasonalEffect
        }

        if (profile.trendDirection !== 0) {
          demand *= 1 + profile.trendDirection * dayProgress
        }

        if (outlet.id === 'outlet-3' && profile.category === 'Fresh Produce') {
          demand *= 0.5 + rng() * 0.3
        }
        if (outlet.id === 'outlet-5' && ['Dairy & Eggs', 'Household'].includes(profile.category)) {
          demand *= 0.2 + rng() * 0.2
        }
        if (outlet.id === 'outlet-4' && profile.category === 'Frozen Foods') {
          demand *= 0.8 + rng() * 0.4
        }

        if (d > totalDays * 0.85 && rng() < 0.08) {
          demand *= 1.8 + rng() * 0.5
        }

        if (d > totalDays * 0.6 && d < totalDays * 0.7 && rng() < 0.05) {
          demand *= 0.3
        }

        const unitsSold = Math.max(0, Math.round(demand))
        const unitsSoldForStock = Math.min(unitsSold, stock[outlet.id][profile.id])
        stock[outlet.id][profile.id] = Math.max(0, stock[outlet.id][profile.id] - unitsSoldForStock)

        const unitsReturned = Math.max(0, Math.round(unitsSoldForStock * profile.returnRate * (0.5 + rng())))
        stock[outlet.id][profile.id] += unitsReturned

        const inSupplyIssue = sp.hasSupplyIssue && d >= sp.supplyIssueStart && d < sp.supplyIssueEnd

        const reorderDay = Math.floor(sp.reorderFrequency) > 0
          ? d % Math.floor(sp.reorderFrequency) === Math.floor(rng() * Math.max(1, Math.floor(sp.reorderFrequency)))
          : false

        if (!inSupplyIssue && reorderDay) {
          const reorderQty = Math.round(
            profile.baseDemand * outletWeight * sp.reorderQuantityMultiplier * (0.9 + rng() * 0.3)
          )
          stock[outlet.id][profile.id] += reorderQty
        }

        if (stock[outlet.id][profile.id] < profile.reorderPoint * 0.5 && rng() < 0.6 && !inSupplyIssue) {
          const emergencyReorder = Math.round(profile.baseDemand * outletWeight * 6)
          stock[outlet.id][profile.id] += emergencyReorder
        }

        const revenue = unitsSoldForStock * profile.sellingPrice

        sales.push({ date: dateStr, outletId: outlet.id, productId: profile.id, unitsSold: unitsSoldForStock, unitsReturned, revenue })

        inventory.push({
          date: dateStr,
          outletId: outlet.id,
          productId: profile.id,
          openingStock: stock[outlet.id][profile.id] + unitsSoldForStock - unitsReturned,
          unitsSold: unitsSoldForStock,
          unitsReturned,
          receivedStock: 0,
          closingStock: stock[outlet.id][profile.id],
        })
      }
    }
  }

  return { outlets: OUTLETS, products, sales, inventory }
}
