'use client'

import { Link2, FileText, MessageSquare, Trash2 } from 'lucide-react'
import type { Verification, VerificationStatus } from '@/lib/verifications'

const STATUS_CONFIG: Record<VerificationStatus, { label: string; className: string }> = {
  verified: { label: 'Verified', className: 'bg-green-100 text-green-700 border-green-200' },
  needs_review: { label: 'Needs review', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 border-red-200' },
}

const TYPE_ICON = {
  url: Link2,
  text: MessageSquare,
  file: FileText,
}

function formatRelativeDate(ts: number): string {
  const diff = Date.now() - ts
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(ts).toLocaleDateString()
}

interface VerificationCardProps {
  verification: Verification
  onDelete: (id: string) => void
}

export function VerificationCard({ verification, onDelete }: VerificationCardProps) {
  const status = STATUS_CONFIG[verification.status]
  const Icon = TYPE_ICON[verification.evidenceType]
  const hasMeta = Boolean(verification.tool || verification.method || verification.source)

  return (
    <div className="border border-gray-200 rounded-lg p-3 space-y-2 bg-white">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-400 shrink-0" />
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${status.className}`}>
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{formatRelativeDate(verification.createdAt)}</span>
          <button
            onClick={() => onDelete(verification.id)}
            className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors"
            aria-label="Delete verification"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {verification.value !== null && verification.value !== undefined && verification.value !== '' && (
        <div className="text-sm font-semibold text-gray-900">{verification.value}</div>
      )}

      {verification.url && (
        <a
          href={verification.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm text-indigo-600 hover:text-indigo-800 hover:underline truncate"
        >
          {verification.url.replace(/^https?:\/\//, '').substring(0, 60)}
        </a>
      )}

      {hasMeta && (
        <div className="space-y-1 text-xs text-gray-500">
          {verification.tool && (
            <div>
              <span className="font-medium text-gray-600">Tool:</span> {verification.tool}
            </div>
          )}
          {verification.method && (
            <div>
              <span className="font-medium text-gray-600">Method:</span> {verification.method}
            </div>
          )}
          {verification.source && (
            <div>
              <span className="font-medium text-gray-600">Source:</span> {verification.source}
            </div>
          )}
        </div>
      )}

      {verification.quote && (
        <blockquote className="border-l-2 border-gray-200 pl-3 text-sm text-gray-600 italic">
          {verification.quote}
        </blockquote>
      )}

      {verification.fileRef && (
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <FileText className="h-3.5 w-3.5" />
          <span className="truncate">{verification.fileRef}</span>
        </div>
      )}

      {verification.notes && (
        <p className="text-xs text-gray-500">{verification.notes}</p>
      )}
    </div>
  )
}
