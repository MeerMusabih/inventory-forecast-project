import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import LoadingScreen from './components/LoadingScreen'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Forecast from './pages/Forecast'
import ActualTransfers from './pages/ActualTransfers'
import ROP from './pages/ROP'

function AppShell() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex-1 min-w-0 lg:pl-72">
        <TopBar onMenuClick={() => setMenuOpen(true)} />
        <main key={pathname} className="px-4 sm:px-6 lg:px-8 py-6 sm:py-7 page-enter">
          <div className="mx-auto max-w-[1400px]">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/forecast" element={<Forecast />} />
              <Route path="/actual-transfers" element={<ActualTransfers />} />
              <Route path="/rop" element={<ROP />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const [splash, setSplash] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    let cancelled = false
    const ready =
      document.fonts && typeof document.fonts.ready === 'object'
        ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1200))])
        : Promise.resolve()

    ready
      .then(() => (cancelled ? null : new Promise(r => setTimeout(r, 450))))
      .then(() => {
        if (cancelled) return
        setFading(true)
        setTimeout(() => setSplash(false), 420)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      {splash && (
        <div
          className={`fixed inset-0 z-[100] transition-opacity duration-500 ${fading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <LoadingScreen />
        </div>
      )}
      <AppShell />
    </>
  )
}