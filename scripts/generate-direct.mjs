import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PRODUCTS = [
  { id: 'prod-1', name: 'Fresh Milk', category: 'Dairy', supplier: 'FreshFarm Co.', unit: 'liters', cost: 1.2, sellingPrice: 2.49, reorderPoint: 120, averageDailyDemand: 40 },
  { id: 'prod-2', name: 'Whole Wheat Bread', category: 'Bakery', supplier: 'BakeRight Ltd.', unit: 'loaves', cost: 0.8, sellingPrice: 1.99, reorderPoint: 100, averageDailyDemand: 35 },
  { id: 'prod-3', name: 'Cheddar Cheese', category: 'Dairy', supplier: 'FreshFarm Co.', unit: 'kg', cost: 4.5, sellingPrice: 8.99, reorderPoint: 60, averageDailyDemand: 15 },
  { id: 'prod-4', name: 'Bananas', category: 'Fresh Produce', supplier: 'Tropical Fruits Ltd.', unit: 'kg', cost: 0.5, sellingPrice: 1.49, reorderPoint: 80, averageDailyDemand: 30 },
  { id: 'prod-5', name: 'Chicken Breast', category: 'Meat', supplier: 'Farm Fresh Meats', unit: 'kg', cost: 3.0, sellingPrice: 7.99, reorderPoint: 50, averageDailyDemand: 20 },
  { id: 'prod-6', name: 'Orange Juice', category: 'Beverages', supplier: 'Beverage Dist.', unit: 'L', cost: 0.9, sellingPrice: 2.99, reorderPoint: 40, averageDailyDemand: 18 },
  { id: 'prod-7', name: 'Eggs (Dozen)', category: 'Dairy', supplier: 'FreshFarm Co.', unit: 'pack', cost: 1.5, sellingPrice: 3.49, reorderPoint: 70, averageDailyDemand: 25 },
  { id: 'prod-8', name: 'Tomatoes', category: 'Fresh Produce', supplier: 'Green Valley Farms', unit: 'kg', cost: 0.7, sellingPrice: 2.29, reorderPoint: 60, averageDailyDemand: 22 },
  { id: 'prod-9', name: 'Cooking Oil', category: 'Pantry', supplier: 'Golden Oils Ltd.', unit: 'L', cost: 1.2, sellingPrice: 3.29, reorderPoint: 45, averageDailyDemand: 12 },
  { id: 'prod-10', name: 'Pasta (Spaghetti)', category: 'Grains', supplier: 'Italian Foods', unit: 'pack', cost: 0.5, sellingPrice: 1.69, reorderPoint: 80, averageDailyDemand: 28 },
  { id: 'prod-11', name: 'Butter', category: 'Dairy', supplier: 'FreshFarm Co.', unit: '250g', cost: 1.0, sellingPrice: 2.99, reorderPoint: 50, averageDailyDemand: 16 },
  { id: 'prod-12', name: 'Potatoes', category: 'Fresh Produce', supplier: 'Green Valley Farms', unit: 'kg', cost: 0.8, sellingPrice: 2.49, reorderPoint: 55, averageDailyDemand: 18 },
  { id: 'prod-13', name: 'Beef Mince', category: 'Meat', supplier: 'Farm Fresh Meats', unit: 'kg', cost: 4.0, sellingPrice: 9.99, reorderPoint: 35, averageDailyDemand: 14 },
  { id: 'prod-14', name: 'Yogurt (Plain)', category: 'Dairy', supplier: 'FreshFarm Co.', unit: 'cup', cost: 0.7, sellingPrice: 2.29, reorderPoint: 40, averageDailyDemand: 15 },
  { id: 'prod-15', name: 'Apples', category: 'Fresh Produce', supplier: 'Green Valley Farms', unit: 'kg', cost: 1.2, sellingPrice: 3.49, reorderPoint: 45, averageDailyDemand: 16 },
  { id: 'prod-16', name: 'Coca-Cola (Cans)', category: 'Beverages', supplier: 'Beverage Dist.', unit: 'pack', cost: 0.6, sellingPrice: 1.99, reorderPoint: 90, averageDailyDemand: 32 },
  { id: 'prod-17', name: 'Bottled Water', category: 'Beverages', supplier: 'Aqua Pure', unit: 'bottles', cost: 0.2, sellingPrice: 0.99, reorderPoint: 100, averageDailyDemand: 45 },
  { id: 'prod-18', name: 'Instant Noodles', category: 'Grains', supplier: 'Asian Foods Inc.', unit: 'pack', cost: 0.3, sellingPrice: 1.29, reorderPoint: 85, averageDailyDemand: 30 },
  { id: 'prod-19', name: 'Rice (Basmati)', category: 'Grains', supplier: 'Asian Foods Inc.', unit: 'kg', cost: 2.5, sellingPrice: 6.99, reorderPoint: 70, averageDailyDemand: 20 },
  { id: 'prod-20', name: 'Dish Soap', category: 'Household', supplier: 'CleanHome Supplies', unit: 'L', cost: 1.5, sellingPrice: 4.99, reorderPoint: 30, averageDailyDemand: 8 },
  { id: 'prod-21', name: 'Toilet Paper', category: 'Household', supplier: 'CleanHome Supplies', unit: 'pack', cost: 1.2, sellingPrice: 3.99, reorderPoint: 50, averageDailyDemand: 14 },
  { id: 'prod-22', name: 'Laundry Detergent', category: 'Household', supplier: 'CleanHome Supplies', unit: 'L', cost: 1.5, sellingPrice: 5.49, reorderPoint: 35, averageDailyDemand: 10 },
  { id: 'prod-23', name: 'Canned Tuna', category: 'Pantry', supplier: 'Ocean Harvest', unit: 'can', cost: 0.8, sellingPrice: 2.49, reorderPoint: 60, averageDailyDemand: 18 },
  { id: 'prod-24', name: 'Sugar (White)', category: 'Pantry', supplier: 'Sweet Supply Co.', unit: 'kg', cost: 0.6, sellingPrice: 1.79, reorderPoint: 55, averageDailyDemand: 15 },
  { id: 'prod-25', name: 'Salt', category: 'Pantry', supplier: 'Sweet Supply Co.', unit: 'kg', cost: 0.3, sellingPrice: 1.29, reorderPoint: 40, averageDailyDemand: 12 },
  { id: 'prod-26', name: 'Chicken Wings', category: 'Meat', supplier: 'Farm Fresh Meats', unit: 'kg', cost: 2.5, sellingPrice: 6.99, reorderPoint: 40, averageDailyDemand: 12 },
  { id: 'prod-27', name: 'Fish Fillet', category: 'Meat', supplier: 'Ocean Harvest', unit: 'kg', cost: 5.0, sellingPrice: 12.99, reorderPoint: 25, averageDailyDemand: 8 },
  { id: 'prod-28', name: 'Mangoes', category: 'Fresh Produce', supplier: 'Tropical Fruits Ltd.', unit: 'kg', cost: 1.5, sellingPrice: 3.99, reorderPoint: 35, averageDailyDemand: 10 },
  { id: 'prod-29', name: 'Lettuce', category: 'Fresh Produce', supplier: 'Green Valley Farms', unit: 'head', cost: 0.4, sellingPrice: 1.49, reorderPoint: 50, averageDailyDemand: 15 },
  { id: 'prod-30', name: 'Onions', category: 'Fresh Produce', supplier: 'Green Valley Farms', unit: 'kg', cost: 0.4, sellingPrice: 1.29, reorderPoint: 65, averageDailyDemand: 18 },
  { id: 'prod-31', name: 'Green Tea', category: 'Beverages', supplier: 'Tea House Ltd.', unit: 'pack', cost: 1.0, sellingPrice: 3.99, reorderPoint: 25, averageDailyDemand: 6 },
  { id: 'prod-32', name: 'Coffee Beans', category: 'Beverages', supplier: 'Roast Masters', unit: '200g', cost: 2.5, sellingPrice: 7.99, reorderPoint: 30, averageDailyDemand: 8 },
  { id: 'prod-33', name: 'Hand Soap', category: 'Household', supplier: 'CleanHome Supplies', unit: 'bottle', cost: 0.8, sellingPrice: 2.49, reorderPoint: 35, averageDailyDemand: 10 },
  { id: 'prod-34', name: 'Paper Towels', category: 'Household', supplier: 'CleanHome Supplies', unit: 'pack', cost: 1.0, sellingPrice: 3.49, reorderPoint: 40, averageDailyDemand: 9 },
  { id: 'prod-35', name: 'Tomato Sauce', category: 'Pantry', supplier: 'Italian Foods', unit: 'jar', cost: 0.7, sellingPrice: 2.29, reorderPoint: 45, averageDailyDemand: 12 },
  { id: 'prod-36', name: 'Grapes', category: 'Fresh Produce', supplier: 'Green Valley Farms', unit: 'kg', cost: 1.8, sellingPrice: 4.99, reorderPoint: 30, averageDailyDemand: 8 },
  { id: 'prod-37', name: 'Pork Chops', category: 'Meat', supplier: 'Farm Fresh Meats', unit: 'kg', cost: 3.5, sellingPrice: 8.99, reorderPoint: 30, averageDailyDemand: 9 },
  { id: 'prod-38', name: 'Honey', category: 'Pantry', supplier: 'Natural Goodness', unit: '500g', cost: 2.0, sellingPrice: 6.99, reorderPoint: 25, averageDailyDemand: 5 },
  { id: 'prod-39', name: 'Ice Cream', category: 'Dairy', supplier: 'Sweet Treats Co.', unit: 'tub', cost: 1.0, sellingPrice: 3.99, reorderPoint: 35, averageDailyDemand: 10 },
  { id: 'prod-40', name: 'Canned Beans', category: 'Pantry', supplier: 'Ocean Harvest', unit: 'can', cost: 0.4, sellingPrice: 1.49, reorderPoint: 50, averageDailyDemand: 10 },
];

