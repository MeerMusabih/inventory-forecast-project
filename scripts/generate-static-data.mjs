import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const OUTLETS = [
  { id: 'outlet-1', name: 'Main Market', location: '123 Market Street', type: 'urban' },
  { id: 'outlet-2', name: 'City Center', location: '45 Downtown Ave', type: 'urban' },
  { id: 'outlet-3', name: 'Mall Branch', location: 'Shopping Mall Level 1', type: 'urban' },
  { id: 'outlet-4', name: 'Residential Branch', location: '78 Oak Lane', type: 'suburban' },
  { id: 'outlet-5', name: 'Highway Branch', location: 'Mile 12 Highway', type: 'highway' },
]

const PRODUCT_PROFILES = [
  { id: 'prod-1', name: 'Fresh Milk', category: 'Dairy', supplier: 'FreshFarm Co.', unit: 'liters', cost: 1.20, sellingPrice: 2.49, reorderPoint: 120, baseDemand: 40, priceMult: 0.8 },
  { id: 'prod-2', name: 'Whole Wheat Bread', category: 'Bakery', supplier: 'BakeRight Ltd.', unit: 'loaves', cost: 0.80, sellingPrice: 1.99, reorderPoint: 100, baseDemand: 35, priceMult: 0.7 },
  { id: 'prod-3', name: 'Cheddar Cheese', category: 'Dairy', supplier: 'FreshFarm Co.', unit: 'kg', cost: 4.50, sellingPrice: 8.99, reorderPoint: 60, baseDemand: 15, priceMult: 0.6 },
  { id: 'prod-4', name: 'Bananas', category: 'Fresh Produce', supplier: 'Tropical Fruits Inc.', unit: 'kg', cost: 0.50, sellingPrice: 1.29, reorderPoint: 150, baseDemand: 50, priceMult: 0.9 },
  { id: 'prod-5', name: 'Chicken Breast', category: 'Meat', supplier: 'PrimeMeat Supply', unit: 'kg', cost: 3.80, sellingPrice: 7.99, reorderPoint: 80, baseDemand: 25, priceMult: 0.7 },
  { id: 'prod-6', name: 'Rice (Basmati)', category: 'Grains', supplier: 'Global Grains Co.', unit: 'kg', cost: 1.50, sellingPrice: 3.49, reorderPoint: 200, baseDemand: 30, priceMult: 0.5 },
  { id: 'prod-7', name: 'Orange Juice', category: 'Beverages', supplier: 'JuiceWorld', unit: 'liters', cost: 1.00, sellingPrice: 2.99, reorderPoint: 80, baseDemand: 20, priceMult: 0.8 },
  { id: 'prod-8', name: 'Eggs (Dozen)', category: 'Dairy', supplier: 'FreshFarm Co.', unit: 'packs', cost: 1.80, sellingPrice: 3.99, reorderPoint: 100, baseDemand: 35, priceMult: 0.6 },
  { id: 'prod-9', name: 'Tomatoes', category: 'Fresh Produce', supplier: 'FreshFarm Co.', unit: 'kg', cost: 0.80, sellingPrice: 1.79, reorderPoint: 120, baseDemand: 40, priceMult: 0.9 },
  { id: 'prod-10', name: 'Cooking Oil', category: 'Pantry', supplier: 'Global Grains Co.', unit: 'liters', cost: 2.00, sellingPrice: 4.49, reorderPoint: 60, baseDemand: 18, priceMult: 0.4 },
  { id: 'prod-11', name: 'Pasta (Spaghetti)', category: 'Grains', supplier: 'Global Grains Co.', unit: 'kg', cost: 0.60, sellingPrice: 1.49, reorderPoint: 150, baseDemand: 28, priceMult: 0.5 },
  { id: 'prod-12', name: 'Butter', category: 'Dairy', supplier: 'FreshFarm Co.', unit: 'packs', cost: 1.50, sellingPrice: 3.29, reorderPoint: 80, baseDemand: 22, priceMult: 0.6 },
  { id: 'prod-13', name: 'Potatoes', category: 'Fresh Produce', supplier: 'FreshFarm Co.', unit: 'kg', cost: 0.40, sellingPrice: 0.99, reorderPoint: 200, baseDemand: 45, priceMult: 0.9 },
  { id: 'prod-14', name: 'Beef Mince', category: 'Meat', supplier: 'PrimeMeat Supply', unit: 'kg', cost: 5.00, sellingPrice: 9.99, reorderPoint: 60, baseDemand: 18, priceMult: 0.7 },
  { id: 'prod-15', name: 'Yogurt (Plain)', category: 'Dairy', supplier: 'FreshFarm Co.', unit: 'kg', cost: 1.20, sellingPrice: 2.79, reorderPoint: 80, baseDemand: 25, priceMult: 0.7 },
  { id: 'prod-16', name: 'Apples', category: 'Fresh Produce', supplier: 'Tropical Fruits Inc.', unit: 'kg', cost: 1.00, sellingPrice: 2.49, reorderPoint: 100, baseDemand: 30, priceMult: 0.8 },
  { id: 'prod-17', name: 'Coca-Cola (Cans)', category: 'Beverages', supplier: 'DrinkDistro', unit: 'cans', cost: 0.50, sellingPrice: 1.29, reorderPoint: 200, baseDemand: 50, priceMult: 0.3 },
  { id: 'prod-18', name: 'Bottled Water', category: 'Beverages', supplier: 'DrinkDistro', unit: 'liters', cost: 0.15, sellingPrice: 0.79, reorderPoint: 300, baseDemand: 60, priceMult: 0.2 },
  { id: 'prod-19', name: 'Instant Noodles', category: 'Grains', supplier: 'QuickMeals Inc.', unit: 'packs', cost: 0.30, sellingPrice: 0.99, reorderPoint: 200, baseDemand: 45, priceMult: 0.5 },
  { id: 'prod-20', name: 'Dish Soap', category: 'Household', supplier: 'CleanHome Co.', unit: 'bottles', cost: 1.00, sellingPrice: 2.49, reorderPoint: 60, baseDemand: 12, priceMult: 0.4 },
  { id: 'prod-21', name: 'Toilet Paper', category: 'Household', supplier: 'CleanHome Co.', unit: 'packs', cost: 2.00, sellingPrice: 4.99, reorderPoint: 80, baseDemand: 15, priceMult: 0.3 },
  { id: 'prod-22', name: 'Laundry Detergent', category: 'Household', supplier: 'CleanHome Co.', unit: 'bottles', cost: 3.00, sellingPrice: 6.99, reorderPoint: 50, baseDemand: 10, priceMult: 0.4 },
  { id: 'prod-23', name: 'Canned Tuna', category: 'Pantry', supplier: 'SeaHarvest', unit: 'cans', cost: 1.20, sellingPrice: 2.79, reorderPoint: 100, baseDemand: 20, priceMult: 0.5 },
  { id: 'prod-24', name: 'Sugar (White)', category: 'Pantry', supplier: 'Global Grains Co.', unit: 'kg', cost: 0.60, sellingPrice: 1.49, reorderPoint: 120, baseDemand: 22, priceMult: 0.4 },
  { id: 'prod-25', name: 'Salt', category: 'Pantry', supplier: 'Global Grains Co.', unit: 'kg', cost: 0.30, sellingPrice: 0.99, reorderPoint: 100, baseDemand: 18, priceMult: 0.3 },
  { id: 'prod-26', name: 'Chicken Wings', category: 'Meat', supplier: 'PrimeMeat Supply', unit: 'kg', cost: 3.20, sellingPrice: 6.99, reorderPoint: 60, baseDemand: 18, priceMult: 0.7 },
  { id: 'prod-27', name: 'Fish Fillet', category: 'Meat', supplier: 'SeaHarvest', unit: 'kg', cost: 5.50, sellingPrice: 11.99, reorderPoint: 40, baseDemand: 10, priceMult: 0.6 },
  { id: 'prod-28', name: 'Mangoes', category: 'Fresh Produce', supplier: 'Tropical Fruits Inc.', unit: 'kg', cost: 1.20, sellingPrice: 2.99, reorderPoint: 80, baseDemand: 22, priceMult: 0.9 },
  { id: 'prod-29', name: 'Lettuce', category: 'Fresh Produce', supplier: 'FreshFarm Co.', unit: 'heads', cost: 0.60, sellingPrice: 1.49, reorderPoint: 100, baseDemand: 28, priceMult: 0.9 },
  { id: 'prod-30', name: 'Onions', category: 'Fresh Produce', supplier: 'FreshFarm Co.', unit: 'kg', cost: 0.35, sellingPrice: 0.89, reorderPoint: 150, baseDemand: 35, priceMult: 0.9 },
  { id: 'prod-31', name: 'Green Tea', category: 'Beverages', supplier: 'TeaTime Co.', unit: 'boxes', cost: 2.00, sellingPrice: 4.49, reorderPoint: 50, baseDemand: 12, priceMult: 0.5 },
  { id: 'prod-32', name: 'Coffee Beans', category: 'Beverages', supplier: 'TeaTime Co.', unit: 'kg', cost: 6.00, sellingPrice: 12.99, reorderPoint: 40, baseDemand: 8, priceMult: 0.5 },
  { id: 'prod-33', name: 'Hand Soap', category: 'Household', supplier: 'CleanHome Co.', unit: 'bottles', cost: 0.80, sellingPrice: 1.99, reorderPoint: 60, baseDemand: 14, priceMult: 0.4 },
  { id: 'prod-34', name: 'Paper Towels', category: 'Household', supplier: 'CleanHome Co.', unit: 'rolls', cost: 1.50, sellingPrice: 3.49, reorderPoint: 50, baseDemand: 10, priceMult: 0.3 },
  { id: 'prod-35', name: 'Canned Beans', category: 'Pantry', supplier: 'QuickMeals Inc.', unit: 'cans', cost: 0.50, sellingPrice: 1.29, reorderPoint: 120, baseDemand: 20, priceMult: 0.5 },
  { id: 'prod-36', name: 'Tomato Sauce', category: 'Pantry', supplier: 'QuickMeals Inc.', unit: 'bottles', cost: 0.80, sellingPrice: 1.99, reorderPoint: 80, baseDemand: 18, priceMult: 0.5 },
  { id: 'prod-37', name: 'Grapes', category: 'Fresh Produce', supplier: 'Tropical Fruits Inc.', unit: 'kg', cost: 1.50, sellingPrice: 3.49, reorderPoint: 60, baseDemand: 15, priceMult: 0.9 },
  { id: 'prod-38', name: 'Pork Chops', category: 'Meat', supplier: 'PrimeMeat Supply', unit: 'kg', cost: 4.00, sellingPrice: 8.49, reorderPoint: 50, baseDemand: 14, priceMult: 0.7 },
  { id: 'prod-39', name: 'Honey', category: 'Pantry', supplier: 'FreshFarm Co.', unit: 'jars', cost: 3.00, sellingPrice: 6.49, reorderPoint: 40, baseDemand: 8, priceMult: 0.5 },
  { id: 'prod-40', name: 'Ice Cream', category: 'Dairy', supplier: 'FreshFarm Co.', unit: 'tubs', cost: 2.00, sellingPrice: 4.99, reorderPoint: 50, baseDemand: 12, priceMult: 0.6 },
]

