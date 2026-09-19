import { useCallback, useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import PageHeader from '../components/PageHeader'
import FileUpload from '../components/FileUpload'
import { IconSearch, IconCalendar, IconClose, IconDownload } from '../components/icons'
import {
  clearForecast,
  downloadContent,
  exportForecast,
  getForecastEntries,
  getForecastPeriods,
  uploadForecastFile,
  type ForecastEntry,
  type ForecastPeriod,
} from '../api/client'

const PAGE_SIZE = 200

export default function Forecast() {
  const [periods, setPeriods] = useState<ForecastPeriod[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState(1)
  const [entries, setEntries] = useState<ForecastEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [branch, setBranch] = useState('all')
  const [product, setProduct] = useState('all')
  const [activeExport, setActiveExport] = useState<null | 'csv' | 'json' | 'xml'>(null)

  const refreshPeriods = useCallback(async () => {
    const p = await getForecastPeriods()
    setPeriods(p)
  }, [])

  const refreshEntries = useCallback(async (period: number) => {
    setLoading(true)
    try {
      const e = await getForecastEntries(period)
      setEntries(e)
      setPage(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshPeriods()
  }, [refreshPeriods])

  useEffect(() => {
    refreshEntries(selectedPeriod)
  }, [selectedPeriod, refreshEntries])

  const branchOptions = useMemo(
    () => Array.from(new Set(entries.map(e => e.branch).filter(Boolean))).sort(),
    [entries]
  )

  const productOptions = useMemo(() => {
    const seen = new Map<string, string>()
    for (const e of entries) if (e.item_no) seen.set(e.item_no, e.item_name)
    return Array.from(seen.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [entries])

  const filtered = useMemo(
    () =>
      entries.filter(
        e =>
          (branch === 'all' || e.branch === branch) &&
          (product === 'all' || e.item_no === product) &&
          (!search ||
            e.item_no.toLowerCase().includes(search.toLowerCase()) ||
            e.item_name.toLowerCase().includes(search.toLowerCase()) ||
            e.branch.toLowerCase().includes(search.toLowerCase()))
      ),
    [entries, branch, product, search]
  )

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalQty = filtered.reduce((s, e) => s + e.quantity, 0)

  async function handleDelete() {
    if (!window.confirm(`Delete all ${entries.length} entries from Period ${selectedPeriod}?`)) return
    await clearForecast(selectedPeriod)
    setEntries([])
    refreshPeriods()
  }

  async function handleExport(format: 'csv' | 'json' | 'xml') {
    setActiveExport(format)
    try {
      const content = await exportForecast(format, selectedPeriod)
      const mime = format === 'json' ? 'application/json' : format === 'xml' ? 'application/xml' : 'text/csv'
      downloadContent(`forecast-p${selectedPeriod}.${format}`, content, mime)
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setActiveExport(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Forecast"
        description="Upload forecast demand per period — up to 20,000 entries with item, branch, quantity and date."
        actions={
          entries.length > 0 ? (
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
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-6 items-start">
        {/* Vertical period selector */}
        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="card overflow-hidden">
            <div className="card-head">
              <h3 className="card-title">Forecast periods</h3>
            </div>
            <div className="p-2.5 space-y-1.5">
              {periods.map(p => {
                const active = selectedPeriod === p.period
                return (
                  <button
                    key={p.period}
                    onClick={() => setSelectedPeriod(p.period)}
                    className={clsx(
                      'w-full text-left rounded-xl border px-3.5 py-3 transition-all',
                      active
                        ? 'bg-primary-700 border-primary-700 text-white shadow-card'
                        : 'bg-surface border-line hover:border-primary-300'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className={clsx('text-sm font-semibold', active ? 'text-white' : 'text-ink')}>
                        {p.name}
                      </p>
                      <IconCalendar
                        width={14}
                        height={14}
                        className={active ? 'text-primary-200' : 'text-muted'}
                      />
                    </div>
                    <p className={clsx('text-xs mt-1', active ? 'text-primary-100' : 'text-muted')}>
                      {p.entries.toLocaleString()} entries
                    </p>
                    {p.last_date && (
                      <p className={clsx('text-[11px] mt-0.5', active ? 'text-primary-100/80' : 'text-muted/80')}>
                        {p.first_date} → {p.last_date}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-5 min-w-0">
          {/* Upload + summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FileUpload
              title={`Upload period ${selectedPeriod} forecast`}
              hint="CSV / Excel / JSON — item no, item name, branch, quantity, date"
              onUpload={async file => {
                const r = await uploadForecastFile(selectedPeriod, file)
                await refreshPeriods()
                await refreshEntries(selectedPeriod)
                return r
              }}
            />
            <div className="card">
              <div className="card-head">
                <h3 className="card-title">Period {selectedPeriod} summary</h3>
              </div>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-canvas border border-line-soft p-3.5">
                    <p className="stat-label">Rows (filtered)</p>
                    <p className="text-xl font-semibold text-ink mt-1.5">{filtered.length.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl bg-canvas border border-line-soft p-3.5">
                    <p className="stat-label">Forecast qty (filtered)</p>
                    <p className="text-xl font-semibold text-primary-700 mt-1.5">{totalQty.toLocaleString()}</p>
                  </div>
                </div>
                {entries.length > 0 && (
                  <button onClick={handleDelete} className="btn-danger w-full">
                    <IconClose width={14} height={14} />
                    Clear period {selectedPeriod}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Data table */}
          <div className="card overflow-hidden">
            <div className="card-head">
              <div>
                <h3 className="card-title">Period {selectedPeriod} entries</h3>
                <p className="text-xs text-muted mt-0.5">
                  {filtered.length} shown of {entries.length}
                </p>
              </div>
              <div className="relative">
                <IconSearch width={15} height={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search item, name or branch…"
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value)
                    setPage(0)
                  }}
                  className="input pl-9 w-64"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 px-5 pt-4 pb-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-muted">
                Branch
                <select
                  value={branch}
                  onChange={e => {
                    setBranch(e.target.value)
                    setPage(0)
                  }}
                  className="select"
                >
                  <option value="all">All branches</option>
                  {branchOptions.map(b => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-muted">
                Product
                <select
                  value={product}
                  onChange={e => {
                    setProduct(e.target.value)
                    setPage(0)
                  }}
                  className="select"
                >
                  <option value="all">All products</option>
                  {productOptions.map(([code, name]) => (
                    <option key={code} value={code}>
                      {code} — {name}
                    </option>
                  ))}
                </select>
              </label>
              {(branch !== 'all' || product !== 'all' || search) && (
                <button
                  onClick={() => {
                    setBranch('all')
                    setProduct('all')
                    setSearch('')
                    setPage(0)
                  }}
                  className="btn btn-secondary btn-xs"
                >
                  Clear filters
                </button>
              )}
            </div>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item No</th>
                    <th>Item Name</th>
                    <th>Branch</th>
                    <th className="text-right">Qty</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="space-y-2.5 px-4 py-4">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex gap-4">
                              <div className="skeleton h-4 w-20" />
                              <div className="skeleton h-4 w-40" />
                              <div className="skeleton h-4 w-16" />
                              <div className="skeleton h-4 w-12 ml-auto" />
                              <div className="skeleton h-4 w-28" />
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ) : visible.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-muted">
                        No entries yet — upload a forecast file to get started.
                      </td>
                    </tr>
                  ) : (
                    visible.map(e => (
                      <tr key={e.id}>
                        <td className="font-medium text-ink">{e.item_no}</td>
                        <td>{e.item_name}</td>
                        <td>{e.branch || '—'}</td>
                        <td className="text-right font-medium text-ink">{e.quantity.toLocaleString()}</td>
                        <td>{e.date || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {pageCount > 1 && (
              <div className="px-5 py-3 border-t border-line-soft flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="btn btn-secondary btn-xs"
                >
                  Prev
                </button>
                <span className="text-xs text-muted">
                  Page {page + 1} of {pageCount}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
                  disabled={page >= pageCount - 1}
                  className="btn btn-secondary btn-xs"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}