const OUTLETS = [
  { id: 'outlet-1', name: 'Main Market', location: '123 Market Street', type: 'urban' },
  { id: 'outlet-2', name: 'City Center', location: '45 Downtown Ave', type: 'urban' },
  { id: 'outlet-3', name: 'Mall Branch', location: 'Shopping Mall Level 1', type: 'urban' },
  { id: 'outlet-4', name: 'Residential Branch', location: '78 Oak Lane', type: 'suburban' },
  { id: 'outlet-5', name: 'Highway Branch', location: 'Mile 12 Highway', type: 'highway' },
];

const OUTLET_WEIGHTS = {
  'outlet-1': 1.0,
  'outlet-2': 1.0,
  'outlet-3': 0.85,
  'outlet-4': 1.2,
  'outlet-5': 0.7,
};

const CATEGORY_WEIGHTS = {
  'Dairy': { 'outlet-1': 1.1, 'outlet-2': 1.0, 'outlet-3': 0.8, 'outlet-4': 1.3, 'outlet-5': 0.5 },
  'Bakery': { 'outlet-1': 1.2, 'outlet-2': 1.1, 'outlet-3': 0.7, 'outlet-4': 1.3, 'outlet-5': 0.4 },
  'Fresh Produce': { 'outlet-1': 1.3, 'outlet-2': 1.0, 'outlet-3': 0.5, 'outlet-4': 1.4, 'outlet-5': 0.3 },
  'Meat': { 'outlet-1': 1.2, 'outlet-2': 1.0, 'outlet-3': 0.6, 'outlet-4': 1.1, 'outlet-5': 0.4 },
  'Beverages': { 'outlet-1': 1.0, 'outlet-2': 1.1, 'outlet-3': 1.4, 'outlet-4': 0.8, 'outlet-5': 1.8 },
  'Grains': { 'outlet-1': 1.1, 'outlet-2': 1.0, 'outlet-3': 0.7, 'outlet-4': 1.2, 'outlet-5': 0.6 },
  'Pantry': { 'outlet-1': 1.0, 'outlet-2': 0.9, 'outlet-3': 0.6, 'outlet-4': 1.1, 'outlet-5': 0.7 },
  'Household': { 'outlet-1': 1.1, 'outlet-2': 0.9, 'outlet-3': 0.5, 'outlet-4': 1.3, 'outlet-5': 0.5 },
};

