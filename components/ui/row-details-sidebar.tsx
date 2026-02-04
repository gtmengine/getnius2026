"use client";

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, X, ShieldCheck } from 'lucide-react';
import type { RowDetailsField, RowDetailsLink } from '@/lib/row-details';
import type { TabId } from '@/lib/grid-columns';
import { getVerificationsForField } from '@/lib/verifications';
import type { FieldVerificationSummary, VerificationStatus } from '@/lib/verifications';

interface RowDetailsSidebarProps {
  open: boolean;
  onClose: () => void;
  tabId?: TabId;
  rowId?: string;
  title: string;
  link?: RowDetailsLink;
  fields: RowDetailsField[];
  summary?: string;
  onShowVerifications?: (fieldId: string) => void;
  verificationCounts?: Record<string, FieldVerificationSummary>;
}

const formatValue = (value: RowDetailsField['value']) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  return value;
};

const STATUS_DOT: Record<VerificationStatus, string> = {
  verified: 'bg-green-500',
  needs_review: 'bg-yellow-500',
  rejected: 'bg-red-500',
};

export function RowDetailsSidebar({
  open,
  onClose,
  tabId,
  rowId,
  title,
  link,
  fields,
  summary,
  onShowVerifications,
  verificationCounts,
}: RowDetailsSidebarProps) {
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open) {
      setExpandedFields({});
      return;
    }
    setExpandedFields({});
  }, [open, rowId]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const hasSummary = Boolean(summary && summary.trim());
  const canShowVerifications = Boolean(tabId && rowId);

  const toggleField = (fieldId: string) => {
    if (!fieldId) return;
    setExpandedFields((prev) => {
      const next = { ...prev, [fieldId]: !prev[fieldId] };
      if (next[fieldId]) {
        onShowVerifications?.(fieldId);
      }
      return next;
    });
  };

  const handleVerifyAll = () => {
    if (!canShowVerifications) return;
    const next: Record<string, boolean> = {};
    fields.forEach((field) => {
      if (!field.fieldId) return;
      next[field.fieldId] = true;
      onShowVerifications?.(field.fieldId);
    });
    setExpandedFields(next);
  };

  const fieldVerifications = useMemo(() => {
    if (!tabId || !rowId) return {};
    const map: Record<string, ReturnType<typeof getVerificationsForField>> = {};
    fields.forEach((field) => {
      if (!field.fieldId) return;
      map[field.fieldId] = getVerificationsForField(tabId, rowId, field.fieldId);
    });
    return map;
  }, [fields, tabId, rowId, verificationCounts]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 z-[998] transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed top-0 right-0 z-[999] h-full w-full sm:w-[360px] lg:w-[420px] bg-white border-l border-gray-200 shadow-2xl transition-transform duration-200 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-4 py-4">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {title || 'Details'}
              </h3>
              {link?.href && (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-sm text-indigo-600 hover:text-indigo-800 hover:underline truncate"
                >
                  {link.label || link.href}
                </a>
              )}
            </div>
            <div className="flex items-center gap-2">
              {canShowVerifications && (
                <button
                  onClick={handleVerifyAll}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verify
                </button>
              )}
              <button
                onClick={onClose}
                aria-label="Close details panel"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
            {fields.length > 0 && (
              <dl className="space-y-3">
                {fields.map((field, index) => {
                  const counts = field.fieldId && verificationCounts
                    ? verificationCounts[field.fieldId]
                    : undefined;

                  return (
                    <div
                      key={`${field.label}-${index}`}
                      className="grid grid-cols-3 gap-3 border-b border-gray-100 pb-3 last:border-b-0"
                    >
                      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {field.label}
                      </dt>
                      <dd className="col-span-2 text-sm text-gray-900 break-words">
                        <div className="flex items-start justify-between gap-1">
                          <span>{formatValue(field.value)}</span>
                          {field.fieldId && onShowVerifications && canShowVerifications && (
                            <button
                              onClick={() => toggleField(field.fieldId!)}
                              className="shrink-0 flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 transition-colors"
                              title={expandedFields[field.fieldId] ? 'Hide verifications' : 'Show verifications'}
                            >
                              {counts && counts.count > 0 && counts.bestStatus && (
                                <>
                                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${STATUS_DOT[counts.bestStatus]}`} />
                                  <span className="text-gray-500">{counts.count}</span>
                                </>
                              )}
                              <ShieldCheck className="h-3.5 w-3.5" />
                              {expandedFields[field.fieldId] ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                        {field.fieldId && expandedFields[field.fieldId] && (
                          <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-2">
                            {(fieldVerifications[field.fieldId] || []).length === 0 && (
                              <p className="text-xs text-gray-400">No verifications yet.</p>
                            )}
                            {(fieldVerifications[field.fieldId] || []).map((verification, idx) => (
                              <div key={verification.id ?? idx} className="text-xs text-gray-600 space-y-1">
                                {verification.value && (
                                  <div className="font-semibold text-gray-800">{verification.value}</div>
                                )}
                                <div className="space-y-0.5">
                                  {verification.tool && (
                                    <div>
                                      <span className="font-medium text-gray-500">Tool:</span> {verification.tool}
                                    </div>
                                  )}
                                  {verification.method && (
                                    <div>
                                      <span className="font-medium text-gray-500">Method:</span> {verification.method}
                                    </div>
                                  )}
                                  {verification.source && (
                                    <div>
                                      <span className="font-medium text-gray-500">Source:</span> {verification.source}
                                    </div>
                                  )}
                                </div>
                                {verification.url && (
                                  <a
                                    href={verification.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:text-indigo-800 hover:underline"
                                  >
                                    {verification.url.replace(/^https?:\/\//, '').substring(0, 60)}
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            )}

            {hasSummary && (
              <div className="pt-2 border-t border-gray-100">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Summary
                </h4>
                <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                  {summary}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
