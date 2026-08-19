import { useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import type { ForecastResult } from '../../data/types'
import { formatDate } from '../../utils/formatters'

interface ForecastChartProps {
  forecast: ForecastResult
  height?: number
}

export default function ForecastChart({ forecast, height = 300 }: ForecastChartProps) {
  const chartData = useMemo(() => {
    return forecast.forecastDays.map(d => ({
      date: d.date,
      dateLabel: formatDate(d.date),
      predicted: d.predicted,
      upper: Math.round(d.predicted * 1.2),
      lower: Math.round(d.predicted * 0.8),
    }))
  }, [forecast])

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">14-Day Demand Forecast</h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          forecast.confidence === 'high' ? 'bg-green-50 text-green-700' :
          forecast.confidence === 'medium' ? 'bg-yellow-50 text-yellow-700' :
          'bg-red-50 text-red-700'
        }`}>
          {forecast.confidence} confidence
        </span>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: '#9ca3af' }} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
          />
          <ReferenceLine
            y={forecast.predictedDemand}
            stroke="#94a3b8"
            strokeDasharray="5 5"
            label={{ value: 'Avg', position: 'right', fontSize: 10, fill: '#94a3b8' }}
          />
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="url(#forecastGradient)"
          />
          <Area
            type="monotone"
            dataKey="predicted"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#forecastGradient)"
            dot={{ r: 3, fill: '#3b82f6' }}
            name="Predicted Demand"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
