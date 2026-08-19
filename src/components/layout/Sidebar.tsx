import { NavLink } from 'react-router-dom'
import clsx from 'clsx'

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'D' },
  { to: '/inventory', label: 'Inventory', icon: 'I' },
  { to: '/forecast', label: 'Forecast', icon: 'F' },
  { to: '/ml-forecast', label: 'ML Models', icon: 'M' },
  { to: '/products', label: 'Products', icon: 'P' },
  { to: '/outlets', label: 'Outlets', icon: 'O' },
  { to: '/recommendations', label: 'Recommendations', icon: 'R' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col min-h-screen fixed left-0 top-0 z-30">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <span className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">II</span>
          <span>Inventory Intelligence</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">Predictive Analytics Platform</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
              isActive
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            )}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-xs text-gray-400">Demand Forecast</p>
          <p className="text-sm font-semibold text-primary-400">Prototype v1.0</p>
          <p className="text-xs text-gray-500 mt-1">5 outlets · 40 products</p>
        </div>
      </div>
    </aside>
  )
}
