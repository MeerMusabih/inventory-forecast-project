import { useMemo } from 'react'
import { useFilteredData } from '../hooks/useFilteredData'
import { calculateKPIs, calculateOutletHealth, calculateProductDemandRanks } from '../engine/kpi'
import { generateRecommendations } from '../engine/recommendations'
import { detectTransferOpportunities } from '../engine/transfers'
import { buildDemandHeatmap } from '../engine/heatmap'
import KPICard from '../components/cards/KPICard'
import SalesTrendChart from '../components/charts/SalesTrendChart'
import TopProductsChart from '../components/charts/TopProductsChart'
import OutletHealthChart from '../components/charts/OutletHealthChart'
import DemandHeatmap from '../components/charts/DemandHeatmap'
import { useFilters } from '../store/FilterContext'
import { useData } from '../store/DataContext'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

export default function Dashboard() {
  const { products, outlets, sales, allProducts, allOutlets, allSales, inventory, salesByProductOutlet } = useFilteredData()
  const { selectedOutlet } = useFilters()
  const { outlets: allOutletList } = useData()
  const navigate = useNavigate()

  const kpis = useMemo(() => calculateKPIs(products, outlets, sales, inventory, salesByProductOutlet), [products, outlets, sales, inventory, salesByProductOutlet])
  const outletHealth = useMemo(() => calculateOutletHealth(allProducts, allOutlets, allSales, inventory), [allProducts, allOutlets, allSales, inventory])
  const topProducts = useMemo(() => calculateProductDemandRanks(products, outlets, sales), [products, outlets, sales])
  const recommendations = useMemo(() => generateRecommendations(products, outlets, sales, inventory, salesByProductOutlet), [products, outlets, sales, inventory, salesByProductOutlet])
  const transfers = useMemo(() => detectTransferOpportunities(products, outlets, sales, inventory, salesByProductOutlet), [products, outlets, sales, inventory, salesByProductOutlet])
  const heatmapCells = useMemo(() => buildDemandHeatmap(products, outlets, sales, salesByProductOutlet), [products, outlets, sales, salesByProductOutlet])

  const criticalRecs = recommendations.filter(r => r.priority === 'critical').slice(0, 5)
  const topDemand = topProducts.slice(0, 10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory Intelligence Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          {selectedOutlet === 'all'
            ? 'Company-wide overview across all outlets'
            : `Viewing: ${allOutletList.find(o => o.id === selectedOutlet)?.name}`}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, i) => (
          <KPICard key={i} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesTrendChart sales={sales} />
        </div>
        <div>
          <OutletHealthChart data={outletHealth} />
        </div>
      </div>

      {heatmapCells.length > 0 && (
        <DemandHeatmap
          cells={heatmapCells}
          products={topProducts.slice(0, 15).map(p => p.productId)}
          outlets={outlets.map(o => o.id)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProductsChart sales={sales} products={products} />

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Demand Products</h3>
          <div className="space-y-2">
            {topDemand.map(p => (
              <div
                key={p.productId}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/products/${p.productId}`)}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary-50 text-primary-700 text-xs font-bold flex items-center justify-center">
                    {p.rank}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.productName}</p>
                    <p className="text-xs text-gray-400">{p.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700">{p.avgDailyDemand.toFixed(1)}</p>
                  <p className="text-xs text-gray-400">units/day</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Outlet Overview</h3>
            <button
              onClick={() => navigate('/outlets')}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-500">Outlet</th>
                  <th className="text-right py-2 font-medium text-gray-500">Products</th>
                  <th className="text-right py-2 font-medium text-gray-500">Stock</th>
                  <th className="text-right py-2 font-medium text-gray-500">Low</th>
                  <th className="text-right py-2 font-medium text-gray-500">Over</th>
                  <th className="text-right py-2 font-medium text-gray-500">Stockouts</th>
                  <th className="text-right py-2 font-medium text-gray-500">Health</th>
                </tr>
              </thead>
              <tbody>
                {outletHealth.map(oh => (
                  <tr
                    key={oh.outletId}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/outlets/${oh.outletId}`)}
                  >
                    <td className="py-2.5 font-medium text-gray-800">{oh.outletName}</td>
                    <td className="py-2.5 text-right text-gray-600">{oh.totalProducts}</td>
                    <td className="py-2.5 text-right text-gray-600">{oh.totalStock.toLocaleString()}</td>
                    <td className="py-2.5 text-right">
                      <span className={oh.lowStock > 20 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                        {oh.lowStock}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-gray-600">{oh.overstocked}</td>
                    <td className="py-2.5 text-right">
                      <span className={oh.predictedStockouts > 10 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                        {oh.predictedStockouts}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <span className={clsx(
                        'inline-block px-2 py-0.5 rounded-full text-xs font-semibold',
                        oh.healthScore >= 80 ? 'bg-green-50 text-green-700' :
                        oh.healthScore >= 60 ? 'bg-yellow-50 text-yellow-700' :
                        'bg-red-50 text-red-700'
                      )}>
                        {oh.healthScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Critical Alerts</h3>
            <button
              onClick={() => navigate('/recommendations')}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {criticalRecs.length === 0 && (
              <p className="text-sm text-gray-400 py-4 text-center">No critical alerts</p>
            )}
            {criticalRecs.map(rec => (
              <div key={rec.id} className="bg-red-50 border border-red-100 rounded-lg p-3">
                <p className="text-sm font-medium text-red-800">{rec.message}</p>
                <p className="text-xs text-red-600 mt-1">{rec.action}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                    {rec.outletName}
                  </span>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                    Critical
                  </span>
                </div>
              </div>
            ))}
          </div>

          {transfers.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-gray-700 mt-6 mb-3">Transfer Opportunities</h3>
              <div className="space-y-2">
                {transfers.slice(0, 3).map((t, i) => (
                  <div key={i} className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-800">{t.productName}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      {t.fromOutletName} → {t.toOutletName} ({t.suggestedTransfer} units)
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