// Deterministic seeded RNG
function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(42);

function gaussRand() {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Generate dates
const startDate = new Date('2025-07-01');
const endDate = new Date('2026-08-18');
const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
const dates = [];
for (let i = 0; i < totalDays; i++) {
  const d = new Date(startDate);
  d.setDate(d.getDate() + i);
  dates.push(d.toISOString().split('T')[0]);
}

// Pre-define stock levels per product-outlet to create realistic distribution
// We'll manually set starting stock and restocking behavior
const stockState = {};
const SALES = [];
const INVENTORY = [];

for (let pi = 0; pi < PRODUCTS.length; pi++) {
  const product = PRODUCTS[pi];
  for (let oi = 0; oi < OUTLETS.length; oi++) {
    const outlet = OUTLETS[oi];
    const catW = (CATEGORY_WEIGHTS[product.category] || {})[outlet.id] || 1;
    const outW = OUTLET_WEIGHTS[outlet.id] || 1;
    const demand = Math.round(product.averageDailyDemand * catW * outW);

    // Starting stock: 2-5x daily demand
    const startStock = Math.round(demand * (2 + rng() * 3));
    let stock = startStock;

    // Restock every 3-5 days with 2-4 days supply
    const restockFreq = 3 + Math.floor(rng() * 3); // every 3-5 days
    const restockQty = Math.round(demand * (2 + rng() * 2)); // 2-4 days supply

    // Supply issue: some product-outlets have a short disruption
    const hasIssue = rng() < 0.08;
    const issueStart = hasIssue ? Math.floor(totalDays * (0.4 + rng() * 0.3)) : -1;
    const issueLen = hasIssue ? 5 + Math.floor(rng() * 10) : 0;
    const issueEnd = issueStart + issueLen;

    for (let di = 0; di < totalDays; di++) {
      const dateStr = dates[di];
      const dow = new Date(dateStr).getDay();
      const isWeekend = dow === 0 || dow === 5 || dow === 6;

      // Calculate demand
      let dayDemand = demand;
      if (isWeekend) dayDemand *= 1.15 + rng() * 0.15;
      dayDemand *= 1 + gaussRand() * 0.25;
      if (di > totalDays * 0.85 && rng() < 0.05) dayDemand *= 1.5;
      dayDemand = Math.max(0, Math.round(dayDemand));

      // Sell
      const sold = Math.min(dayDemand, stock);
      stock = Math.max(0, stock - sold);

      // Returns (2-5%)
      const retRate = 0.02 + rng() * 0.03;
      const returned = Math.round(sold * retRate * (0.5 + rng()));
      stock += returned;

      // Restock
      const inIssue = hasIssue && di >= issueStart && di < issueEnd;
      if (!inIssue && di % restockFreq === 0 && di > 0) {
        stock += restockQty;
      }

      // Emergency restock if stock is critically low
      if (!inIssue && stock < demand * 0.5 && rng() < 0.6) {
        stock += Math.round(demand * 3);
      }

      // Cap stock at 20 days supply to prevent overstock
      const maxStock = Math.round(demand * 20);
      if (stock > maxStock) stock = maxStock;

      const revenue = Math.round(sold * product.sellingPrice * 100) / 100;

      SALES.push([pi, oi, di, sold, returned, revenue]);
      INVENTORY.push([pi, oi, di, stock, 0]);
    }
  }
}

const result = {
  outlets: OUTLETS,
  products: PRODUCTS,
  dates,
  sales: SALES,
  inventory: INVENTORY,
  startDate: '2025-07-01',
};

const outPath = resolve(__dirname, '..', 'src', 'data', 'generated-data.json');
writeFileSync(outPath, JSON.stringify(result));
console.log(`Generated: ${SALES.length} sales, ${INVENTORY.length} inventory records`);
console.log(`File size: ${(JSON.stringify(result).length / 1024 / 1024).toFixed(1)} MB`);

// Stats
let zeroStock = 0, overStock = 0, total = 0;
const latestStock = {};
for (const inv of INVENTORY) {
  const key = `${inv[0]}:${inv[1]}`;
  if (!latestStock[key] || inv[2] > latestStock[key].date) {
    latestStock[key] = { date: inv[2], stock: inv[3] };
  }
}
for (const v of Object.values(latestStock)) {
  total++;
  if (v.stock === 0) zeroStock++;
  if (v.stock > 200) overStock++;
}
console.log(`\nStock stats (${total} product-outlet pairs):`);
console.log(`  0 stock: ${zeroStock} (${(zeroStock/total*100).toFixed(1)}%)`);
console.log(`  >200 stock: ${overStock} (${(overStock/total*100).toFixed(1)}%)`);
console.log(`  Avg: ${Math.round(Object.values(latestStock).reduce((s,v) => s + v.stock, 0) / total)}`);
