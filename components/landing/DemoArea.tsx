'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RowDetailsSidebar } from '@/components/ui/row-details-sidebar';
import { PaywallModal } from '@/components/landing/PaywallModal';
import {
  assertDemoTabs,
  demoTabs,
  getDemoTabById,
  type DemoTabId,
} from '@/lib/demo-mocks';

interface DemoAreaProps {
  defaultQuery?: string;
  activeDemoTabId: DemoTabId;
  onTabChange: (tabId: DemoTabId) => void;
  focusSearch?: boolean;
  onSearchFocused?: () => void;
}

export function DemoArea({
  defaultQuery = 'MENA fintech leaders with recent funding',
  activeDemoTabId,
  onTabChange,
  focusSearch = false,
  onSearchFocused,
}: DemoAreaProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Record<string, string | number> | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    assertDemoTabs(demoTabs);
  }, []);

  useEffect(() => {
    if (!focusSearch) return;
    if (!searchInputRef.current) return;
    searchInputRef.current.focus();
    searchInputRef.current.select();
    onSearchFocused?.();
  }, [focusSearch, onSearchFocused]);

  useEffect(() => {
    setSelectedRow(null);
    setSelectedRowId(null);
  }, [activeDemoTabId]);

  useEffect(() => {
    if (!searchCount) return;
    const timer = setTimeout(() => setShowPaywall(true), 7000);
    return () => clearTimeout(timer);
  }, [searchCount]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setSelectedRow(null);
      setShowPaywall(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = () => {
    setSelectedRow(null);
    setSelectedRowId(null);
    setShowPaywall(false);
    setIsSearching(true);
    setHasSearched(true);
    setSearchCount((prev) => prev + 1);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setIsSearching(false);
    }, 650);
  };

  const activeTab = useMemo(() => getDemoTabById(activeDemoTabId), [activeDemoTabId]);
  const sidebarModel = useMemo(() => {
    if (!selectedRow) return null;
    return activeTab.getSidebarModel(selectedRow);
  }, [activeTab, selectedRow]);

  const handleRowSelect = (row: Record<string, string | number>) => {
    setSelectedRowId(String(row.id));
  };

  const handleOpenRow = (row: Record<string, string | number>) => {
    setSelectedRow(row);
  };

  return (
    <div className="min-h-[420px] rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Interactive demo</h3>
            <p className="text-sm text-slate-500">{activeTab.description}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" />
            {activeTab.label}
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              ref={searchInputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${activeTab.label.toLowerCase()}...`}
              className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <Button onClick={handleSearch} className="h-11 px-6">
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
        {activeTab.chips ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {activeTab.chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
              >
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="px-6 py-5">
        {!hasSearched ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
            <p className="text-sm font-semibold text-slate-700">Run your first demo search</p>
            <p className="mt-2 text-xs text-slate-500">
              The demo will load results for the {activeTab.label} example.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    {activeTab.columns.map((column) => (
                      <th key={column.key} className="px-4 py-3">
                        {column.label}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeTab.rows.map((row) => (
                    <tr
                      key={String(row.id)}
                      className={`hover:bg-slate-50 ${selectedRowId === row.id ? 'bg-slate-50' : ''}`}
                      onClick={() => handleRowSelect(row)}
                    >
                      {activeTab.columns.map((column) => (
                        <td key={column.key} className="px-4 py-3 text-slate-600">
                          {String(row[column.key] ?? '')}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleOpenRow(row);
                          }}
                        >
                          Open
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {demoTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                tab.id === activeDemoTabId
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-500 hover:border-indigo-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <RowDetailsSidebar
        open={Boolean(selectedRow)}
        onClose={() => setSelectedRow(null)}
        title={sidebarModel?.title ?? 'Details'}
        link={sidebarModel?.link}
        fields={sidebarModel?.fields ?? []}
        summary={sidebarModel?.summary}
      />
      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  );
}
