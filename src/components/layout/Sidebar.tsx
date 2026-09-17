import { NavLink } from 'react-router-dom'
import type { ComponentType, SVGProps } from 'react'
import clsx from 'clsx'
import {
  IconDashboard,
  IconInventory,
  IconForecast,
  IconTransfers,
  IconROP,
  IconClose,
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

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm transition-opacity lg:hidden',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-shell text-shell-text',
          'border-r border-shell-line transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="px-5 pt-7 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center overflow-hidden shadow-lg shadow-black/25 border border-line shrink-0">
              <img
                src="/bakery-logo.png"
                alt="Inventory Intelligence logo"
                width={44}
                height={44}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="leading-tight min-w-0">
              <h1 className="text-[15px] font-extrabold text-white tracking-[-0.01em] flex items-center gap-2">
                Inventory Intelligence
              </h1>
              <p className="text-[11px] text-shell-text/60 mt-0.5 font-medium">Demand planning suite</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden absolute top-5 right-4 text-shell-text/70 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <IconClose width={18} height={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pb-4 space-y-6 overflow-y-auto">
          {groups.map(group => (
            <div key={group.title}>
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-shell-text/40">
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
                      onClick={onClose}
                      className={({ isActive }) =>
                        clsx(
                          'group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                          isActive
                            ? 'bg-primary-400/15 text-primary-50 ring-1 ring-inset ring-primary-300/25 shadow-[inset_0_0_0_1px_rgba(221,164,111,0.08)]'
                            : 'text-shell-text/75 hover:text-white hover:bg-shell-soft'
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={clsx(
                              'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all',
                              isActive ? 'h-6 bg-primary-300' : 'h-0 bg-transparent'
                            )}
                          />
                          <Icon
                            className={clsx(
                              'shrink-0 transition-colors',
                              isActive ? 'text-primary-300' : 'text-shell-text/50 group-hover:text-primary-300'
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
          <div className="rounded-xl bg-shell-soft/60 border border-shell-line p-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_0_3px_rgba(22,128,92,0.25)]" />
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-shell-text/60">
                System status
              </p>
            </div>
            <p className="text-sm font-bold text-white mt-2">Prototype v2.0</p>
            <p className="text-[11px] text-shell-text/50 mt-0.5 font-medium">6 periods · branch level</p>
          </div>
        </div>
      </aside>
    </>
  )
}