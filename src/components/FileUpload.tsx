import { useRef, useState } from 'react'
import clsx from 'clsx'
import { IconUpload, IconAlert, IconCheck } from './icons'

interface FileUploadProps {
  accept?: string
  title: string
  hint?: string
  onUpload: (file: File) => Promise<{ inserted: number; skipped?: number }>
  compact?: boolean
  inline?: boolean
}

export default function FileUpload({ accept = '.csv,.xlsx,.xls,.json', title, hint, onUpload, compact, inline }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleFile(f: File | undefined) {
    if (!f) return
    setError(null)
    setResult(null)
    setUploading(true)
    try {
      const r = await onUpload(f)
      setResult(`Uploaded ${r.inserted} records${r.skipped ? ` · ${r.skipped} skipped` : ''}`)
      if (inputRef.current) inputRef.current.value = ''
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (inline) {
    return (
      <div
        className="inline-flex items-center gap-2 text-sm font-medium rounded-xl px-4 py-2.5 border border-line bg-surface text-ink-soft hover:border-primary-400 hover:text-ink transition-colors cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0])}
        />
        <IconUpload width={15} height={15} />
        {uploading ? (
          <span className="text-primary-700">Uploading…</span>
        ) : result ? (
          <span className="text-success">{result}</span>
        ) : error ? (
          <span className="text-danger">{error}</span>
        ) : (
          title
        )}
      </div>
    )
  }

  return (
    <div
      className={clsx(
        'group rounded-2xl border border-dashed text-center transition-all cursor-pointer',
        compact ? 'p-5' : 'p-8',
        error
          ? 'border-danger/40 bg-danger-bg'
          : 'border-line bg-surface hover:border-primary-400 hover:bg-primary-50/40'
      )}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={e => handleFile(e.target.files?.[0])}
      />
      <div
        className={clsx(
          'rounded-full bg-primary-50 text-primary-700 flex items-center justify-center mx-auto mb-3 transition-transform group-hover:-translate-y-0.5',
          compact ? 'w-9 h-9' : 'w-12 h-12'
        )}
      >
        <IconUpload width={compact ? 16 : 20} height={compact ? 16 : 20} />
      </div>
      <p className={clsx('font-medium text-ink', compact ? 'text-sm' : 'text-[15px]')}>{title}</p>
      {hint && <p className="text-xs text-muted mt-1.5 max-w-xs mx-auto">{hint}</p>}

      <div className="mt-3 min-h-[18px]">
        {uploading && <p className="text-xs text-primary-700">Uploading…</p>}
        {result && !uploading && (
          <p className="text-xs text-success inline-flex items-center gap-1.5">
            <IconCheck width={13} height={13} /> {result}
          </p>
        )}
        {error && !uploading && (
          <p className="text-xs text-danger inline-flex items-center gap-1.5">
            <IconAlert width={13} height={13} /> {error}
          </p>
        )}
      </div>
    </div>
  )
}
