import { NavLink } from 'react-router-dom'
import type { ComponentType, SVGProps } from 'react'
import clsx from 'clsx'
import {
  IconDashboard,
  IconInventory,
  IconForecast,
  IconTransfers,
  IconROP,
} from '../icons'

type NavItem = {
  to: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: IconDashboard },
      { to: '/inventory', label: 'Inventory', icon: IconInventory },
    ],
  },
  {
    title: 'Planning',
    items: [
      { to: '/forecast', label: 'Forecast', icon: IconForecast },
      { to: '/actual-transfers', label: 'Actual Transfers', icon: IconTransfers },
    ],
  },
  {
    title: 'Optimization',
    items: [{ to: '/rop', label: 'Reordering Point', icon: IconROP }],
  },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-shell text-shell-text flex flex-col min-h-screen fixed left-0 top-0 z-30 border-r border-shell-line">
      {/* Brand */}
      <div className="px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-900/30">
            <IconForecast className="text-white" width={20} height={20} />
          </div>
          <div className="leading-tight">
            <h1 className="text-[15px] font-semibold text-white tracking-[-0.01em]">
              Inventory Intelligence
            </h1>
            <p className="text-[11px] text-shell-text/70 mt-0.5">Demand planning suite</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-4 space-y-6 overflow-y-auto">
        {groups.map(group => (
          <div key={group.title}>
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-shell-text/50">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map(item => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      clsx(
                        'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                        isActive
                          ? 'bg-shell-soft text-white shadow-sm'
                          : 'text-shell-text hover:text-white hover:bg-shell-soft/60'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={clsx(
                            'absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all',
                            isActive ? 'h-6 bg-primary-400' : 'h-0 bg-transparent'
                          )}
                        />
                        <Icon
                          className={clsx(
                            'shrink-0 transition-colors',
                            isActive ? 'text-primary-300' : 'text-shell-text/70 group-hover:text-primary-300'
                          )}
                        />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-shell-line">
        <div className="rounded-xl bg-shell-soft border border-shell-line p-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-shell-text/70">
              System status
            </p>
          </div>
          <p className="text-sm font-semibold text-white mt-2">Prototype v2.0</p>
          <p className="text-[11px] text-shell-text/60 mt-0.5">6 periods · branch level</p>
        </div>
      </div>
    </aside>
  )
}
