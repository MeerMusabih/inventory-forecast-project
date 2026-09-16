import { useCallback, useEffect, useState } from 'react'
import clsx from 'clsx'
import PageHeader from '../components/PageHeader'
import FileUpload from '../components/FileUpload'
import { IconDownload, IconSparkle, IconCheck, IconAlert } from '../components/icons'
import {
  downloadContent,
  exportROPReport,
  getROPReport,
  uploadAccurateForecastFile,
  uploadMRPFile,
  type ROPReport,
} from '../api/client'

const COLUMN_HELP: { key: string; label: string; hint: string }[] = [
  { key: 'code', label: 'Code', hint: 'Item / raw material code' },
  { key: 'raw_material', label: 'Raw Material', hint: 'Product name' },
  { key: 'mrp_monthly', label: 'MRP Monthly', hint: 'Monthly requirement qty (from MRP)' },
  { key: 'lead_time_month', label: 'Lead Time (Month)', hint: 'Supplier lead time in months' },
  { key: 'sigma_demand', label: 'σ Demand (Month)', hint: 'Std dev of demand, auto-estimated from accurate forecast' },
  { key: 'sigma_lead_time', label: 'σ Lead Time (Month)', hint: 'Std dev of lead time' },
  { key: 'service_level', label: 'Service Level %', hint: 'Target fill rate (default 95%)' },
  { key: 'z_score', label: 'Z-Score', hint: 'Z value for the service level' },
  { key: 'safety_stock', label: 'Safety Stock', hint: 'Z × √(LT·σ²d + D²·σ²LT)' },
  { key: 'rop_per_month', label: 'ROP / Month', hint: 'Demand × LT + Safety Stock' },
  { key: 'notes', label: 'Notes', hint: 'Auto status note' },
  { key: 'unit_price', label: 'Unit Price', hint: 'Price per unit' },
  { key: 'ordering_cost', label: 'Ordering Cost (Co)', hint: 'Cost per order' },
  { key: 'holding_cost', label: 'Holding Cost (H)', hint: 'Carrying cost per unit' },
  { key: 'eoq', label: 'EOQ', hint: '√(2 × Annual Demand × Co / H)' },
  { key: 'stock_on_hand', label: 'Stock on Hand', hint: 'Current on-hand, auto from inventory' },
  { key: 'action', label: 'Action', hint: 'Safe or order quantity' },
  { key: 'moq', label: 'MOQ', hint: 'Minimum order qty from supplier' },
  { key: 'inventory_rop_cost', label: 'Inventory ROP Cost', hint: 'ROP × Unit Price' },
  { key: 'inv_cost_ss', label: 'Inv Cost of SS', hint: 'Safety Stock × Price × Holding' },
]

