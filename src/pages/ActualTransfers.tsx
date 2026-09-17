import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import FileUpload from '../components/FileUpload'
import { IconPlus, IconClose, IconTransfers, IconBranch, IconDownload } from '../components/icons'
import {
  addActualTransferEntry,
  downloadContent,
  exportActualTransfers,
  getActualTransfers,
  getBranches,
  getForecastPeriods,
  uploadActualTransfersFile,
  type ActualTransfer,
  type BranchInfo,
  type ForecastPeriod,
} from '../api/client'

type DateMode = 'period' | 'duration'

interface DraftRow {
  key: number
  branch_code: string
  item_code: string
  item_name: string
  quantity: string
  date: string
}

export default function ActualTransfers() {
  const [branches, setBranches] = useState<BranchInfo[]>([])
  const [periods, setPeriods] = useState<ForecastPeriod[]>([])
  const [mode, setMode] = useState<DateMode>('period')
  const [branch, setBranch] = useState('all')
  const [period, setPeriod] = useState(1)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [transfers, setTransfers] = useState<ActualTransfer[]>([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState<null | 'csv' | 'json' | 'xml'>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [drafts, setDrafts] = useState<DraftRow[]>([])
  const [branchFilter, setBranchFilter] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const refresh = useCallback(async (b: string, m: DateMode, p: number, f: string, t: string) => {
    setLoading(true)
    try {
      const data = await getActualTransfers(
        b,
        m === 'period' ? { period: p } : { fromDate: f, toDate: t }
      )
      setTransfers(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getBranches().then(setBranches)
    getForecastPeriods().then(setPeriods)
  }, [])

  useEffect(() => {
    refresh(branch, mode, period, fromDate, toDate)
  }, [branch, mode, period, fromDate, toDate, refresh])

  function applyFilters() {
    refresh(branch, mode, period, fromDate, toDate)
  }

  async function handleExport(format: 'csv' | 'json' | 'xml') {
    setExporting(format)
    setExportError(null)
    try {
      const content = await exportActualTransfers(
        format,
        branch,
        mode === 'period' ? { period } : { fromDate, toDate }
      )
      const mime = format === 'json' ? 'application/json' : format === 'xml' ? 'application/xml' : 'text/csv'
      downloadContent(`actual-transfers.${format}`, content, mime)
    } catch (e) {
      setExportError(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setExporting(null)
    }
  }

  function handleUpload() {
    setBranchFilter(branch === 'all' ? '' : branch)
    setDrafts([{ key: Date.now(), branch_code: branch === 'all' ? '' : branch, item_code: '', item_name: '', quantity: '', date: '' }])
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setDrafts([])
    setError(null)
    setSuccess(null)
  }

  function updateDraft(key: number, field: keyof DraftRow, value: string) {
    setDrafts(ds => ds.map(d => (d.key === key ? { ...d, [field]: value } : d)))
  }

  function addRow() {
    setDrafts(ds => [
      ...ds,
      { key: Date.now() + Math.random(), branch_code: branchFilter || '', item_code: '', item_name: '', quantity: '', date: '' },
    ])
  }

  function removeRow(key: number) {
    setDrafts(ds => ds.filter(d => d.key !== key))
  }

  async function saveDrafts() {
    const valid = drafts.filter(d => d.item_code && d.quantity)
    if (valid.length === 0) {
      setError('Add at least one row with item code and quantity')
      return
    }
    setError(null)
    setSuccess(null)
    try {
      for (const d of valid) {
        await addActualTransferEntry({
          branch_code: d.branch_code,
          item_code: d.item_code,
          item_name: d.item_name,
          quantity: Number(d.quantity),
          date: d.date,
        })
      }
      setSuccess(`Saved ${valid.length} transfer record(s) to database`)
      setDrafts([])
      await applyFilters()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    }
  }

  const totalQty = transfers.reduce((s, t) => s + t.quantity, 0)
  const activeBranchName = branch === 'all' ? 'All branches' : branches.find(b => b.code === branch)?.name || branch
  const activePeriod = periods.find(p => p.period === period)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Actual Transfers"
        description="Stock received at each branch. Filter by period or date range, export the report, or record incoming transfers."
        actions={
          <div className="flex items-center gap-3 flex-wrap">
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
            <button onClick={handleUpload} className="btn-primary">
              <IconPlus width={15} height={15} />
              Record transfer
            </button>
            <FileUpload
              inline
              title="Bulk upload"
              onUpload={async file => {
                const r = await uploadActualTransfersFile(file)
                await applyFilters()
                return r
              }}
            />
          </div>
        }
      />

      {/* Filters */}
      <div className="card">
        <div className="card-body flex flex-wrap items-end gap-4">
          <div className="min-w-52">
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
          <div className="min-w-40">
            <label className="label">Filter by</label>
            <select value={mode} onChange={e => setMode(e.target.value as DateMode)} className="select w-full">
              <option value="period">Period</option>
              <option value="duration">Duration</option>
            </select>
          </div>
          {mode === 'period' ? (
            <div className="min-w-44">
              <label className="label">Period</label>
              <select value={period} onChange={e => setPeriod(Number(e.target.value))} className="select w-full">
                {periods.map(p => (
                  <option key={p.period} value={p.period}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div>
                <label className="label">From</label>
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">To</label>
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="input" />
              </div>
            </>
          )}
          <button onClick={applyFilters} className="btn-dark">
            Generate report
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-start justify-between">
            <p className="stat-label">Records</p>
            <span className="w-8 h-8 rounded-lg bg-line-soft text-ink-soft flex items-center justify-center">
              <IconTransfers width={16} height={16} />
            </span>
          </div>
          <p className="stat-value mt-3">{transfers.length.toLocaleString()}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-start justify-between">
            <p className="stat-label">Total quantity received</p>
            <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center">
              <IconPlus width={16} height={16} />
            </span>
          </div>
          <p className="stat-value mt-3 text-primary-700">{totalQty.toLocaleString()}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-start justify-between">
            <p className="stat-label">Active filter</p>
            <span className="w-8 h-8 rounded-lg bg-line-soft text-ink-soft flex items-center justify-center">
              <IconBranch width={16} height={16} />
            </span>
          </div>
          <p className="text-lg font-semibold text-ink mt-3">{activeBranchName}</p>
          <p className="text-xs text-muted mt-0.5">
            {mode === 'period'
              ? (activePeriod?.name || `Period ${period}`)
              : `${fromDate || 'any'} → ${toDate || 'any'}`}
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="card-head">
          <h3 className="card-title">Transfer report</h3>
          <span className="badge-neutral">{transfers.length.toLocaleString()} rows</span>
        </div>
        {exportError && <p className="px-5 pt-3 text-xs text-danger">{exportError}</p>}
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Branch Code</th>
                  <th>Item Code</th>
                  <th>Item Name</th>
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
                            <div className="skeleton h-4 w-16" />
                            <div className="skeleton h-4 w-24" />
                            <div className="skeleton h-4 w-36" />
                            <div className="skeleton h-4 w-12 ml-auto" />
                            <div className="skeleton h-4 w-28" />
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ) : transfers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted">
                      <span className="empty-state-icon">
                        <IconTransfers width={18} height={18} />
                      </span>
                      <span className="block text-sm font-semibold text-ink mt-2">No transfers found</span>
                      <span className="block text-xs text-muted mt-1">
                        No transfer records match the selected filters.
                      </span>
                    </td>
                  </tr>
                ) : (
                  transfers.map(t => (
                    <tr key={t.id}>
                      <td className="font-medium text-ink">{t.branch_code || '—'}</td>
                      <td>{t.item_code}</td>
                      <td>{t.item_name || '—'}</td>
                      <td className="text-right font-medium text-ink">{t.quantity.toLocaleString()}</td>
                      <td>{t.date || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
      </div>

      {/* Upload modal */}
      {showModal && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-raise border border-line">
            <div className="p-5 border-b border-line flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-ink">Record transfer</h3>
                <p className="text-xs text-muted mt-0.5">
                  Enter branch, item, quantity and date per row. Data is saved to the database.
                </p>
              </div>
              <button onClick={closeModal} className="btn-ghost btn-xs" aria-label="Close">
                <IconClose width={16} height={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {drafts.map(d => (
                <div key={d.key} className="grid grid-cols-12 gap-2 items-end rounded-xl border border-line-soft p-3 bg-canvas/50">
                  <div className="col-span-2">
                    <label className="label">Branch</label>
                    <select
                      value={d.branch_code}
                      onChange={e => updateDraft(d.key, 'branch_code', e.target.value)}
                      className="select w-full"
                    >
                      <option value="">Select branch…</option>
                      {branches.map(b => (
                        <option key={b.code} value={b.code}>
                          {b.name} ({b.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="label">Item code</label>
                    <input
                      type="text"
                      placeholder="SKU-001"
                      value={d.item_code}
                      onChange={e => updateDraft(d.key, 'item_code', e.target.value)}
                      className="input w-full"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="label">Item name</label>
                    <input
                      type="text"
                      placeholder="(optional)"
                      value={d.item_name}
                      onChange={e => updateDraft(d.key, 'item_name', e.target.value)}
                      className="input w-full"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Qty</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={d.quantity}
                      onChange={e => updateDraft(d.key, 'quantity', e.target.value)}
                      className="input w-full"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Date</label>
                    <input
                      type="date"
                      value={d.date}
                      onChange={e => updateDraft(d.key, 'date', e.target.value)}
                      className="input w-full"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center pb-2.5">
                    <button
                      onClick={() => removeRow(d.key)}
                      className="text-muted hover:text-danger transition-colors"
                      title="Remove row"
                    >
                      <IconClose width={16} height={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-line flex items-center gap-3 flex-wrap">
              <button onClick={addRow} className="btn-ghost text-primary-700 hover:bg-primary-50">
                <IconPlus width={15} height={15} />
                Add row
              </button>
              <span className="flex-1" />
              <button onClick={closeModal} className="btn-secondary">
                Cancel
              </button>
              <button onClick={saveDrafts} className="btn-primary">
                Save to database
              </button>
            </div>
            {error && <p className="px-5 pb-4 text-sm text-danger">{error}</p>}
            {success && <p className="px-5 pb-4 text-sm text-success">{success}</p>}
          </div>
        </div>
      )}
    </div>
  )
}