function mulberry32(seed) {
  let s = seed
  return function() {
    s |= 0; s = s + 0x6D2B79F5 | 0
    let t = Math.imul(s ^ s >>> 15, 1 | s)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function generateData() {
  const rng = mulberry32(54321)
  const sales = []
  const inventory = []

  const startDate = new Date('2025-07-01')
  const endDate = new Date('2026-08-18')
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  const dates = []
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate.getTime() + i * 86400000)
    dates.push(d.toISOString().slice(0, 10))
  }

  const products = PRODUCT_PROFILES.map(p => ({
    id: p.id, name: p.name, category: p.category, supplier: p.supplier,
    unit: p.unit, cost: p.cost, sellingPrice: p.sellingPrice,
    reorderPoint: p.reorderPoint, averageDailyDemand: p.baseDemand,
  }))

  const stockProfiles = {}
  for (const outlet of OUTLETS) {
    stockProfiles[outlet.id] = {}
    for (const profile of PRODUCT_PROFILES) {
      const r = rng()
      let archetype
      if (r < 0.08) archetype = 'supply_disrupted'
      else if (r < 0.20) archetype = 'severely_overstocked'
      else if (r < 0.35) archetype = 'chronically_understocked'
      else if (r < 0.50) archetype = 'temporary_stockout'
      else archetype = 'normal'

      stockProfiles[outlet.id][profile.id] = {
        archetype,
        currentStock: 0,
        lastRestockDay: 0,
        stockoutDays: [],
      }
    }
  }

  const outletWeights = {
    'outlet-1': { base: 1.0, labels: 1.0 },
    'outlet-2': { base: 0.9, labels: 1.1 },
    'outlet-3': { base: 1.1, labels: 0.9 },
    'outlet-4': { base: 0.85, labels: 1.2 },
    'outlet-5': { base: 0.75, labels: 0.8 },
  }

  function seasonalFactor(dayOfYear) {
    const winter = [335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 364, 365, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
    const summer = [152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204]
    const holiday = [300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334]

    if (winter.includes(dayOfYear)) return 1.15
    if (summer.includes(dayOfYear)) return 0.85
    if (holiday.includes(dayOfYear)) return 1.30
    return 1.0
  }

  function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0)
    const diff = date.getTime() - start.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  const categoryReturnRates = {
    'Fresh Produce': 0.05,
    'Meat': 0.03,
    'Dairy': 0.04,
    'Bakery': 0.06,
    'Beverages': 0.02,
    'Grains': 0.02,
    'Pantry': 0.02,
    'Household': 0.02,
  }

  for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
    const currentDate = new Date(startDate.getTime() + dayOffset * 24 * 60 * 60 * 1000)
    const dateStr = currentDate.toISOString().split('T')[0]
    const dayOfWeek = currentDate.getDay()
    const dayOfYear = getDayOfYear(currentDate)
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    for (let oi = 0; oi < OUTLETS.length; oi++) {
      const outlet = OUTLETS[oi]
      for (let pi = 0; pi < PRODUCT_PROFILES.length; pi++) {
        const profile = PRODUCT_PROFILES[pi]
        const sp = stockProfiles[outlet.id][profile.id]
        const ow = outletWeights[outlet.id]

        let baseDemand = profile.baseDemand * ow.base
        if (isWeekend) baseDemand *= 1.3
        baseDemand *= seasonalFactor(dayOfYear)

        const weeklyCycle = 1 + 0.15 * Math.sin((dayOffset / 7) * 2 * Math.PI)
        baseDemand *= weeklyCycle

        let noise = 1 + (rng() - 0.5) * 0.4
        let demand = Math.max(0, Math.round(baseDemand * noise))

        let unitsSold = 0
        let unitsReturned = 0

        if (sp.archetype === 'supply_disrupted') {
          if (dayOffset > 60 && dayOffset < 90) {
            if (rng() < 0.6) {
              sp.currentStock = Math.max(0, sp.currentStock - 3)
            }
          }
          unitsSold = Math.min(demand, sp.currentStock)
          sp.currentStock = Math.max(0, sp.currentStock - unitsSold)
        } else if (sp.archetype === 'severely_overstocked') {
          unitsSold = Math.min(demand, sp.currentStock)
          sp.currentStock = Math.max(0, sp.currentStock - unitsSold)
          if (dayOffset % 7 === 0) {
            sp.currentStock += Math.round(profile.reorderPoint * 2.5)
          }
        } else if (sp.archetype === 'chronically_understocked') {
          unitsSold = Math.min(demand, sp.currentStock)
          sp.currentStock = Math.max(0, sp.currentStock - unitsSold)
          if (dayOffset % 21 === 0) {
            sp.currentStock += Math.round(profile.reorderPoint * 0.5)
          }
        } else if (sp.archetype === 'temporary_stockout') {
          unitsSold = Math.min(demand, sp.currentStock)
          sp.currentStock = Math.max(0, sp.currentStock - unitsSold)
          if (dayOffset >= 120 && dayOffset <= 140) {
            sp.currentStock = 0
            unitsSold = 0
          }
          if (dayOffset % 7 === 0) {
            sp.currentStock += Math.round(profile.reorderPoint * 1.0)
          }
        } else {
          unitsSold = Math.min(demand, sp.currentStock)
          sp.currentStock = Math.max(0, sp.currentStock - unitsSold)
          if (dayOffset % 14 === 0) {
            sp.currentStock += Math.round(profile.reorderPoint * 1.2)
          }
        }

        const returnRate = categoryReturnRates[profile.category] || 0.03
        if (unitsSold > 0 && rng() < returnRate) {
          unitsReturned = Math.max(1, Math.round(unitsSold * rng() * 0.3))
          unitsReturned = Math.min(unitsReturned, unitsSold)
          sp.currentStock += unitsReturned
        }

        const unitCost = profile.cost * (ow.labels + (rng() - 0.5) * 0.1)
        const revenue = unitsSold * profile.sellingPrice

        sales.push([dayOffset, pi, oi, unitsSold, Math.round(revenue * 100) / 100, unitsReturned])

        inventory.push([dayOffset, pi, oi, sp.currentStock, sp.currentStock === 0 ? 1 : 0])
      }
    }
  }

  return { outlets: OUTLETS, products, dates, sales, inventory, startDate: '2025-07-01' }
}

const data = generateData()

const outPath = join(__dirname, '..', 'src', 'data', 'generated-data.json')
writeFileSync(outPath, JSON.stringify(data))

const sizeMB = (Buffer.byteLength(JSON.stringify(data)) / 1024 / 1024).toFixed(1)
console.log(`Generated: ${data.sales.length} sales, ${data.inventory.length} inventory records`)
console.log(`File size: ${sizeMB} MB`)
console.log(`Saved to: ${outPath}`)
