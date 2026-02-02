'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { X, ArrowLeft, Plus, ShieldCheck } from 'lucide-react'
import type { TabId } from '@/lib/grid-columns'
import type { RowDetailsField } from '@/lib/row-details'
import type { Verification, VerificationStatus, EvidenceType } from '@/lib/verifications'
import {
  getVerificationsForRow,
  saveVerification,
  deleteVerification,
} from '@/lib/verifications'
import { VerificationCard } from './verification-card'
import { AddVerificationForm } from './add-verification-form'

interface VerificationPanelProps {
  open: boolean
  onClose: () => void
  tabId: TabId
  rowId: string
  rowTitle: string
  fields: RowDetailsField[]
  focusFieldId?: string
}

export function VerificationPanel({
  open,
  onClose,
  tabId,
  rowId,
  rowTitle,
  fields,
  focusFieldId,
}: VerificationPanelProps) {
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [selectedField, setSelectedField] = useState<string>(focusFieldId || '__all__')
  const [showForm, setShowForm] = useState(false)

  const reload = useCallback(() => {
    setVerifications(getVerificationsForRow(tabId, rowId))
  }, [tabId, rowId])

  useEffect(() => {
    if (open) {
      reload()
      setSelectedField(focusFieldId || '__all__')
      setShowForm(false)
    }
  }, [open, reload, focusFieldId])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const fieldOptions = useMemo(
    () => fields.filter((f) => f.fieldId).map((f) => ({ label: f.label, fieldId: f.fieldId! })),
    [fields]
  )

  const filtered = useMemo(() => {
    if (selectedField === '__all__') return verifications
    return verifications.filter((v) => v.fieldId === selectedField)
  }, [verifications, selectedField])

  // Group by fieldId
  const grouped = useMemo(() => {
    const map = new Map<string, Verification[]>()
    for (const v of filtered) {
      const arr = map.get(v.fieldId) || []
      arr.push(v)
      map.set(v.fieldId, arr)
    }
    return map
  }, [filtered])

  const handleSave = (data: {
    fieldId: string
    status: VerificationStatus
    evidenceType: EvidenceType
    url: string | null
    quote: string | null
    fileRef: string | null
    notes: string | null
  }) => {
    saveVerification({
      tabId,
      rowId,
      fieldId: data.fieldId,
      status: data.status,
      evidenceType: data.evidenceType,
      url: data.url,
      quote: data.quote,
      fileRef: data.fileRef,
      notes: data.notes,
    })
    reload()
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    deleteVerification(id)
    reload()
  }

  const fieldLabel = (fieldId: string) =>
    fieldOptions.find((f) => f.fieldId === fieldId)?.label || fieldId

  const fieldValue = (fieldId: string) => {
    const f = fields.find((f) => f.fieldId === fieldId)
    const v = f?.value
    if (v === null || v === undefined || v === '') return 'N/A'
    return String(v)
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 z-[1000] transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 z-[1001] h-full w-full sm:w-[360px] lg:w-[420px] bg-white border-l border-gray-200 shadow-2xl transition-transform duration-200 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-gray-100 px-4 py-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={onClose}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                  aria-label="Back to details"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 truncate flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    Verifications
                  </h3>
                  <p className="text-xs text-gray-500 truncate">{rowTitle}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Field filter */}
            <div className="flex items-center gap-2">
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="flex-1 text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="__all__">All fields</option>
                {fieldOptions.map((f) => (
                  <option key={f.fieldId} value={f.fieldId}>{f.label}</option>
                ))}
              </select>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {/* Add form */}
            {showForm && (
              <AddVerificationForm
                fields={fieldOptions}
                defaultFieldId={selectedField !== '__all__' ? selectedField : undefined}
                onSave={handleSave}
                onCancel={() => setShowForm(false)}
              />
            )}

            {/* Verification list */}
            {filtered.length === 0 && !showForm && (
              <div className="text-center py-12 text-gray-400">
                <ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No verifications yet</p>
                <p className="text-xs mt-1">Click "Add" to attach evidence</p>
              </div>
            )}

            {Array.from(grouped.entries()).map(([fId, items]) => (
              <div key={fId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {fieldLabel(fId)}
                    </span>
                    <span className="ml-2 text-xs text-gray-400">
                      {fieldValue(fId)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{items.length}</span>
                </div>
                {items.map((v) => (
                  <VerificationCard key={v.id} verification={v} onDelete={handleDelete} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  )
}
