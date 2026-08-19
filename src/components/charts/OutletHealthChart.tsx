import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import type { OutletHealth } from '../../data/types'

interface OutletHealthChartProps {
  data: OutletHealth[]
  height?: number
}

function getBarColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#eab308'
  if (score >= 40) return '#f97316'
  return '#ef4444'
}

export default function OutletHealthChart({ data, height = 300 }: OutletHealthChartProps) {
  const chartData = useMemo(() => {
    return data.map(d => ({
      name: d.outletName.length > 12 ? d.outletName.slice(0, 12) + '…' : d.outletName,
      fullName: d.outletName,
      score: d.healthScore,
      stock: d.totalStock,
      lowStock: d.lowStock,
    }))
  }, [data])

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Outlet Health Score</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
            formatter={(value: number) => [`${value}/100`, 'Health Score']}
          />
          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={getBarColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
