import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Forecast from './pages/Forecast'
import ActualTransfers from './pages/ActualTransfers'
import ROP from './pages/ROP'

export default function App() {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <div className="flex-1 ml-64 min-w-0">
        <TopBar />
        <main className="px-8 py-7">
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