'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  X,
  Search,
  Building2,
  Users,
  Newspaper,
  TrendingUp,
  FileText,
  BookOpen,
  Check,
  Send,
  Mail,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ConfigWizardModalProps {
  open: boolean;
  onClose: () => void;
  onContinue: () => void; // opens the subscribe modal
  searchQuery: string;
  resultCounts: Record<string, number>;
  previewRows: Record<string, any[]>;
}

type EntityId =
  | 'companies'
  | 'people'
  | 'news'
  | 'signals'
  | 'market'
  | 'patents'
  | 'research-papers';

type Channel = 'telegram' | 'email' | 'slack' | 'discord';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const entityOptions: { id: EntityId; label: string; icon: React.ElementType }[] = [
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'people', label: 'People', icon: Users },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'signals', label: 'Signals', icon: TrendingUp },
  { id: 'market', label: 'Market Reports', icon: FileText },
  { id: 'patents', label: 'Patents', icon: FileText },
  { id: 'research-papers', label: 'Research Papers', icon: BookOpen },
];

const channelOptions: {
  id: Channel;
  label: string;
  description: string;
  icon: React.ElementType;
  accent: 'purple' | 'emerald' | 'slate';
  disabled?: boolean;
}[] = [
  {
    id: 'email',
    label: 'Email',
    description: 'Subscribe via Substack',
    icon: Mail,
    accent: 'purple',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    description: 'Get updates from @Getniusbot',
    icon: Send,
    accent: 'emerald',
  },
  {
    id: 'slack',
    label: 'Slack',
    description: 'Coming soon',
    icon: Mail,
    accent: 'slate',
    disabled: true,
  },
  {
    id: 'discord',
    label: 'Discord',
    description: 'Coming soon',
    icon: MessageSquare,
    accent: 'slate',
    disabled: true,
  },
];

/* ------------------------------------------------------------------ */
/*  Helper: column keys for the mini preview table per entity          */
/* ------------------------------------------------------------------ */

