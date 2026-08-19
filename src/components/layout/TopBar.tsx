import { useFilters } from '../../store/FilterContext'
import { useData } from '../../store/DataContext'
import { CATEGORIES } from '../../utils/formatters'

export default function TopBar() {
  const {
    selectedOutlet, setSelectedOutlet,
    selectedCategory, setSelectedCategory,
    dateRange, setDateRange,
  } = useFilters()
  const { outlets } = useData()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500">Outlet</label>
        <select
          value={selectedOutlet}
          onChange={e => setSelectedOutlet(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        >
          <option value="all">All Outlets</option>
          {outlets.map(o => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500">Category</label>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500">From</label>
        <input
          type="date"
          value={dateRange.start}
          onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500">To</label>
        <input
          type="date"
          value={dateRange.end}
          onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
          Demand Forecast — Prototype
        </div>
      </div>
    </header>
  )
}
