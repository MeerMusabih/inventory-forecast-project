import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { IconCheck, IconUpload } from '../icons'
import { resetTestData } from '../../api/client'

const titles: Record<string, { title: string; crumb: string }> = {
  '/': { title: 'Dashboard', crumb: 'Overview' },
  '/inventory': { title: 'Inventory', crumb: 'Overview' },
  '/forecast': { title: 'Forecast', crumb: 'Planning' },
  '/actual-transfers': { title: 'Actual Transfers', crumb: 'Planning' },
  '/rop': { title: 'Reordering Point', crumb: 'Optimization' },
}

export default function TopBar() {
  const { pathname } = useLocation()
  const meta = titles[pathname] ?? { title: 'Inventory Intelligence', crumb: 'Home' }
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
    <header className="sticky top-0 z-20 bg-canvas/80 backdrop-blur border-b border-line">
      <div className="px-8 py-3.5 flex items-center gap-4">
        <nav className="flex items-center gap-2 text-[13px] min-w-0">
          <span className="font-semibold text-ink whitespace-nowrap">Inventory Intelligence</span>
          <span className="text-muted/60">/</span>
          <span className="text-muted whitespace-nowrap">{meta.crumb}</span>
          <span className="text-muted/60">/</span>
          <span className="text-primary-700 font-medium truncate">{meta.title}</span>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {error && <span className="text-xs text-danger">{error}</span>}
          <span className="hidden md:inline-flex items-center text-xs text-muted px-3 py-1.5 rounded-lg border border-line bg-surface">
            {today}
          </span>
          <span className="inline-flex items-center gap-2 text-xs font-medium text-success bg-success-bg px-3 py-1.5 rounded-lg border border-success/15">
            <IconCheck width={14} height={14} />
            Live
          </span>
          <button
            type="button"
            onClick={handleTest}
            disabled={running}
            className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-primary-700 hover:bg-primary-800 disabled:opacity-60 px-3.5 py-2 rounded-lg transition-colors"
          >
            <IconUpload width={14} height={14} className={running ? 'animate-spin' : ''} />
            {running ? 'Resetting…' : 'Test System'}
          </button>
        </div>
      </div>
    </header>
  )
}
