import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import type { DailySales, Product } from '../../data/types'

interface TopProductsChartProps {
  sales: DailySales[]
  products: Product[]
  height?: number
}

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#f59e0b']

export default function TopProductsChart({ sales, products, height = 300 }: TopProductsChartProps) {
  const chartData = useMemo(() => {
    const salesByProduct: Record<string, number> = {}
    for (const s of sales) {
      salesByProduct[s.productId] = (salesByProduct[s.productId] || 0) + s.revenue
    }

    return products
      .map(p => ({
        name: p.name.length > 15 ? p.name.slice(0, 15) + '…' : p.name,
        fullName: p.name,
        revenue: Math.round(salesByProduct[p.id] || 0),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
  }, [sales, products])

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Products by Revenue</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={{ fontSize: 11, fill: '#6b7280' }}
          />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
          />
          <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