export default function ROP() {
  const [report, setReport] = useState<ROPReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [fcStatus, setFcStatus] = useState<string | null>(null)
  const [mrpStatus, setMrpStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [serviceLevel, setServiceLevel] = useState(95)
  const [orderingCost, setOrderingCost] = useState(50)
  const [holdingCost, setHoldingCost] = useState(0.1)
  const [defaultLeadTime, setDefaultLeadTime] = useState(1)
  const [exporting, setExporting] = useState<null | 'csv' | 'json' | 'xml'>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      try {
        const r = await getROPReport({
          service_level: serviceLevel,
          ordering_cost: orderingCost,
          holding_cost: holdingCost,
          default_lead_time: defaultLeadTime,
        })
        setReport(r)
        setError(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to generate ROP report')
      } finally {
        setLoading(false)
      }
    },
    [serviceLevel, orderingCost, holdingCost, defaultLeadTime]
  )

  useEffect(() => {
    load(true)
  }, [load])

  async function handleForecastUpload(file: File) {
    const r = await uploadAccurateForecastFile(file)
    setFcStatus(`Uploaded ${r.inserted} accurate forecast records`)
    return r
  }

  async function handleMRPUpload(file: File) {
    const r = await uploadMRPFile(file)
    setMrpStatus(`Uploaded ${r.inserted} MRP items`)
    await load(true)
    return r
  }

  async function handleExport(format: 'csv' | 'json' | 'xml') {
    setExporting(format)
    setExportError(null)
    try {
      const params = {
        service_level: serviceLevel,
        ordering_cost: orderingCost,
        holding_cost: holdingCost,
        default_lead_time: defaultLeadTime,
      }
      const content = await exportROPReport(format, params)
      const mime = format === 'json' ? 'application/json' : format === 'xml' ? 'application/xml' : 'text/csv'
      downloadContent(`rop-report.${format}`, content, mime)
    } catch (e) {
      setExportError(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reordering Point"
        description="Upload the accurate forecast and MRP file, then generate a reorder report comparing MRP demand against stock on hand."
        actions={
          report && report.report.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted mr-1">Export</span>
              {(['csv', 'json', 'xml'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => handleExport(f)}
                  disabled={exporting !== null}
                  className="btn btn-secondary btn-xs uppercase tracking-wide"
                >
                  <IconDownload width={14} height={14} />
                  {exporting === f ? '…' : f}
                </button>
              ))}
            </div>
          ) : undefined
        }
      />

      {/* Uploads + params */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-3">
          <FileUpload
            compact
            title="Upload accurate forecast"
            hint="CSV / Excel — item no, item name, branch, quantity, date"
            onUpload={handleForecastUpload}
          />
          {fcStatus && (
            <p className="text-xs text-success flex items-center gap-1.5 px-1">
              <IconCheck width={13} height={13} /> {fcStatus}
            </p>
          )}
        </div>
        <div className="space-y-3">
          <FileUpload
            compact
            title="Upload MRP file"
            hint="Excel / CSV — row label, product name, sum of requirement quantities, unit"
            onUpload={handleMRPUpload}
          />
          {mrpStatus && (
            <p className="text-xs text-success flex items-center gap-1.5 px-1">
              <IconCheck width={13} height={13} /> {mrpStatus}
            </p>
          )}
        </div>

        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Global parameters</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Service level %</label>
                <input
                  type="number"
                  value={serviceLevel}
                  min={50}
                  max={99.99}
                  step={0.1}
                  onChange={e => setServiceLevel(Number(e.target.value))}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label">Lead time (months)</label>
                <input
                  type="number"
                  value={defaultLeadTime}
                  min={0.1}
                  step={0.1}
                  onChange={e => setDefaultLeadTime(Number(e.target.value))}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label">Ordering cost (Co)</label>
                <input
                  type="number"
                  value={orderingCost}
                  min={0}
                  step={5}
                  onChange={e => setOrderingCost(Number(e.target.value))}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label">Holding cost (H)</label>
                <input
                  type="number"
                  value={holdingCost}
                  min={0}
                  step={0.01}
                  onChange={e => setHoldingCost(Number(e.target.value))}
                  className="input w-full"
                />
              </div>
            </div>
            <button onClick={() => load()} disabled={loading} className="btn-primary w-full">
              <IconSparkle width={15} height={15} />
              {loading ? 'Generating…' : 'Generate ROP report'}
            </button>
            {error && <p className="text-xs text-danger">{error}</p>}
          </div>
        </div>
      </div>

      {/* Summary */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-5">
            <p className="stat-label">Total items</p>
            <p className="stat-value mt-3">{report.total}</p>
          </div>
          <div className="card p-5">
            <div className="flex items-start justify-between">
              <p className="stat-label">Safe — stock covers ROP</p>
              <span className="w-8 h-8 rounded-lg bg-success-bg text-success flex items-center justify-center">
                <IconCheck width={16} height={16} />
              </span>
            </div>
            <p className="stat-value mt-3 text-success">{report.safe}</p>
          </div>
          <div className="card p-5">
            <div className="flex items-start justify-between">
              <p className="stat-label">Reorder required</p>
              <span className="w-8 h-8 rounded-lg bg-danger-bg text-danger flex items-center justify-center">
                <IconAlert width={16} height={16} />
              </span>
            </div>
            <p className="stat-value mt-3 text-danger">{report.reorder}</p>
          </div>
        </div>
      )}

      {/* ROP table */}
      {report && report.report.length > 0 && (
        <div className="card overflow-hidden">
          <div className="card-head">
            <div>
              <h3 className="card-title">ROP report</h3>
              <p className="text-xs text-muted mt-0.5">Hover a column header for the formula</p>
            </div>
          </div>
          {exportError && <p className="px-5 pt-3 text-xs text-danger">{exportError}</p>}
          <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
            <table className="data-table">
              <thead>
                <tr>
                  {COLUMN_HELP.map(c => (
                    <th key={c.key} title={c.hint} className="cursor-help whitespace-nowrap">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.report.map((r, i) => (
                  <tr key={i} className={clsx(r.action.startsWith('SAFE') ? 'bg-success-bg/30' : 'bg-danger-bg/20')}>
                    <td className="font-medium text-ink whitespace-nowrap">{r.code}</td>
                    <td className="whitespace-nowrap">{r.raw_material}</td>
                    <td className="text-right text-ink">{r.mrp_monthly.toLocaleString()}</td>
                    <td className="text-right">{r.lead_time_month}</td>
                    <td className="text-right">{r.sigma_demand}</td>
                    <td className="text-right">{r.sigma_lead_time}</td>
                    <td className="text-right">{r.service_level}%</td>
                    <td className="text-right">{r.z_score}</td>
                    <td className="text-right font-medium text-ink">{r.safety_stock.toLocaleString()}</td>
                    <td className="text-right font-bold text-primary-700">{r.rop_per_month.toLocaleString()}</td>
                    <td className="text-muted whitespace-nowrap">{r.notes}</td>
                    <td className="text-right">{r.unit_price.toLocaleString()}</td>
                    <td className="text-right">{r.ordering_cost.toLocaleString()}</td>
                    <td className="text-right">{r.holding_cost}</td>
                    <td className="text-right">{r.eoq.toLocaleString()}</td>
                    <td className="text-right font-medium text-ink">{r.stock_on_hand.toLocaleString()}</td>
                    <td>
                      <span className={r.action.startsWith('SAFE') ? 'badge-success' : 'badge-danger'}>{r.action}</span>
                    </td>
                    <td className="text-right">{r.moq.toLocaleString()}</td>
                    <td className="text-right">{r.inventory_rop_cost.toLocaleString()}</td>
                    <td className="text-right">{r.inv_cost_ss.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!report && !loading && (
        <div className="card p-12 text-center">
          <p className="text-muted text-sm max-w-lg mx-auto">
            No ROP report yet. Upload an MRP file (Excel/CSV with row label, product name, sum of requirement
            quantities, unit), optionally the accurate forecast, then click Generate ROP report.
          </p>
        </div>
      )}
    </div>
  )
}
