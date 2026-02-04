"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Clock, History, Search, Trash2 } from 'lucide-react';
import { LogoLandingLink } from '@/components/LogoLandingLink';
import {
  clearSearchHistory,
  loadSearchHistory,
  SearchHistoryEntry,
} from '@/lib/search-history';

const formatTimestamp = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
};

export default function HistoryPage() {
  const [entries, setEntries] = useState<SearchHistoryEntry[]>([]);
  const router = useRouter();

  useEffect(() => {
    setEntries(loadSearchHistory());
  }, []);

  const handleClear = useCallback(() => {
    clearSearchHistory();
    setEntries([]);
  }, []);

  const hasEntries = entries.length > 0;
  const newestFirst = useMemo(() => entries, [entries]);

  const buildHistoryHref = useCallback((entry: SearchHistoryEntry) => {
    const params = new URLSearchParams();
    params.set('query', entry.query);
    if (entry.tab) {
      params.set('tab', entry.tab);
    }
    return `/app?${params.toString()}`;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <LogoLandingLink
                textClassName="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
              />
              <nav className="hidden md:flex gap-1">
                <Link
                  href="/app"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  New Search
                </Link>
                <span className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg flex items-center gap-2">
                  <History className="w-4 h-4" />
                  History
                </span>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/app"
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
              >
                Back to search
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Search history</h1>
              <p className="text-sm text-gray-500">
                Recent searches across all tabs. Click a query to reuse it.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClear}
              disabled={!hasEntries}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              Clear history
            </button>
          </div>

          {!hasEntries && (
            <div className="mt-8 rounded-xl border border-dashed border-gray-200 p-8 text-center">
              <p className="text-sm font-medium text-gray-600">
                No searches yet.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Run a search in the app to populate this list.
              </p>
            </div>
          )}

          {hasEntries && (
            <div className="mt-6 space-y-3">
              {newestFirst.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => router.push(buildHistoryHref(entry))}
                  className="w-full text-left rounded-xl border border-gray-200 p-4 hover:border-indigo-200 hover:bg-indigo-50/40 transition-colors"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {entry.query}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(entry.createdAt)}
                        </span>
                        {entry.tab && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                            {entry.tab}
                          </span>
                        )}
                        <span className="text-[11px] text-gray-400">
                          Open results
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigator.clipboard?.writeText(entry.query);
                      }}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Copy query
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
