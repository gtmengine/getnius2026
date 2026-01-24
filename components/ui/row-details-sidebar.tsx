"use client";

import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { RowDetailsField, RowDetailsLink } from '@/lib/row-details';

interface RowDetailsSidebarProps {
  open: boolean;
  onClose: () => void;
  title: string;
  link?: RowDetailsLink;
  fields: RowDetailsField[];
  summary?: string;
}

const formatValue = (value: RowDetailsField['value']) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  return value;
};

export function RowDetailsSidebar({
  open,
  onClose,
  title,
  link,
  fields,
  summary,
}: RowDetailsSidebarProps) {
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
            <button
              onClick={onClose}
              aria-label="Close details panel"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
            {fields.length > 0 && (
              <dl className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={`${field.label}-${index}`}
                    className="grid grid-cols-3 gap-3 border-b border-gray-100 pb-3 last:border-b-0"
                  >
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {field.label}
                    </dt>
                    <dd className="col-span-2 text-sm text-gray-900 break-words">
                      {formatValue(field.value)}
                    </dd>
                  </div>
                ))}
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
