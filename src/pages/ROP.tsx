import { useCallback, useEffect, useState } from 'react'
import clsx from 'clsx'
import PageHeader from '../components/PageHeader'
import FileUpload from '../components/FileUpload'
import { IconDownload, IconSparkle, IconCheck, IconAlert } from '../components/icons'
import {
  downloadContent,
  exportROPReport,
  getROPReport,
  uploadMRPFile,
  uploadStockFile,
  type ROPReport,
} from '../api/client'

const COLUMN_HELP: { key: string; label: string; hint: string }[] = [
  { key: 'code', label: 'Item Code', hint: 'Item / row label from the MRP file' },
  { key: 'raw_material', label: 'Item Name', hint: 'Requirement name from the MRP file' },
  { key: 'mrp_monthly', label: 'MRP Monthly Qty', hint: 'Monthly requirement quantity (from MRP)' },
  { key: 'stock_on_hand', label: 'Hands On Stock', hint: 'Current stock, from the uploaded stock file' },
  { key: 'action', label: 'Action', hint: 'GREEN when stock covers the requirement, ORANGE when overstocked >25% (still safe), RED when short' },
  { key: 'order_more', label: 'Order More', hint: 'How many more units to order when short' },
]

export default function ROP() {
  const [report, setReport] = useState<ROPReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [mrpStatus, setMrpStatus] = useState<string | null>(null)
  const [stockStatus, setStockStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState<null | 'csv' | 'json' | 'xml'>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const r = await getROPReport()
      setReport(r)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate ROP report')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(true)
  }, [load])

  async function handleMRPUpload(file: File) {
    const r = await uploadMRPFile(file)
    setMrpStatus(`Uploaded ${r.inserted} MRP items`)
    await load(true)
    return r
  }

  async function handleStockUpload(file: File) {
    const r = await uploadStockFile(file)
    setStockStatus(`Uploaded ${r.inserted} stock records`)
    await load(true)
    return r
  }

  async function handleExport(format: 'csv' | 'json' | 'xml') {
    setExporting(format)
    setExportError(null)
    try {
      const content = await exportROPReport(format)
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
        description="Upload the MRP and stock files, then compare MRP requirement against stock on hand: enough (green), overstocked >25% (orange, still safe), or short (red)."
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

      {/* Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-3">
          <FileUpload
            compact
            title="Upload MRP file"
            hint="Excel / CSV — row label, requirement name, requirement quantity, unit"
            onUpload={handleMRPUpload}
          />
          {mrpStatus && (
            <p className="text-xs text-success flex items-center gap-1.5 px-1">
              <IconCheck width={13} height={13} /> {mrpStatus}
            </p>
          )}
        </div>
        <div className="space-y-3">
          <FileUpload
            compact
            title="Upload stock file"
            hint="Excel / CSV — item code, item name, stock on hand"
            onUpload={handleStockUpload}
          />
          {stockStatus && (
            <p className="text-xs text-success flex items-center gap-1.5 px-1">
              <IconCheck width={13} height={13} /> {stockStatus}
            </p>
          )}
        </div>

        <div className="card">
          <div className="card-body">
            <p className="text-xs text-muted mb-3">
              Compare MRP monthly requirement against hands-on stock per item. Missing stock is treated as 0 (short).
            </p>
            <button onClick={() => load()} disabled={loading} className="btn-primary w-full">
              <IconSparkle width={15} height={15} />
              {loading ? 'Generating…' : 'Generate ROP report'}
            </button>
            {error && <p className="text-xs text-danger mt-2">{error}</p>}
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
              <p className="stat-label">Safe — stock covers requirement</p>
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
              <p className="text-xs text-muted mt-0.5">Green = enough stock, orange = overstocked &gt;25% (still safe), red = short. Hover a column header for details.</p>
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
                  <tr
                    key={i}
                    className={clsx(
                      r.action.startsWith('SAFE')
                        ? r.overstocked
                          ? 'bg-warn-bg/60'
                          : 'bg-success-bg/30'
                        : 'bg-danger-bg/20'
                    )}
                  >
                    <td className="font-medium text-ink whitespace-nowrap">{r.code}</td>
                    <td className="whitespace-nowrap">{r.raw_material}</td>
                    <td className="text-right text-ink">{r.mrp_monthly.toLocaleString()}</td>
                    <td className="text-right font-medium text-ink">{r.stock_on_hand.toLocaleString()}</td>
                    <td>
                      <span
                        className={
                          r.overstocked
                            ? 'badge-warn'
                            : r.action.startsWith('SAFE')
                              ? 'badge-success'
                              : 'badge-danger'
                        }
                      >
                        {r.action}
                      </span>
                    </td>
                    <td className="text-right font-bold text-primary-700">
                      {r.order_more > 0 ? r.order_more.toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loading && !report && (
        <div className="card p-12 flex flex-col items-center justify-center text-center gap-3">
          <div className="animate-[logoPulse_1.8s_ease-in-out_infinite]">
            <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-700 to-shell flex items-center justify-center">
              <IconSparkle width={20} height={20} className="text-primary-200" />
            </span>
          </div>
          <p className="text-sm font-semibold text-ink-soft">Generating ROP report…</p>
          <p className="text-xs text-muted">Comparing MRP requirement against stock on hand</p>
        </div>
      )}

      {!report && !loading && (
        <div className="card p-12 flex flex-col items-center justify-center text-center gap-3">
          <span className="empty-state-icon">
            <IconAlert width={20} height={20} />
          </span>
          <p className="text-sm font-semibold text-ink">No ROP report yet</p>
          <p className="text-muted text-sm max-w-lg mx-auto">
            Upload the MRP file and the stock file, then click Generate ROP report.
          </p>
        </div>
      )}
    </div>
  )
}