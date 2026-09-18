import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { IconCheck, IconUpload, IconMenu } from '../icons'
import { resetTestData } from '../../api/client'

const titles: Record<string, { title: string; crumb: string }> = {
  '/': { title: 'Dashboard', crumb: 'Overview' },
  '/forecast': { title: 'Forecast', crumb: 'Planning' },
  '/actual-transfers': { title: 'Actual Transfers', crumb: 'Planning' },
  '/rop': { title: 'Reordering Point', crumb: 'Optimization' },
}

interface TopBarProps {
  onMenuClick: () => void
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { pathname } = useLocation()
  const meta = titles[pathname] ?? { title: 'Intelligent Forecast', crumb: 'Home' }
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const handleTest = async () => {
    if (running) return
    setRunning(true)
    setError('')
    try {
      await resetTestData()
      window.location.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reset failed')
      setRunning(false)
    }
  }

  return (
    <header className="sticky top-0 z-30 bg-canvas/85 backdrop-blur border-b border-line">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl text-ink-soft hover:bg-white border border-line bg-surface-warm"
          aria-label="Open menu"
        >
          <IconMenu width={18} height={18} />
        </button>

        <nav className="flex items-center gap-2 text-[13px] min-w-0">
          <span className="hidden sm:inline-flex w-8 h-8 rounded-xl bg-white border border-line items-center justify-center overflow-hidden">
            <img src="/bakery-logo.png" alt="" width={32} height={32} className="w-full h-full object-cover" />
          </span>
          <span className="font-bold text-ink whitespace-nowrap">Intelligent Forecast</span>
          <span className="text-muted/50 hidden md:inline">/</span>
          <span className="text-muted whitespace-nowrap hidden md:inline">{meta.crumb}</span>
          <span className="text-muted/50 hidden md:inline">/</span>
          <span className="text-primary-800 font-semibold truncate hidden md:inline">{meta.title}</span>
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {error && <span className="text-xs text-danger hidden sm:inline">{error}</span>}
          <span className="hidden md:inline-flex items-center text-xs font-semibold text-ink-soft px-3 py-1.5 rounded-lg border border-line bg-surface-warm">
            {today}
          </span>
          <span className="inline-flex items-center gap-2 text-xs font-bold text-success bg-success-bg px-3 py-1.5 rounded-lg border border-success/15">
            <IconCheck width={13} height={13} />
            Live
          </span>
          <button
            type="button"
            onClick={handleTest}
            disabled={running}
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-primary-700 hover:bg-primary-800 disabled:opacity-60 px-3.5 py-2 rounded-lg transition-colors shadow-card"
          >
            <IconUpload width={14} height={14} className={running ? 'animate-spin' : ''} />
            {running ? 'Resetting…' : 'Test System'}
          </button>
        </div>
      </div>
    </header>
  )
}