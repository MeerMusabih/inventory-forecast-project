import { useMemo } from 'react'
import type { HeatmapCell } from '../../data/types'

interface DemandHeatmapProps {
  cells: HeatmapCell[]
  products: string[]
  outlets: string[]
}

const LEVEL_COLORS: Record<string, string> = {
  very_low: 'bg-gray-100 text-gray-400',
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  very_high: 'bg-red-100 text-red-700',
}

const LEVEL_BG: Record<string, string> = {
  very_low: '#f9fafb',
  low: '#dcfce7',
  medium: '#fef9c3',
  high: '#ffedd5',
  very_high: '#fee2e2',
}

export default function DemandHeatmap({ cells, products, outlets }: DemandHeatmapProps) {
  const cellMap = useMemo(() => {
    const map: Record<string, HeatmapCell> = {}
    for (const cell of cells) {
      map[`${cell.productId}-${cell.outletId}`] = cell
    }
    return map
  }, [cells])

  const outletNameMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const cell of cells) {
      map[cell.outletId] = cell.outletName
    }
    return map
  }, [cells])

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 overflow-x-auto">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Demand Heatmap — Product × Outlet</h3>
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left p-2 font-medium text-gray-500 sticky left-0 bg-white">Product</th>
            {outlets.map(oId => (
              <th key={oId} className="p-2 font-medium text-gray-500 text-center min-w-[100px]">{outletNameMap[oId] || oId}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map(pId => {
            const firstCell = cells.find(c => c.productId === pId)
            return (
              <tr key={pId} className="border-t border-gray-100">
                <td className="p-2 font-medium text-gray-700 sticky left-0 bg-white whitespace-nowrap">
                  {firstCell?.productName || pId}
                </td>
                {outlets.map(oId => {
                  const cell = cellMap[`${pId}-${oId}`]
                  return (
                    <td key={oId} className="p-1 text-center">
                      <div
                        className="rounded-md px-2 py-2 font-medium"
                        style={{ backgroundColor: LEVEL_BG[cell?.level || 'very_low'] }}
                        title={`${cell?.productName} at ${cell?.outletName}: ${cell?.avgDailySales} units/day`}
                      >
                        {cell?.avgDailySales || 0}
                      </div>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
        <span className="font-medium">Legend:</span>
        {Object.entries(LEVEL_COLORS).map(([level, cls]) => (
          <div key={level} className="flex items-center gap-1">
            <div className={`w-4 h-4 rounded ${cls.split(' ')[0]}`} />
            <span className="capitalize">{level.replace('_', ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
