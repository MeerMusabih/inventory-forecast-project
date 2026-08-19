import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { DailySales } from '../../data/types'
import { formatDate } from '../../utils/formatters'

interface SalesTrendChartProps {
  sales: DailySales[]
  height?: number
}

export default function SalesTrendChart({ sales, height = 300 }: SalesTrendChartProps) {
  const chartData = useMemo(() => {
    const byDate: Record<string, { date: string; units: number; revenue: number }> = {}

    for (const s of sales) {
      if (!byDate[s.date]) {
        byDate[s.date] = { date: s.date, units: 0, revenue: 0 }
      }
      byDate[s.date].units += s.unitsSold
      byDate[s.date].revenue += s.revenue
    }

    return Object.values(byDate)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-60)
      .map(d => ({
        ...d,
        dateLabel: formatDate(d.date),
        revenue: Math.round(d.revenue),
      }))
  }, [sales])

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Sales Trend (Last 60 Days)</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="Revenue ($)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
