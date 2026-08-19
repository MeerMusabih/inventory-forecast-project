import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Forecast from './pages/Forecast'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Outlets from './pages/Outlets'
import OutletDetail from './pages/OutletDetail'
import Recommendations from './pages/Recommendations'
import MLForecast from './pages/MLForecast'

export default function App() {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#eef0f4' }}>
      <Sidebar />
      <div className="flex-1 ml-64">
        <TopBar />
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/outlets" element={<Outlets />} />
            <Route path="/outlets/:id" element={<OutletDetail />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/ml-forecast" element={<MLForecast />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