const previewColumns: Record<string, string[]> = {
  companies: ['name', 'description', 'industry'],
  people: ['name', 'title', 'company'],
  news: ['title', 'source', 'date'],
  signals: ['title', 'type', 'date'],
  market: ['title', 'publisher', 'date'],
  patents: ['title', 'assignee', 'date'],
  'research-papers': ['title', 'authors', 'date'],
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ConfigWizardModal({
  open,
  onClose,
  onContinue,
  searchQuery,
  resultCounts,
  previewRows,
}: ConfigWizardModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  const [selectedEntities, setSelectedEntities] = useState<Set<EntityId>>(() => {
    const initial = new Set<EntityId>();
    entityOptions.forEach((e) => {
      if ((resultCounts[e.id] ?? 0) > 0) initial.add(e.id);
    });
    if (initial.size === 0) initial.add('companies');
    return initial;
  });
  const [channel, setChannel] = useState<Channel>('email');

  // Reset selections when query changes
  useEffect(() => {
    if (!open) return;
    const next = new Set<EntityId>();
    entityOptions.forEach((e) => {
      if ((resultCounts[e.id] ?? 0) > 0) next.add(e.id);
    });
    if (next.size === 0) next.add('companies');
    setSelectedEntities(next);
  }, [open, resultCounts]);

  /* Focus trap & escape */
  useEffect(() => {
    if (!open) return;
    lastActiveRef.current = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const container = dialogRef.current;
      if (!container) return;
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute('disabled'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      lastActiveRef.current?.focus();
    };
  }, [onClose, open]);

  /* ---- Mini preview rows ---- */
  const previewEntity = useMemo(() => {
    const first = Array.from(selectedEntities)[0];
    return first ?? 'companies';
  }, [selectedEntities]);

  const miniRows = useMemo(() => {
    const rows = previewRows[previewEntity] ?? [];
    return rows.slice(0, 3);
  }, [previewRows, previewEntity]);

  const miniCols = previewColumns[previewEntity] ?? ['name', 'description'];

  /* ---- Toggle helpers ---- */
  const toggleEntity = (id: EntityId) => {
    setSelectedEntities((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (!open) return null;

  const totalSelected = Array.from(selectedEntities).reduce(
    (sum, id) => sum + (resultCounts[id] ?? 0),
    0,
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        aria-label="Close configuration wizard"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        className="relative w-[94vw] max-w-[600px] rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.16)] max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="config-wizard-title"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 py-6 sm:px-8 sm:py-8">
          {/* Header */}
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500">
              Configure Updates
            </p>
            <h2
              id="config-wizard-title"
              className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl"
            >
              What do you want to track?
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Customise your free daily updates before subscribing.
            </p>
          </div>

          {/* ===== Section 1: Search query & result preview ===== */}
          <Section number={1} title="Your search">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate text-sm font-medium text-slate-800">
                {searchQuery || 'No query yet'}
              </span>
              {totalSelected > 0 && (
                <span className="ml-auto shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                  {totalSelected} result{totalSelected !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </Section>

          {/* ===== Section 2: Entity type checkboxes ===== */}
          <Section number={2} title="Entity types to monitor">
            <div className="grid grid-cols-2 gap-2">
              {entityOptions.map((entity) => {
                const Icon = entity.icon;
                const checked = selectedEntities.has(entity.id);
                const count = resultCounts[entity.id] ?? 0;
                return (
                  <button
                    key={entity.id}
                    type="button"
                    onClick={() => toggleEntity(entity.id)}
                    className={`group flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                      checked
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
                        checked
                          ? 'border-indigo-500 bg-indigo-500 text-white'
                          : 'border-slate-300 bg-white group-hover:border-slate-400'
                      }`}
                    >
                      {checked && <Check className="h-3 w-3" />}
                    </span>
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate font-medium">{entity.label}</span>
                    {count > 0 && (
                      <span className="ml-auto text-xs text-slate-400">{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* ===== Section 3: Subscribe ===== */}
          <Section number={3} title="Subscribe (Daily Updates)">
            <p className="mb-3 text-sm text-slate-600">
              Choose how you want to receive notifications.
            </p>
            <div className="grid gap-3 sm:gap-4">
              {channelOptions.map((ch) => {
                const Icon = ch.icon;
                const selected = channel === ch.id;
                const isDisabled = !!ch.disabled;
                const accent =
                  ch.accent === 'purple'
                    ? {
                        selected: 'border-purple-300 bg-purple-50/70 ring-1 ring-purple-200',
                        hover: 'hover:border-purple-300',
                        icon: 'bg-purple-100 text-purple-600',
                        chevron: 'text-slate-400 group-hover:text-purple-500',
                      }
                    : ch.accent === 'emerald'
                      ? {
                          selected: 'border-emerald-300 bg-emerald-50/70 ring-1 ring-emerald-200',
                          hover: 'hover:border-emerald-300',
                          icon: 'bg-emerald-100 text-emerald-600',
                          chevron: 'text-slate-400 group-hover:text-emerald-500',
                        }
                      : {
                          selected: 'border-slate-300 bg-slate-50 ring-1 ring-slate-200',
                          hover: 'hover:border-slate-300',
                          icon: 'bg-slate-100 text-slate-500',
                          chevron: 'text-slate-400 group-hover:text-slate-500',
                        };
                return (
                  <button
                    key={ch.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && setChannel(ch.id)}
                    className={`group flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                      isDisabled
                        ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
                        : selected
                          ? accent.selected
                          : `border-slate-200 bg-slate-50/60 ${accent.hover} hover:bg-white hover:shadow-sm`
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-full ${
                          isDisabled ? 'bg-slate-100 text-slate-300' : accent.icon
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            isDisabled ? 'text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {ch.label}
                        </p>
                        <p
                          className={`text-sm ${
                            isDisabled ? 'italic text-slate-400' : 'text-slate-600'
                          }`}
                        >
                          {ch.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`h-5 w-5 transition ${
                        isDisabled ? 'text-slate-300' : accent.chevron
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </Section>

          {/* ===== Section 4: Data preview table ===== */}
          <Section number={4} title="Data preview" noBorder>
            {miniRows.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {miniCols.map((col) => (
                        <th
                          key={col}
                          className="px-3 py-2 text-left font-semibold capitalize text-slate-500"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {miniRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`border-b border-slate-100 last:border-0 ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                        }`}
                      >
                        {miniCols.map((col) => (
                          <td
                            key={col}
                            className="max-w-[160px] truncate px-3 py-2 text-slate-700"
                          >
                            {row[col] ?? <span className="text-slate-300">--</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">
                Run a search to see a preview of tracked data.
              </div>
            )}
          </Section>

          {/* ===== CTA ===== */}
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={onContinue}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Subscribe
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section wrapper                                                    */
/* ------------------------------------------------------------------ */

function Section({
  number,
  title,
  children,
  noBorder = false,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
  noBorder?: boolean;
}) {
  return (
    <div className={`py-4 ${noBorder ? '' : 'border-b border-slate-100'}`}>
      <div className="mb-2.5 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
          {number}
        </span>
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      </div>
      {children}
    </div>
  );
}
