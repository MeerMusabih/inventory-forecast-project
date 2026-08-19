import clsx from 'clsx'

interface KPICardProps {
  label: string
  value: string | number
  icon: string
  color: string
  change?: number
  changeLabel?: string
}

export default function KPICard({ label, value, icon, color, change, changeLabel }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      {change !== undefined && (
        <div className="mt-3 flex items-center gap-1">
          <span className={clsx(
            'text-xs font-semibold',
            change >= 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
          </span>
          {changeLabel && (
            <span className="text-xs text-gray-400">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}
