export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value))
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'critical': return 'text-red-600 bg-red-50'
    case 'high': return 'text-orange-600 bg-orange-50'
    case 'medium': return 'text-yellow-600 bg-yellow-50'
    case 'low': return 'text-green-600 bg-green-50'
    case 'healthy': return 'text-green-600 bg-green-50'
    case 'overstock': return 'text-purple-600 bg-purple-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

export function getHealthScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

export const CATEGORIES = [
  'Dairy & Eggs',
  'Bakery',
  'Beverages',
  'Cooking Essentials',
  'Grains & Pasta',
  'Meat & Poultry',
  'Snacks',
  'Fresh Produce',
  'Frozen Foods',
  'Household',
]
