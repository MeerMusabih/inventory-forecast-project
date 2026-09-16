import { useCallback, useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import PageHeader from '../components/PageHeader'
import {
  IconDownload,
  IconForecast,
  IconTransfers,
  IconAlert,
  IconBranch,
  IconSparkle,
} from '../components/icons'
import {
  downloadContent,
  exportDashboard,
  getBranches,
  getDashboardReport,
  getForecastPeriods,
  getProductCodes,
  type BranchInfo,
  type DashboardReport,
  type ForecastPeriod,
  type ProductCode,
} from '../api/client'

export default function Dashboard() {
  const [branches, setBranches] = useState<BranchInfo[]>([])
  const [periods, setPeriods] = useState<ForecastPeriod[]>([])
  const [products, setProducts] = useState<ProductCode[]>([])

  const [branch, setBranch] = useState('all')
  const [period, setPeriod] = useState(1)
  const [product, setProduct] = useState('all')
  const [report, setReport] = useState<DashboardReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeExport, setActiveExport] = useState<null | 'csv' | 'json' | 'xml'>(null)
  const [exportContent, setExportContent] = useState('')

  useEffect(() => {
    getBranches().then(setBranches)
    getForecastPeriods().then(setPeriods)
    getProductCodes().then(setProducts)
  }, [])

  const loadReport = useCallback(async (b: string, p: number, pr: string) => {
    setLoading(true)
    try {
      const r = await getDashboardReport(b, p, pr)
      setReport(r)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReport(branch, period, product)
  }, [branch, period, product, loadReport])

  async function handleExport(format: 'csv' | 'json' | 'xml') {
    setActiveExport(format)
    setExportContent('')
    try {
      const content = await exportDashboard(format, branch, period, product)
      setExportContent(content)
      const mime = format === 'json' ? 'application/json' : format === 'xml' ? 'application/xml' : 'text/csv'
      downloadContent(`dashboard-report-p${period}-${branch}.${format}`, content, mime)
    } catch (e) {
      setExportContent(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setActiveExport(null)
    }
  }

  const statusMeta = useMemo(
    () => ({
      accurate: { label: 'Accurate', cls: 'badge-success' },
      'over-forecast': { label: 'Over forecast', cls: 'badge-warn' },
      'under-forecast': { label: 'Under forecast', cls: 'badge-danger' },
    }),
    []
  )

  const summary = report?.summary

  const fmt = (n: number | undefined) =>
    n !== undefined ? Math.round(n).toLocaleString() : '—'

  const cards = [
    {
      label: 'Total Forecast',
      value: summary?.total_forecast,
      icon: IconForecast,
      accent: 'text-ink',
      chip: 'bg-line-soft text-ink-soft',
    },
    {
      label: 'Actual Received',
      value: summary?.total_actual_received,
      icon: IconTransfers,
      accent: 'text-primary-700',
      chip: 'bg-primary-50 text-primary-700',
    },
    {
      label: 'Total SKUs',
      value: summary?.total_skus,
      icon: IconBranch,
      accent: 'text-ink',
      chip: 'bg-line-soft text-ink-soft',
    },
    {
      label: 'Avg discrepancy / SKU',
      value: summary?.average_discrepancy,
      icon: IconAlert,
      accent: 'text-warn',
      chip: 'bg-warn-bg text-warn',
      suffix: summary ? ' units' : undefined,
    },
    {
      label: 'SKUs wrong forecast',
      value: summary?.wrong_skus_count,
      icon: IconSparkle,
      accent: 'text-danger',
      chip: 'bg-danger-bg text-danger',
    },
    {
      label: 'Failure rate',
      value: summary?.failure_rate,
      icon: IconAlert,
      accent: (summary?.failure_rate ?? 0) > 20 ? 'text-danger' : 'text-success',
      chip: (summary?.failure_rate ?? 0) > 20 ? 'bg-danger-bg text-danger' : 'bg-success-bg text-success',
      suffix: summary ? '%' : undefined,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Compare forecast against actual sales and received stock, and surface discrepancies per SKU."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted mr-1">Export</span>
            {(['csv', 'json', 'xml'] as const).map(f => (
              <button
                key={f}
                onClick={() => handleExport(f)}
                disabled={activeExport !== null}
                className="btn btn-secondary btn-xs uppercase tracking-wide"
              >
                <IconDownload width={14} height={14} />
                {activeExport === f ? '…' : f}
              </button>
            ))}
          </div>
        }
      />

      {/* Filters */}
      <div className="card">
        <div className="card-body grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Branch</label>
            <select value={branch} onChange={e => setBranch(e.target.value)} className="select w-full">
              <option value="all">All Branches</option>
              {branches.map(b => (
                <option key={b.code} value={b.code}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Period</label>
            <select value={period} onChange={e => setPeriod(Number(e.target.value))} className="select w-full">
              {periods.map(p => (
                <option key={p.period} value={p.period}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Product</label>
            <select value={product} onChange={e => setProduct(e.target.value)} className="select w-full">
              <option value="all">All Products</option>
              {products.map(p => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map(c => {
          const Icon = c.icon
          return (
            <div key={c.label} className="card p-5">
              <div className="flex items-start justify-between">
                <p className="stat-label">{c.label}</p>
                <span className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', c.chip)}>
                  <Icon width={16} height={16} />
                </span>
              </div>
              <p className={clsx('stat-value mt-3', c.accent)}>
                {fmt(c.value)}
                {c.value !== undefined && c.suffix && <span className="unit">{c.suffix.trim()}</span>}
              </p>
            </div>
          )
        })}
      </div>

      {/* Report table */}
      <div className="card overflow-hidden">
        <div className="card-head">
          <div>
            <h3 className="card-title">SKU Comparison Report</h3>
            <p className="text-xs text-muted mt-0.5">Forecast vs actual sales vs received stock</p>
          </div>
          <span className="badge-neutral">{report?.report.length ?? 0} SKUs</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-muted text-sm">Loading report…</div>
        ) : report && report.report.length === 0 ? (
          <div className="p-12 text-center text-muted text-sm">
            No data for the selected filters. Upload forecast data and actual transfers first.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item No</th>
                  <th>Item Name</th>
                  <th>Branch</th>
                  <th className="text-right">Forecast</th>
                  <th className="text-right">Actual Sales</th>
                  <th className="text-right">Actual Received</th>
                  <th className="text-right">Discrepancy</th>
                  <th className="text-right">% Error</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {report?.report.map(r => {
                  const meta = statusMeta[r.status as keyof typeof statusMeta] ?? statusMeta.accurate
                  return (
                    <tr key={`${r.item_no}-${r.branch}`}>
                      <td className="font-medium text-ink">{r.item_no}</td>
                      <td>{r.item_name}</td>
                      <td>{r.branch}</td>
                      <td className="text-right font-medium text-ink">{fmt(r.forecast)}</td>
                      <td className="text-right">{fmt(r.actual_sales)}</td>
                      <td className="text-right">{fmt(r.actual_received)}</td>
                      <td className={clsx('text-right font-semibold', r.discrepancy !== 0 ? 'text-warn' : 'text-success')}>
                        {r.discrepancy > 0 ? '+' : ''}
                        {fmt(r.discrepancy)}
                      </td>
                      <td className="text-right">{Math.round(r.pct_error)}%</td>
                      <td>
                        <span className={meta.cls}>{meta.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {exportContent && (
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Export preview</h3>
            <span className="badge-neutral">{activeExport ?? 'done'}</span>
          </div>
          <pre className="text-xs text-ink-soft bg-canvas rounded-b-2xl p-5 max-h-64 overflow-auto whitespace-pre-wrap break-all">
            {exportContent.slice(0, 4000)}
          </pre>
        </div>
      )}
    </div>
  )
}
