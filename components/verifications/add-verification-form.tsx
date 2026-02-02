'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { VerificationStatus, EvidenceType } from '@/lib/verifications'

interface AddVerificationFormProps {
  fields: { label: string; fieldId: string }[]
  defaultFieldId?: string
  onSave: (data: {
    fieldId: string
    status: VerificationStatus
    evidenceType: EvidenceType
    url: string | null
    quote: string | null
    fileRef: string | null
    notes: string | null
  }) => void
  onCancel: () => void
}

const STATUS_OPTIONS: { value: VerificationStatus; label: string }[] = [
  { value: 'verified', label: 'Verified' },
  { value: 'needs_review', label: 'Needs review' },
  { value: 'rejected', label: 'Rejected' },
]

const EVIDENCE_OPTIONS: { value: EvidenceType; label: string }[] = [
  { value: 'url', label: 'URL' },
  { value: 'text', label: 'Text' },
  { value: 'file', label: 'File' },
]

export function AddVerificationForm({
  fields,
  defaultFieldId,
  onSave,
  onCancel,
}: AddVerificationFormProps) {
  const [fieldId, setFieldId] = useState(defaultFieldId || fields[0]?.fieldId || '')
  const [status, setStatus] = useState<VerificationStatus>('verified')
  const [evidenceType, setEvidenceType] = useState<EvidenceType>('url')
  const [url, setUrl] = useState('')
  const [quote, setQuote] = useState('')
  const [fileRef, setFileRef] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      fieldId,
      status,
      evidenceType,
      url: evidenceType === 'url' && url.trim() ? url.trim() : null,
      quote: (evidenceType === 'text' || evidenceType === 'url') && quote.trim() ? quote.trim() : null,
      fileRef: evidenceType === 'file' && fileRef.trim() ? fileRef.trim() : null,
      notes: notes.trim() || null,
    })
  }

  const hasPayload =
    (evidenceType === 'url' && url.trim()) ||
    (evidenceType === 'text' && quote.trim()) ||
    (evidenceType === 'file' && fileRef.trim())

  return (
    <form onSubmit={handleSubmit} className="border border-indigo-200 rounded-lg p-4 bg-indigo-50/50 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
          <Plus className="h-4 w-4" />
          Add verification
        </h4>
        <button type="button" onClick={onCancel} className="p-1 text-gray-400 hover:text-gray-600 rounded">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Field selector */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Field</label>
        <select
          value={fieldId}
          onChange={(e) => setFieldId(e.target.value)}
          className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {fields.map((f) => (
            <option key={f.fieldId} value={f.fieldId}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatus(opt.value)}
              className={`px-2.5 py-1 text-xs rounded-full border font-medium transition-colors ${
                status === opt.value
                  ? opt.value === 'verified'
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : opt.value === 'needs_review'
                    ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                    : 'bg-red-100 text-red-700 border-red-300'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Evidence type */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Evidence type</label>
        <div className="flex gap-2">
          {EVIDENCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setEvidenceType(opt.value)}
              className={`px-2.5 py-1 text-xs rounded-full border font-medium transition-colors ${
                evidenceType === opt.value
                  ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Evidence payload */}
      {evidenceType === 'url' && (
        <div className="space-y-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <textarea
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="Extract or quote (optional)"
            rows={2}
            className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>
      )}
      {evidenceType === 'text' && (
        <textarea
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          placeholder="Evidence text or quote..."
          rows={3}
          className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      )}
      {evidenceType === 'file' && (
        <input
          type="text"
          value={fileRef}
          onChange={(e) => setFileRef(e.target.value)}
          placeholder="File name or reference..."
          className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      )}

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes..."
          rows={2}
          className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!fieldId || !hasPayload}
          className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save
        </button>
      </div>
    </form>
  )
}
