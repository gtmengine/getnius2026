'use client'

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Upload, 
  Building2, 
  Users, 
  Newspaper, 
  TrendingUp, 
  FileText, 
  BookOpen, 
  Bell, 
  Settings, 
  History, 
  Bookmark, 
  RefreshCw,
  Check,
  X,
  Sparkles,
  Trash2,
  Copy,
  Download,
  Plus
} from 'lucide-react';
import { AgGridWrapper, AgGridWrapperRef } from '@/components/ui/ag-grid-wrapper';
import { AddColumnModal } from '@/components/modals/AddColumnModal';
import { AddRowModal } from '@/components/modals/AddRowModal';
import { columnDefsMap, getExportColumnsForTab, TabId, tabConfigs } from '@/lib/grid-columns';
import { ColDef } from 'ag-grid-community';
import {
  ColumnKind,
  EnrichmentColumnConfig,
  StoredColumnDef,
  loadStoredColumnDefs,
  saveStoredColumnDefs,
  saveStoredRowData,
} from '@/lib/dynamicSchema';
import { searchWithGoogle } from '@/lib/search-apis';
import { normalizeCseItems } from '@/lib/google/normalize';
import { downloadCSV, toCSV } from '@/lib/csv';
import { PaywallModal } from '@/components/paywall/PaywallModal';
import { SubscribeModal } from '@/components/paywall/SubscribeModal';
import { AuthModal } from '@/components/paywall/AuthModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { RowDetailsSidebar } from '@/components/ui/row-details-sidebar';
import { mapRowToSidebarModel } from '@/lib/row-details';
import { buildMockRowsForTab } from '@/lib/mock-search';

// Icon map for tabs
const iconMap = {
  'building': Building2,
  'users': Users,
  'newspaper': Newspaper,
  'trending-up': TrendingUp,
  'file-text': FileText,
  'book-open': BookOpen,
};

type CustomColDef = ColDef & {
  __isCustom?: true;
  columnType?: ColumnKind;
};

const BadgeRenderer = (params: any) => {
  const value = params.value || '';
  if (!value) return <span className="text-gray-400">N/A</span>;
  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
      {value}
    </span>
  );
};

const LinkRenderer = (params: any) => {
  const url = params.value;
  if (!url) return <span className="text-gray-400">N/A</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block truncate text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
      onClick={(event) => event.stopPropagation()}
    >
      {url}
    </a>
  );
};

const EmailRenderer = (params: any) => {
  const value = params.value;
  if (!value) return <span className="text-gray-400">N/A</span>;
  return (
    <a
      href={`mailto:${value}`}
      className="block truncate text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
      onClick={(event) => event.stopPropagation()}
    >
      {value}
    </a>
  );
};

const numberValueParser = (params: any) => {
  const value = params.newValue ?? params.value;
  if (value === '' || value === null || value === undefined) return '';
  const parsed = Number(value);
  return Number.isNaN(parsed) ? '' : parsed;
};

const mergeColumns = (baseColumns: ColDef[], customColumns: ColDef[]) => {
  const actionsIndex = baseColumns.findIndex((col) => col.field === 'actions');
  if (actionsIndex === -1) {
    return [...baseColumns, ...customColumns];
  }
  return [
    ...baseColumns.slice(0, actionsIndex),
    ...customColumns,
    ...baseColumns.slice(actionsIndex),
  ];
};

const toStoredColumns = (columns: ColDef[]) =>
  columns
    .filter((col) => (col as CustomColDef).__isCustom && col.field)
    .map((col) => {
      const custom = col as CustomColDef;
      return {
        headerName: col.headerName || '',
        field: col.field || '',
        type: custom.columnType || 'text',
        width: col.width,
        minWidth: col.minWidth,
        flex: col.flex || undefined,
      } satisfies StoredColumnDef;
    });

const buildCustomColumnDef = (stored: StoredColumnDef): CustomColDef => {
  const base: CustomColDef = {
    field: stored.field,
    headerName: stored.headerName,
    editable: true,
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: stored.minWidth ?? 140,
    width: stored.width,
    flex: stored.flex,
    __isCustom: true,
    columnType: stored.type,
  };

  if (stored.type === 'number') {
    base.type = 'number';
    base.cellClass = 'text-right';
    base.valueParser = numberValueParser;
  }

  if (stored.type === 'badge') {
    base.cellRenderer = BadgeRenderer;
  }

  if (stored.type === 'link') {
    base.cellRenderer = LinkRenderer;
  }

  if (stored.type === 'url') {
    base.cellRenderer = LinkRenderer;
  }

  if (stored.type === 'email') {
    base.cellRenderer = EmailRenderer;
  }

  return base;
};

const getDataColumns = (columns: ColDef[]) =>
  columns.filter(
    (col) =>
      Boolean(col.field) &&
      col.colId !== 'select' &&
      col.field !== 'actions' &&
      !col.hide
  );

const getAllColumnFields = (columns: ColDef[]) =>
  columns
    .map((col) => col.field)
    .filter((field): field is string => Boolean(field));

const getDefaultValueForType = (type: ColumnKind) => {
  if (type === 'number') return '';
  if (type === 'checkbox') return false;
  if (type === 'multi-select') return [];
  return '';
};

const SEARCH_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const SEARCH_COOLDOWN_MS = 30 * 60 * 1000;
const IS_MOCK_SEARCH_MODE = (process.env.NEXT_PUBLIC_SEARCH_MODE ?? 'mock') !== 'google';
const MOCK_ROW_COUNT = 50;

type SearchErrorPayload = {
  error?: "quota_exceeded" | "google_cse_error" | string;
  status?: number;
};

const normalizeSearchQuery = (value: string) => value.trim().toLowerCase();
const makeSearchCacheKey = (tab: TabId, value: string) =>
  `${tab}::${normalizeSearchQuery(value)}`;

// ============================================================================
// SearchHeader Component
// ============================================================================
interface SearchHeaderProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  isSearching: boolean;
  isCooldown: boolean;
}

function SearchHeader({ query, onQueryChange, onSearch, isSearching, isCooldown }: SearchHeaderProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching && !isCooldown) {
      onSearch();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input & Button */}
        <div className="flex-1 flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your target market, e.g. 'AI meeting transcription tools for enterprises'"
              className="w-full pl-12 pr-4 py-3.5 text-base border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={onSearch}
            disabled={isSearching || isCooldown || !query.trim()}
            className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-indigo-400 disabled:to-indigo-400 text-white rounded-xl font-semibold flex items-center gap-2.5 transition-all shadow-sm hover:shadow-md disabled:cursor-not-allowed min-w-[140px] justify-center"
          >
            {isSearching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Search</span>
              </>
            )}
          </button>
        </div>
        
        {/* Upload CSV Block */}
        <div className="flex items-center gap-3 lg:border-l lg:pl-4 border-gray-200">
          <div className="text-sm text-gray-500 hidden md:block">or</div>
          <button className="px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/50 transition-all flex items-center gap-2 text-gray-600 hover:text-indigo-600">
            <Upload className="w-4 h-4" />
            <span className="font-medium">Upload CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CategoryTabs Component
// ============================================================================
interface CategoryTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  resultCounts: Record<TabId, number>;
}

function CategoryTabs({ activeTab, onTabChange, resultCounts }: CategoryTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {tabConfigs.map((tab) => {
        const Icon = iconMap[tab.icon as keyof typeof iconMap];
        const isActive = activeTab === tab.id;
        const count = resultCounts[tab.id] || 0;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all
              ${isActive 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {count > 0 && (
              <span className={`
                px-2 py-0.5 rounded-full text-xs font-semibold
                ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}
              `}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// ResultsToolbar Component
// ============================================================================
interface ResultsToolbarProps {
  selectedCount: number;
  onMatch: () => void;
  onNotMatch: () => void;
  onFindLookalikes: () => void;
  onEnrich: () => void;
  onDelete: () => void;
  onAddColumn: () => void;
  onAddRow: () => void;
  onExport: () => void;
  activeTab: TabId;
  significanceMin: number;
  relevanceMin: number;
  trustMin: number;
  onSignificanceChange: (value: number) => void;
  onRelevanceChange: (value: number) => void;
  onTrustChange: (value: number) => void;
  paintMode: 'match' | 'not-match' | null;
}

function ResultsToolbar({ 
  selectedCount, 
  onMatch, 
  onNotMatch, 
  onFindLookalikes, 
  onEnrich, 
  onDelete,
  onAddColumn,
  onAddRow,
  onExport,
  activeTab,
  significanceMin,
  relevanceMin,
  trustMin,
  onSignificanceChange,
  onRelevanceChange,
  onTrustChange,
  paintMode
}: ResultsToolbarProps) {
  const hasSelection = selectedCount > 0;
  const isMatchPaintActive = paintMode === 'match';
  const isNotMatchPaintActive = paintMode === 'not-match';
  
  return (
    <div className="flex flex-col gap-2 py-3 px-1">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          {/* Match / Not Match toggles - Paint Mode */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={onMatch}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all hover:bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 ${
                isMatchPaintActive 
                  ? 'bg-green-100 text-green-800 shadow-sm border-2 border-green-500' 
                  : 'text-green-700'
              }`}
              aria-label={isMatchPaintActive ? 'Paint mode active: Click cells to mark as Match' : 'Activate Match paint mode'}
              aria-pressed={isMatchPaintActive}
            >
              <Check className="w-3.5 h-3.5" />
              Match
            </button>
            <button
              onClick={onNotMatch}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all hover:bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 ${
                isNotMatchPaintActive 
                  ? 'bg-red-100 text-red-800 shadow-sm border-2 border-red-500' 
                  : 'text-red-600'
              }`}
              aria-label={isNotMatchPaintActive ? 'Paint mode active: Click cells to mark as Not Match' : 'Activate Not Match paint mode'}
              aria-pressed={isNotMatchPaintActive}
            >
              <X className="w-3.5 h-3.5" />
              Not Match
            </button>
          </div>
        
          <div className="h-6 w-px bg-gray-200 mx-1" />
        
          {/* Action Buttons */}
          <button
            onClick={onFindLookalikes}
            disabled={!hasSelection}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
            aria-label={`Find lookalikes for ${selectedCount} selected rows`}
            aria-disabled={!hasSelection}
          >
            <Copy className="w-3.5 h-3.5" />
            Find Lookalikes
          </button>

          <button
            onClick={onEnrich}
            disabled={!hasSelection}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
            aria-label={`Enrich ${selectedCount} selected rows`}
            aria-disabled={!hasSelection}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Enrich
          </button>

          <button
            onClick={onDelete}
            disabled={!hasSelection}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
            aria-label={`Delete ${selectedCount} selected rows`}
            aria-disabled={!hasSelection}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>

          <div className="h-6 w-px bg-gray-200 mx-1" />

          {/* Data Management Buttons */}
          <button
            onClick={onAddColumn}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Column
          </button>

          <button
            onClick={onAddRow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Row
          </button>

        </div>
        <div className="ml-auto flex items-center justify-end gap-3 min-w-0 flex-wrap lg:flex-nowrap">
          {/* News Filters - only show for news tab */}
          {activeTab === 'news' && (
            <>
              <div className="h-6 w-px bg-gray-200 mx-1 self-center" />
              <div className="flex flex-wrap items-center gap-3 justify-end lg:flex-nowrap">
                {/* Significance Slider */}
                <div className="flex flex-col gap-1 w-[220px] min-w-[200px]">
                  <label htmlFor="significance-min" className="text-xs text-gray-600 font-medium leading-tight">
                    Significance min {significanceMin.toFixed(1)}
                  </label>
                  <input
                    id="significance-min"
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={significanceMin}
                    onChange={(e) => onSignificanceChange(parseFloat(e.target.value))}
                    aria-label="Significance minimum"
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                  />
                </div>

                {/* Relevance Slider */}
                <div className="flex flex-col gap-1 w-[220px] min-w-[200px]">
                  <label htmlFor="relevance-min" className="text-xs text-gray-600 font-medium leading-tight">
                    Relevance min {relevanceMin.toFixed(1)}
                  </label>
                  <input
                    id="relevance-min"
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={relevanceMin}
                    onChange={(e) => onRelevanceChange(parseFloat(e.target.value))}
                    aria-label="Relevance minimum"
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                  />
                </div>

                {/* Trust Score Slider */}
                <div className="flex flex-col gap-1 w-[220px] min-w-[200px]">
                  <label htmlFor="trust-min" className="text-xs text-gray-600 font-medium leading-tight">
                    Trust Score min {trustMin.toFixed(1)}
                  </label>
                  <input
                    id="trust-min"
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={trustMin}
                    onChange={(e) => onTrustChange(parseFloat(e.target.value))}
                    aria-label="Trust score minimum"
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex items-center gap-3 shrink-0">
            {hasSelection && (
              <span className="text-sm text-gray-500 font-medium">
                {selectedCount} selected
              </span>
            )}
            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ResultsPanel Component
// ============================================================================
interface ResultsPanelProps {
  activeTab: TabId;
  results: Record<TabId, any[]>;
  isSearching: boolean;
  selectedRows: any[];
  onSelectionChanged: (rows: any[]) => void;
  onCellValueChanged: (event: any) => void;
  onAddColumn: () => void;
  onAddRow: () => void;
  onMatch: () => void;
  onNotMatch: () => void;
  onExport: () => void;
  columnDefsByTab: Record<TabId, ColDef[]>;
  onColumnHeaderDoubleClick: (columnField: string, currentName: string) => void;
  setSelectedRows: React.Dispatch<React.SetStateAction<any[]>>;
  setRowDataByTab: React.Dispatch<React.SetStateAction<Record<TabId, any[]>>>;
  setSearchProgress: React.Dispatch<React.SetStateAction<string | null>>;
  isContinuousSearchActiveRef: React.MutableRefObject<boolean>;
  gridRef: React.RefObject<AgGridWrapperRef | null>;
  significanceMin: number;
  relevanceMin: number;
  trustMin: number;
  onSignificanceChange: (value: number) => void;
  onRelevanceChange: (value: number) => void;
  onTrustChange: (value: number) => void;
  getRowClass?: (params: any) => string;
  searchProgress?: string | null;
  emptyMessage: string;
  onCellClicked?: (event: any) => void;
  onOpenRow?: (row: any) => void;
  paintMode: 'match' | 'not-match' | null;
}

function ResultsPanel({ 
  activeTab, 
  results, 
  isSearching, 
  selectedRows,
  onSelectionChanged,
  onCellValueChanged,
  onCellClicked,
  onAddColumn,
  onAddRow,
  onMatch,
  onNotMatch,
  onExport,
  columnDefsByTab,
  onColumnHeaderDoubleClick,
  setSelectedRows,
  setRowDataByTab,
  setSearchProgress,
  isContinuousSearchActiveRef,
  gridRef,
  significanceMin,
  relevanceMin,
  trustMin,
  onSignificanceChange,
  onRelevanceChange,
  onTrustChange,
  getRowClass,
  searchProgress,
  emptyMessage,
  onOpenRow,
  paintMode
}: ResultsPanelProps) {
  const columnDefs = useMemo(() => {
    return columnDefsByTab[activeTab] || [];
  }, [activeTab, columnDefsByTab]);
  const rowData = useMemo(() => results[activeTab] || [], [results, activeTab]);
  
  
  // Generate 3-8 derived search queries from selected news rows
  const generateNewsSearchQueries = useCallback((selectedRows: any[]): string[] => {
    const queries: string[] = [];
    const fingerprints: Array<{title: string, snippet: string, company: string, source: string}> = [];

    // Extract fingerprints from selected rows
    selectedRows.forEach(row => {
      fingerprints.push({
        title: row.title || '',
        snippet: row.summary || row.snippet || '',
        company: row.company || '',
        source: row.source || ''
      });
    });

    // Generate derived queries deterministically
    const companies = [...new Set(fingerprints.map(fp => fp.company).filter(c => c))];
    const sources = [...new Set(fingerprints.map(fp => fp.source).filter(s => s))];

    // Query 1: Company-focused search
    if (companies.length > 0) {
      queries.push(`${companies.join(' OR ')} news`);
    }

    // Query 2: Source-focused search
    if (sources.length > 0) {
      queries.push(`${sources.join(' OR ')} articles`);
    }

    // Query 3: Combined company + key terms from titles
    const titleKeywords = fingerprints
      .flatMap(fp => fp.title.split(' '))
      .filter(word => word.length > 3) // Filter out short words
      .filter(word => !['news', 'update', 'report', 'announces', 'launches', 'reveals', 'says'].includes(word.toLowerCase()))
      .slice(0, 5); // Take top 5 keywords

    if (companies.length > 0 && titleKeywords.length > 0) {
      queries.push(`${companies[0]} ${titleKeywords.slice(0, 3).join(' ')} news`);
    }

    // Query 4: Snippet-based search (extract key phrases)
    const snippetKeywords = fingerprints
      .flatMap(fp => fp.snippet.split(' '))
      .filter(word => word.length > 4)
      .filter(word => !word.includes('http'))
      .slice(0, 4);

    if (snippetKeywords.length > 0) {
      queries.push(`${snippetKeywords.join(' ')} business news`);
    }

    // Query 5: Company + source combination
    if (companies.length > 0 && sources.length > 0) {
      queries.push(`${companies[0]} ${sources[0]} news`);
    }

    // Query 6: Recent news about companies
    if (companies.length > 1) {
      queries.push(`${companies.slice(0, 2).join(' ')} latest news`);
    }

    // Query 7: Industry context
    const industryTerms = ['startup', 'funding', 'investment', 'acquisition', 'partnership', 'expansion', 'growth'];
    if (companies.length > 0) {
      queries.push(`${companies[0]} ${industryTerms[Math.floor(Math.random() * industryTerms.length)]} news`);
    }

    // Query 8: Broader market context
    if (companies.length > 0) {
      queries.push(`${companies[0]} market news`);
    }

    // Ensure we have at least 3 queries and at most 8
    const finalQueries = queries.slice(0, 8);
    return finalQueries.length >= 3 ? finalQueries : queries.slice(0, Math.max(3, queries.length));
  }, []);

  const handleFindLookalikes = useCallback(async (selectedRows: any[], setResultsFn: React.Dispatch<React.SetStateAction<Record<TabId, any[]>>>, results: Record<TabId, any[]>, activeTab: TabId, setSelectedRows: React.Dispatch<React.SetStateAction<any[]>>) => {
    console.log('Finding lookalikes for:', selectedRows);

    if (selectedRows.length === 0) {
      console.log('No rows selected, returning early');
      return;
    }

    // Toggle continuous search mode
    if (isContinuousSearchActiveRef.current) {
      console.log('Stopping continuous search');
      isContinuousSearchActiveRef.current = false;
      setSearchProgress(null);
      return;
    }

    // Perform the lookalikes search functionality
    // Generate search queries based on selected rows for all tabs except news
    let searchQueries: string[] = [];

    try {
      if (activeTab !== 'news') {
        switch (activeTab) {
          case 'companies':
            // Use company names and descriptions as search terms
            const companyQuery = selectedRows.map(row =>
              `${row.name} ${row.description}`.substring(0, 100)
            ).join(' OR ');
            searchQueries = [companyQuery];
            break;

          case 'people':
            // Use person names, roles, and companies
            const peopleQuery = selectedRows.map(row =>
              `${row.name} ${row.role} ${row.company}`.substring(0, 100)
            ).join(' OR ');
            searchQueries = [peopleQuery];
            break;

          case 'signals':
            // Use signal descriptions and companies
            const signalsQuery = selectedRows.map(row =>
              `${row.description} ${row.company}`.substring(0, 100)
            ).join(' OR ');
            searchQueries = [signalsQuery];
            break;

          default:
            // Fallback for other tabs
            const fallbackQuery = selectedRows.map(row =>
              Object.values(row).filter(val => typeof val === 'string').join(' ')
            ).join(' OR ');
            searchQueries = [fallbackQuery];
        }

        if (searchQueries.length === 0 || searchQueries.every(q => !q.trim())) {
          console.warn('No search queries could be generated from selected rows');
          setSelectedRows([]);
          return;
        }

        console.log(`Searching for similar ${activeTab} based on selected examples:`, searchQueries);

        // Run multiple search queries and combine results with progress
        const allSearchResults: any[] = [];
        let completedQueries = 0;

        for (let i = 0; i < searchQueries.length; i++) {
          const query = searchQueries[i];
          if (query.trim()) {
            try {
              setSearchProgress(`Searching lookalikes (${completedQueries + 1}/${searchQueries.length} queries)...`);
              const results = await searchWithGoogle(query.trim());
              allSearchResults.push(...results);
              completedQueries++;
            } catch (error) {
              console.warn(`Search failed for query "${query}":`, error);
              completedQueries++;
            }
          }
        }

        setSearchProgress(null); // Clear progress when done

        const searchResults = allSearchResults;

        // Transform and append results
        setResultsFn(prevResults => {
          const newResults = { ...prevResults };
          const existingData = [...newResults[activeTab]];

          // Transform API results based on tab type
          let transformedResults: any[] = [];

          if (activeTab === 'companies') {
            transformedResults = searchResults.map((company: any, index: number) => ({
              id: company.id || `company-match-${Date.now()}-${index}`,
              name: company.name,
              description: company.description,
              location: company.location || 'N/A',
              founded: company.founded || 'N/A',
              employees: company.employees || 'N/A',
              status: company.status === 'validated' ? 'Active' : 'Pending',
              revenue: company.funding || 'N/A',
              people: 0,
              news: 0,
              matchStatus: null,
              newlyAdded: true
            }));
          } else if (activeTab === 'people') {
            transformedResults = searchResults.map((person: any, index: number) => ({
              id: person.id || `person-match-${Date.now()}-${index}`,
              name: person.name,
              company: person.company,
              role: person.role,
              location: person.location || 'N/A',
              email: person.email || 'N/A',
              matchStatus: null,
              intents: 0,
              newlyAdded: true
            }));
          }

          // Add transformed results to existing data
          newResults[activeTab] = [...existingData, ...transformedResults];
          return newResults;
        });

        // Clear newlyAdded flag after a delay for visual feedback
        setTimeout(() => {
          setResultsFn(prevResults => {
            const updatedResults = { ...prevResults };
            const tabData = [...updatedResults[activeTab]];
            tabData.forEach(row => {
              if (row.newlyAdded) {
                delete row.newlyAdded;
              }
            });
            updatedResults[activeTab] = tabData;
            return updatedResults;
          });
        }, 3000);

      }
    } catch (error) {
      console.error('Error finding lookalikes:', error);
      // Fallback to just marking selected rows as matches
      setResultsFn(prevResults => {
        const newResults = { ...prevResults };
        const tabData = [...newResults[activeTab]];

        selectedRows.forEach(selectedRow => {
          const rowIndex = tabData.findIndex(row => row.id === selectedRow.id);
          if (rowIndex !== -1) {
            tabData[rowIndex] = { ...tabData[rowIndex], matchStatus: 'match' as const };
          }
        });

        newResults[activeTab] = tabData;
        return newResults;
      });
    }

    if (activeTab === 'news' && selectedRows.length > 0) {
      console.log('Starting continuous news lookalikes search');
      isContinuousSearchActiveRef.current = true;

      // Extract fingerprints and generate base queries deterministically
      const fingerprints: Array<{title: string, snippet: string, company: string, source: string}> = [];

      // Extract fingerprints from selected rows
      selectedRows.forEach(row => {
        fingerprints.push({
          title: row.title || '',
          snippet: row.summary || row.snippet || '',
          company: row.company || '',
          source: row.source || ''
        });
      });

      const companies = [...new Set(fingerprints.map(fp => fp.company).filter(c => c))];
      const sources = [...new Set(fingerprints.map(fp => fp.source).filter(s => s))];

      // Generate base queries
      const baseQueries: string[] = [];
      if (companies.length > 0) baseQueries.push(`${companies.join(' OR ')} news`);
      if (sources.length > 0) baseQueries.push(`${sources.join(' OR ')} articles`);
      if (companies.length > 0) baseQueries.push(`${companies[0]} latest news`);
      if (companies.length > 0) baseQueries.push(`${companies[0]} investment news`);
      if (companies.length > 0) baseQueries.push(`${companies[0]} market news`);

      let searchCycle = 0;

      // Continuous search loop
      const runContinuousSearch = async () => {
        if (!isContinuousSearchActiveRef.current) {
          console.log('Continuous search stopped');
          setSearchProgress(null);
          return;
        }

        searchCycle++;
        console.log(`Continuous search cycle ${searchCycle} started`);

        // Generate dynamic queries with variations for each cycle
        const queries = [...baseQueries];

        // Add cycle-specific variations
        const industryTerms = ['startup', 'funding', 'investment', 'acquisition', 'partnership', 'expansion', 'growth', 'IPO', 'valuation', 'revenue'];
        const timeTerms = ['today', 'this week', 'recent', 'breaking', 'update', 'announcement'];

        if (companies.length > 0) {
          // Add industry-specific queries
          const industryTerm = industryTerms[(searchCycle - 1) % industryTerms.length];
          queries.push(`${companies[0]} ${industryTerm} news`);

          // Add time-specific queries
          const timeTerm = timeTerms[(searchCycle - 1) % timeTerms.length];
          queries.push(`${companies[0]} ${timeTerm} news`);
        }

        // Ensure we have queries and deduplicate
        const uniqueQueries = [...new Set(queries)].filter(q => q.trim()).slice(0, 6);

        if (uniqueQueries.length === 0) {
          console.warn('No search queries available');
          isContinuousSearchActiveRef.current = false;
          setSearchProgress(null);
          return;
        }

        setSearchProgress(`Continuous search cycle ${searchCycle} - ${uniqueQueries.length} queries...`);

        // Run search queries for this cycle
        const allSearchResults: any[] = [];
        let completedQueries = 0;

        for (let i = 0; i < uniqueQueries.length; i++) {
          if (!isContinuousSearchActiveRef.current) break; // Check if stopped

          const query = uniqueQueries[i];
          setSearchProgress(`Cycle ${searchCycle}: ${completedQueries + 1}/${uniqueQueries.length} queries...`);

          try {
            console.log(`Searching: "${query}"`);
            const searchResults = await searchWithGoogle(query.trim());
            allSearchResults.push(...searchResults);
            completedQueries++;
          } catch (error) {
            console.warn(`Search failed for query "${query}":`, error);
            completedQueries++;
          }

          // Small delay between queries to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Transform and deduplicate results
        const existingTitles = new Set(results[activeTab].map(row => row.title));
        const uniqueResults = allSearchResults.filter(result => {
          const title = result.title || result.headline || '';
          return title && title.length > 10 && !existingTitles.has(title);
        });

        // Transform and append results
        const transformedResults = uniqueResults.slice(0, 10).map((newsItem: any, index: number) => ({
          id: newsItem.id || `news-continuous-${Date.now()}-${searchCycle}-${index}`,
          title: newsItem.title || newsItem.headline || '',
          summary: newsItem.summary || newsItem.snippet || newsItem.description || '',
          company: newsItem.company || companies[0] || '',
          source: newsItem.source || newsItem.publisher || '',
          date: newsItem.date || newsItem.publishedAt || new Date().toISOString(),
          url: newsItem.url || '',
          status: 'New',
          matchStatus: 'match' as const,
          significance_score: Math.round((Math.random() * 4 + 6) * 10) / 10,
          relevance_score: Math.round((Math.random() * 3 + 7) * 10) / 10,
          newlyAdded: true,
          continuousSearchCycle: searchCycle // Track which cycle added this
        }));

        if (transformedResults.length > 0) {
          setResultsFn(prevResults => {
            const newResults = { ...prevResults };
            newResults[activeTab] = [...newResults[activeTab], ...transformedResults];
            console.log(`Cycle ${searchCycle}: Added ${transformedResults.length} new news items`);
            return newResults;
          });

          // Clear newlyAdded flag after 3 seconds
          setTimeout(() => {
            setResultsFn(prevResults => {
              const updatedResults = { ...prevResults };
              const tabData = [...updatedResults[activeTab]];
              tabData.forEach(row => {
                if (row.newlyAdded && row.continuousSearchCycle === searchCycle) {
                  delete row.newlyAdded;
                  delete row.continuousSearchCycle;
                }
              });
              updatedResults[activeTab] = tabData;
              return updatedResults;
            });
          }, 3000);
        }

        // Continue to next cycle if still active
        if (isContinuousSearchActiveRef.current) {
          // Wait 3-5 seconds before next cycle
          const delay = 3000 + Math.random() * 2000;
          setTimeout(runContinuousSearch, delay);
        }
      };

      // Start the continuous search
      runContinuousSearch();

    }

    // Clear selection after operation
    setSelectedRows([]);
  }, [activeTab, results, isContinuousSearchActiveRef, setSearchProgress, generateNewsSearchQueries]);
  
  const handleEnrich = () => {
    console.log('Enriching:', selectedRows);
    // Implement enrich logic
  };
  
  const handleDelete = () => {
    console.log('Deleting:', selectedRows);
    // Implement delete logic
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Progress Indicator */}
      {searchProgress && (
        <div className="px-4 py-2 bg-blue-50 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-700 font-medium">{searchProgress}</span>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="px-4 border-b border-gray-100">
        <ResultsToolbar
          selectedCount={selectedRows.length}
          onMatch={onMatch}
          onNotMatch={onNotMatch}
          onFindLookalikes={() => handleFindLookalikes(selectedRows, setRowDataByTab, results, activeTab, setSelectedRows)}
          onEnrich={handleEnrich}
          onDelete={handleDelete}
          onAddColumn={onAddColumn}
          onAddRow={onAddRow}
          onExport={onExport}
          activeTab={activeTab}
          significanceMin={significanceMin}
          relevanceMin={relevanceMin}
          trustMin={trustMin}
          onSignificanceChange={onSignificanceChange}
          onRelevanceChange={onRelevanceChange}
          onTrustChange={onTrustChange}
          paintMode={paintMode}
        />
      </div>
      
      {/* Grid */}
      <div className="relative">
        <AgGridWrapper
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          height="calc(100vh - 280px)"
          loading={isSearching}
          onSelectionChanged={onSelectionChanged}
          onCellValueChanged={onCellValueChanged}
          onCellClicked={onCellClicked}
          onOpenRow={onOpenRow}
          onColumnHeaderDoubleClick={onColumnHeaderDoubleClick}
          emptyMessage={emptyMessage}
          rowSelection={{ mode: 'multiRow' }}
          getRowClass={getRowClass}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================
export default function Page() {
  // State
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [searchRequestId, setSearchRequestId] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>('companies');
  const [isSearching, setIsSearching] = useState(false);
  const [columnDefsByTab, setColumnDefsByTab] = useState<Record<TabId, ColDef[]>>(() => {
    const map = {} as Record<TabId, ColDef[]>;
    tabConfigs.forEach((tab) => {
      const baseColumns = columnDefsMap[tab.id] || [];
      const storedColumns = loadStoredColumnDefs(tab.id).map(buildCustomColumnDef);
      map[tab.id] = mergeColumns(baseColumns, storedColumns);
    });
    return map;
  });
  const [enrichmentColumnConfigsByTab, setEnrichmentColumnConfigsByTab] = useState<
    Record<TabId, Record<string, EnrichmentColumnConfig>>
  >(() => {
    return tabConfigs.reduce((acc, tab) => {
      acc[tab.id] = {};
      return acc;
    }, {} as Record<TabId, Record<string, EnrichmentColumnConfig>>);
  });
  const [rowDataByTab, setRowDataByTab] = useState<Record<TabId, any[]>>(() => {
    const map = {} as Record<TabId, any[]>;
    tabConfigs.forEach((tab) => {
      map[tab.id] = [];
    });
    return map;
  });
  const [searchedTabs, setSearchedTabs] = useState<Record<TabId, boolean>>(() => {
    return tabConfigs.reduce((acc, tab) => {
      acc[tab.id] = false;
      return acc;
    }, {} as Record<TabId, boolean>);
  });
  const results = rowDataByTab;
  const setResults = setRowDataByTab;
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [sidebarState, setSidebarState] = useState<{ tab: TabId; row: any } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quotaError, setQuotaError] = useState(false);
  const [searchCooldownUntil, setSearchCooldownUntil] = useState<number | null>(null);
  const [searchProgress, setSearchProgress] = useState<string | null>(null);
  const [isMatchActive, setIsMatchActive] = useState(false);
  const [paintMode, setPaintMode] = useState<'match' | 'not-match' | null>(null);
  const isContinuousSearchActiveRef = useRef(false);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [isAddRowOpen, setIsAddRowOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isConfirmNotMatchOpen, setIsConfirmNotMatchOpen] = useState(false);
  const [paywallArmedFor, setPaywallArmedFor] = useState<{ tab: TabId; token: number } | null>(null);
  const paywallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paywallTimerTokenRef = useRef<number | null>(null);
  const isPaywallOpenRef = useRef(false);
  const isSubscribeOpenRef = useRef(false);
  const activeTabRef = useRef(activeTab);
  // In-memory cache to reduce repeated CSE calls for the same tab/query.
  const searchCacheRef = useRef(
    new Map<string, { cachedAt: number; items: any[]; error?: SearchErrorPayload | string | null }>(),
  );
  const searchAbortRef = useRef<AbortController | null>(null);
  const searchTokenRef = useRef(0);
  const inFlightKeyRef = useRef<string | null>(null);
  const inFlightPromiseRef = useRef<Promise<void> | null>(null);

  // News filter states
  const [significanceMin, setSignificanceMin] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('news-significance-min');
      return saved ? parseFloat(saved) : 1.0;
    }
    return 1.0;
  });
  const [relevanceMin, setRelevanceMin] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('news-relevance-min');
      return saved ? parseFloat(saved) : 1.0;
    }
    return 1.0;
  });
  const [trustMin, setTrustMin] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('news-trust-min');
      return saved ? parseFloat(saved) : 1.0;
    }
    return 1.0;
  });

  const buildMockResults = (searchQuery: string) => {
    const next = {} as Record<TabId, any[]>;
    tabConfigs.forEach((tab) => {
      next[tab.id] = buildMockRowsForTab(tab.id, MOCK_ROW_COUNT, searchQuery);
    });
    return next;
  };
  
  const gridRef = useRef<AgGridWrapperRef | null>(null);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    isPaywallOpenRef.current = isPaywallOpen;
    isSubscribeOpenRef.current = isSubscribeOpen;
  }, [isPaywallOpen, isSubscribeOpen]);

  useEffect(() => {
    if (!searchCooldownUntil) return;
    const remaining = searchCooldownUntil - Date.now();
    if (remaining <= 0) {
      setSearchCooldownUntil(null);
      return;
    }
    const timer = setTimeout(() => setSearchCooldownUntil(null), remaining);
    return () => clearTimeout(timer);
  }, [searchCooldownUntil]);

  // Persist slider values to localStorage
  useEffect(() => {
    localStorage.setItem('news-significance-min', significanceMin.toString());
  }, [significanceMin]);

  useEffect(() => {
    localStorage.setItem('news-relevance-min', relevanceMin.toString());
  }, [relevanceMin]);

  useEffect(() => {
    localStorage.setItem('news-trust-min', trustMin.toString());
  }, [trustMin]);

  useEffect(() => {
    tabConfigs.forEach((tab) => {
      const storedColumns = toStoredColumns(columnDefsByTab[tab.id] || []);
      saveStoredColumnDefs(tab.id, storedColumns);
    });
  }, [columnDefsByTab]);

  useEffect(() => {
    tabConfigs.forEach((tab) => {
      saveStoredRowData(tab.id, rowDataByTab[tab.id] || []);
    });
  }, [rowDataByTab]);

  useEffect(() => {
    if (!isPaywallOpen && !isSubscribeOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isPaywallOpen, isSubscribeOpen]);

  useEffect(() => {
    if (!paywallArmedFor) return;

    const { tab } = paywallArmedFor;
    const tabResults = rowDataByTab[tab] || [];

    if (tabResults.length === 0) return;
    if (paywallTimerTokenRef.current === paywallArmedFor.token) return;

    if (paywallTimerRef.current) {
      clearTimeout(paywallTimerRef.current);
    }

    paywallTimerTokenRef.current = paywallArmedFor.token;
    paywallTimerRef.current = setTimeout(() => {
      if (isPaywallOpenRef.current || isSubscribeOpenRef.current) {
        paywallTimerRef.current = null;
        return;
      }
      setIsPaywallOpen(true);
      paywallTimerRef.current = null;
    }, 7000);

    return () => {
      if (paywallTimerRef.current) {
        clearTimeout(paywallTimerRef.current);
        paywallTimerRef.current = null;
      }
    };
  }, [paywallArmedFor, rowDataByTab]);

  // Filter news data based on slider values
  const filteredNews = useMemo(() => {
    return results.news.filter(item =>
      (item.significance_score || 0) >= significanceMin &&
      (item.relevance_score || 0) >= relevanceMin &&
      (item.trustScore || 0) >= trustMin
    );
  }, [results.news, significanceMin, relevanceMin, trustMin]);

  // Create filtered results object
  const filteredResults = useMemo(() => ({
    ...results,
    news: filteredNews,
  }), [results, filteredNews]);

  // Row class function for match status styling
  const getRowClass = useCallback((params: any) => {
    const matchStatus = params.data?.matchStatus;
    const newlyAdded = params.data?.newlyAdded;
    const isSelected = params.node?.isSelected();
    const isCompaniesTab = activeTab === 'companies';
    const isPeopleTab = activeTab === 'people';
    const isNewsTab = activeTab === 'news';

    if (isPeopleTab || isNewsTab) {
      return '';
    }
    if (newlyAdded) {
      return 'row-newly-added';
    } else if (!isCompaniesTab && isMatchActive && isSelected) {
      return 'row-selected-match'; // Light green background for selected rows when Match is active
    } else if (!isCompaniesTab && matchStatus === 'match') {
      return 'row-match';
    } else if (!isCompaniesTab && matchStatus === 'not-match') {
      return 'row-not-match';
    } else if (matchStatus === 'suggested') {
      return 'row-suggested';
    }
    return '';
  }, [activeTab, isMatchActive]); // Row background styling function

  // Calculate result counts per tab (use filtered results for news)
  const resultCounts = useMemo(() => ({
    companies: searchedTabs.companies ? filteredResults.companies.length : 0,
    people: searchedTabs.people ? filteredResults.people.length : 0,
    news: searchedTabs.news ? filteredResults.news.length : 0,
    signals: searchedTabs.signals ? filteredResults.signals.length : 0,
    market: searchedTabs.market ? filteredResults.market.length : 0,
    patents: searchedTabs.patents ? filteredResults.patents.length : 0,
    'research-papers': searchedTabs['research-papers'] ? filteredResults['research-papers'].length : 0,
  }), [filteredResults, searchedTabs]);
  
  const applySearchResults = useCallback(
    (tab: TabId, items: any[], errorPayload?: SearchErrorPayload | string | null) => {
      setResults((prevResults) => ({
        ...prevResults,
        [tab]: items,
      }));
      setSearchedTabs((prevTabs) => ({
        ...prevTabs,
        [tab]: true,
      }));

      const normalizedError =
        typeof errorPayload === 'string' ? { error: errorPayload } : errorPayload || null;

      if (normalizedError?.error === 'quota_exceeded' || normalizedError?.status === 429) {
        setQuotaError(true);
        setSearchCooldownUntil(Date.now() + SEARCH_COOLDOWN_MS);
        setError(null);
      } else {
        setQuotaError(false);
        setError(normalizedError?.error ?? (normalizedError ? 'Search failed. Please try again.' : null));
      }
    },
    [setResults, setSearchedTabs, setError, setQuotaError, setSearchCooldownUntil],
  );

  const fetchTabResults = useCallback(
    async (tab: TabId, searchQuery: string, signal?: AbortSignal) => {
      const trimmedQuery = searchQuery.trim();
      if (!trimmedQuery) return;

      const cacheKey = makeSearchCacheKey(tab, trimmedQuery);
      const now = Date.now();

      // Serve cached results when fresh to avoid extra API calls.
      const cached = searchCacheRef.current.get(cacheKey);
      if (cached && now - cached.cachedAt < SEARCH_CACHE_TTL_MS) {
        applySearchResults(tab, cached.items, cached.error ?? null);
        return;
      }
      if (searchCooldownUntil && searchCooldownUntil > Date.now()) return;

      if (inFlightKeyRef.current === cacheKey && inFlightPromiseRef.current) {
        return inFlightPromiseRef.current;
      }

      const token = ++searchTokenRef.current;

      const requestPromise = (async () => {
        setIsSearching(true);
        setError(null);
        setQuotaError(false);

        try {
          const response = await fetch('/api/google-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: trimmedQuery, tab }),
            signal,
          });

          const data = await response.json().catch(() => ({}));
          if (token !== searchTokenRef.current) return;

          if (!response.ok) {
            if (IS_MOCK_SEARCH_MODE) {
              const fallbackItems = buildMockRowsForTab(tab, MOCK_ROW_COUNT, trimmedQuery);
              searchCacheRef.current.set(cacheKey, {
                cachedAt: now,
                items: fallbackItems,
                error: null,
              });
              applySearchResults(tab, fallbackItems, null);
              return;
            }
            const errorPayload = {
              error: data?.error ?? 'google_cse_error',
              status: response.status,
            };
            if (Array.isArray(data?.items)) {
              const fallbackItems = normalizeCseItems(data.items, { tab });
              searchCacheRef.current.set(cacheKey, {
                cachedAt: now,
                items: fallbackItems,
                error: errorPayload,
              });
              applySearchResults(tab, fallbackItems, errorPayload);
            } else {
              applySearchResults(tab, [], errorPayload);
            }
            return;
          }

          const items = Array.isArray(data?.items) ? data.items : [];
          const normalizedItems =
            data?.source === 'mock'
              ? buildMockRowsForTab(tab, MOCK_ROW_COUNT, trimmedQuery)
              : normalizeCseItems(items, { tab });
          searchCacheRef.current.set(cacheKey, {
            cachedAt: now,
            items: normalizedItems,
            error: null,
          });
          applySearchResults(tab, normalizedItems, null);
        } catch (error) {
          if ((error as DOMException).name === 'AbortError') {
            return;
          }
          console.error('Search request failed:', error);
          if (token !== searchTokenRef.current) return;
          if (IS_MOCK_SEARCH_MODE) {
            const fallbackItems = buildMockRowsForTab(tab, MOCK_ROW_COUNT, trimmedQuery);
            searchCacheRef.current.set(cacheKey, {
              cachedAt: now,
              items: fallbackItems,
              error: null,
            });
            applySearchResults(tab, fallbackItems, null);
            return;
          }
          applySearchResults(tab, [], 'Search failed. Please try again.');
        } finally {
          if (token === searchTokenRef.current) {
            setIsSearching(false);
            setPaywallArmedFor({ tab, token: Date.now() });
          }
          if (inFlightKeyRef.current === cacheKey) {
            inFlightKeyRef.current = null;
            inFlightPromiseRef.current = null;
          }
        }
      })();

      inFlightKeyRef.current = cacheKey;
      inFlightPromiseRef.current = requestPromise;
      return requestPromise;
    },
    [applySearchResults, searchCooldownUntil],
  );

  // Search handler
  const handleSearch = useCallback(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    if (searchCooldownUntil && searchCooldownUntil > Date.now()) return;

    setSelectedRows([]);
    setIsPaywallOpen(false);
    setIsSubscribeOpen(false);
    if (paywallTimerRef.current) {
      clearTimeout(paywallTimerRef.current);
      paywallTimerRef.current = null;
    }
    paywallTimerTokenRef.current = null;

    setSubmittedQuery(trimmedQuery);
    setSearchRequestId((prev) => prev + 1);
    if (IS_MOCK_SEARCH_MODE) {
        setError(null);
        setQuotaError(false);
        setResults(buildMockResults(trimmedQuery));
        setSearchedTabs(() =>
          tabConfigs.reduce((acc, tab) => {
            acc[tab.id] = true;
            return acc;
          }, {} as Record<TabId, boolean>),
        );
        setIsSearching(false);
        setPaywallArmedFor({ tab: activeTabRef.current, token: Date.now() });
        return;
      }
    setResults((prevResults) => {
      const next = { ...prevResults } as Record<TabId, any[]>;
      tabConfigs.forEach((tab) => {
        next[tab.id] = [];
      });
      return next;
    });
    setSearchedTabs(() =>
      tabConfigs.reduce((acc, tab) => {
        acc[tab.id] = false;
        return acc;
      }, {} as Record<TabId, boolean>),
    );
  }, [query, searchCooldownUntil, setResults]);

  useEffect(() => {
    if (IS_MOCK_SEARCH_MODE) return;
    if (!submittedQuery) return;
    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;
    void fetchTabResults(activeTabRef.current, submittedQuery, controller.signal);
    return () => {
      controller.abort();
      inFlightKeyRef.current = null;
      inFlightPromiseRef.current = null;
    };
  }, [activeTab, submittedQuery, searchRequestId, fetchTabResults, searchCooldownUntil]);
  
  // Tab change handler
  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setSelectedRows([]);
  }, []);

  useEffect(() => {
    setSidebarState(null);
  }, [activeTab]);

  const handleOpenRow = useCallback((row: any) => {
    setSidebarState({ tab: activeTab, row });
  }, [activeTab]);
  
  // Selection change handler
  const handleSelectionChanged = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  // Cell value change handler
  const handleCellValueChanged = useCallback((event: any) => {
    const { data, colDef, newValue, oldValue } = event;

    if (newValue !== oldValue) {
      // Update the results state with the new value
      setResults(prevResults => {
        const newResults = { ...prevResults };
        const tabData = [...newResults[activeTab]];

        // Find and update the specific row
        const rowIndex = tabData.findIndex(row => row.id === data.id);
        if (rowIndex !== -1) {
          tabData[rowIndex] = { ...tabData[rowIndex], [colDef.field]: newValue };
          newResults[activeTab] = tabData;
        }

        return newResults;
      });

      console.log(`Updated ${colDef.field} for ${data.id}: ${oldValue} → ${newValue}`);
    }
  }, [activeTab]);

  // Debounced slider handlers
  const handleSignificanceChange = useCallback((value: number) => {
    setSignificanceMin(value);
  }, []);

  const handleRelevanceChange = useCallback((value: number) => {
    setRelevanceMin(value);
  }, []);

  const handleTrustChange = useCallback((value: number) => {
    setTrustMin(value);
  }, []);

  const handleExport = useCallback(() => {
    const rows = filteredResults[activeTab] || [];
    const exportColumns = getExportColumnsForTab(activeTab, [], columnDefsByTab[activeTab] || []);
    const csv = toCSV(rows, exportColumns);

    if (!csv) {
      console.warn('No exportable columns found.');
      return;
    }

    const tabLabel = tabConfigs.find((tab) => tab.id === activeTab)?.label || activeTab;
    const tabSlug = tabLabel.toLowerCase().replace(/\s+/g, '-');
    const dateStamp = new Date().toISOString().split('T')[0];
    const filename = `getnius-${tabSlug}-${dateStamp}.csv`;

    downloadCSV(filename, csv);
  }, [activeTab, columnDefsByTab, filteredResults]);

  // Column name change handler (for custom columns)
  const handleColumnNameChange = useCallback((tab: TabId, fieldName: string, newName: string) => {
    setColumnDefsByTab(prev => {
      const tabColumns = prev[tab] || [];
      const updatedColumns = tabColumns.map(col => {
        if ((col as CustomColDef).__isCustom && col.field === fieldName) {
          return { ...col, headerName: newName };
        }
        return col;
      });

      return {
        ...prev,
        [tab]: updatedColumns,
      };
    });
  }, []);

  const handleAddColumnSubmit = useCallback((payload: {
    headerName: string;
    field: string;
    type: ColumnKind;
    prompt: string;
    formatInstructions: string;
    contextScope: { mode: 'all' | 'selected'; columns: string[] };
    restrictSources: boolean;
  }) => {
    const newColumn: CustomColDef = buildCustomColumnDef({
      headerName: payload.headerName,
      field: payload.field,
      type: payload.type,
    });

    setColumnDefsByTab(prev => {
      const tabColumns = prev[activeTab] || [];
      return {
        ...prev,
        [activeTab]: mergeColumns(tabColumns, [newColumn]),
      };
    });

    setResults(prevResults => {
      const newResults = { ...prevResults };
      const tabData = [...newResults[activeTab]];
      const defaultValue = getDefaultValueForType(payload.type);

      newResults[activeTab] = tabData.map(row => ({
        ...row,
        [payload.field]: defaultValue,
      }));

      return newResults;
    });
    setEnrichmentColumnConfigsByTab((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [payload.field]: {
          columnName: payload.headerName,
          columnKey: payload.field,
          dataType: payload.type,
          prompt: payload.prompt,
          formatInstructions: payload.formatInstructions,
          contextScope: payload.contextScope,
          restrictSources: payload.restrictSources,
        },
      },
    }));
  }, [activeTab, setColumnDefsByTab, setResults, setEnrichmentColumnConfigsByTab]);


  // Paint Mode Toggle Handlers
  const toggleMatchPaintMode = useCallback(() => {
    setPaintMode(prev => prev === 'match' ? null : 'match');
  }, []);

  const toggleNotMatchPaintMode = useCallback(() => {
    setPaintMode(prev => prev === 'not-match' ? null : 'not-match');
  }, []);

  // Cell Click Handler for Paint Mode - marks individual CELLS, not rows
  const handleCellClicked = useCallback((event: any) => {
    if (!paintMode || !event.data || !event.colDef) return;
    
    const rowData = event.data;
    const cellField = event.colDef.field;
    const matchStatus: 'match' | 'not-match' = paintMode === 'match' ? 'match' : 'not-match';
    
    // Skip if clicking on special columns (checkbox, actions, etc.)
    if (!cellField || cellField === 'actions' || cellField === 'select') return;
    
    setResults(prevResults => {
      const newResults = { ...prevResults };
      const tabData = [...newResults[activeTab]];
      
      const rowIndex = tabData.findIndex(row => row.id === rowData.id);
      if (rowIndex !== -1) {
        // Store cell-level match status as __cellMatchStatus__
        const cellMatchStatus = tabData[rowIndex].__cellMatchStatus__ || {};
        tabData[rowIndex] = { 
          ...tabData[rowIndex], 
          __cellMatchStatus__: {
            ...cellMatchStatus,
            [cellField]: matchStatus
          }
        };
      }
      
      newResults[activeTab] = tabData;
      return newResults;
    });
  }, [paintMode, activeTab, setResults]);

  const handleNotMatch = useCallback((selectedRows: any[], setResultsFn: React.Dispatch<React.SetStateAction<Record<TabId, any[]>>>, results: Record<TabId, any[]>, activeTab: TabId, setSelectedRows: React.Dispatch<React.SetStateAction<any[]>>) => {
    if (selectedRows.length === 0) return;

    // Show confirmation dialog for Not Match (destructive action)
    setIsConfirmNotMatchOpen(true);
  }, []);

  const handleConfirmNotMatch = useCallback((selectedRows: any[], setResultsFn: React.Dispatch<React.SetStateAction<Record<TabId, any[]>>>, _results: Record<TabId, any[]>, activeTab: TabId, setSelectedRows: React.Dispatch<React.SetStateAction<any[]>>) => {
    setResultsFn(prevResults => {
      const newResults = { ...prevResults };
      const tabData = [...newResults[activeTab]];

      // Update matchStatus for selected rows
      selectedRows.forEach(selectedRow => {
        const rowIndex = tabData.findIndex(row => row.id === selectedRow.id);
        if (rowIndex !== -1) {
          tabData[rowIndex] = { ...tabData[rowIndex], matchStatus: 'not-match' as const };
        }
      });

      newResults[activeTab] = tabData;
      return newResults;
    });

    // Clear selection after operation
    setSelectedRows([]);
  }, []);

  const handleAddRowSubmit = useCallback((values: Record<string, any>) => {
    const newRow = {
      id: `${activeTab}-${Date.now()}`,
      ...values,
    };

    setResults(prevResults => {
      const newResults = { ...prevResults };
      const tabData = [...newResults[activeTab]];
      newResults[activeTab] = [...tabData, newRow];
      return newResults;
    });
  }, [activeTab, setResults]);

  const activeColumns = useMemo(
    () => columnDefsByTab[activeTab] || [],
    [activeTab, columnDefsByTab]
  );
  const activeDataColumns = useMemo(
    () => getDataColumns(activeColumns),
    [activeColumns]
  );
  const existingFields = useMemo(
    () => getAllColumnFields(activeColumns),
    [activeColumns]
  );

  const emptyMessage = searchedTabs[activeTab]
    ? `No ${activeTab} data available.`
    : 'Run a search to see results';

  const sidebarModel = useMemo(() => {
    if (!sidebarState) return null;
    return mapRowToSidebarModel(sidebarState.tab, sidebarState.row);
  }, [sidebarState]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Getnius
              </h1>
              <nav className="hidden md:flex gap-1">
                <button className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg transition-colors">
                  New Search
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-2">
                  <History className="w-4 h-4" />
                  History
                </button>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                <Bookmark className="w-5 h-5" />
              </button>
              <button className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-6 space-y-4">
        {/* Search Header */}
        <SearchHeader
          query={query}
          onQueryChange={setQuery}
          onSearch={handleSearch}
          isSearching={isSearching}
          isCooldown={Boolean(searchCooldownUntil && searchCooldownUntil > Date.now())}
        />
        
        {/* Category Tabs */}
        <div className="py-2">
          <CategoryTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            resultCounts={resultCounts}
          />
        </div>

        {quotaError && (
          <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
            Google Search quota exceeded. Try again later.
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
            {error}
          </div>
        )}
        
        {/* Results Panel with AG Grid */}
        <ResultsPanel
          activeTab={activeTab}
          results={filteredResults}
          isSearching={isSearching}
          selectedRows={selectedRows}
          onSelectionChanged={handleSelectionChanged}
          onCellValueChanged={handleCellValueChanged}
          onCellClicked={handleCellClicked}
          onOpenRow={handleOpenRow}
          onAddColumn={() => setIsAddColumnOpen(true)}
          onAddRow={() => setIsAddRowOpen(true)}
          onMatch={toggleMatchPaintMode}
          onNotMatch={toggleNotMatchPaintMode}
          onExport={handleExport}
          columnDefsByTab={columnDefsByTab}
          onColumnHeaderDoubleClick={(columnField, currentName) => {
            const tabColumns = columnDefsByTab[activeTab] || [];
            const column = tabColumns.find((col) => col.field === columnField);
            if (!(column as CustomColDef)?.__isCustom) return;
            const newName = prompt('Enter new column name:', currentName);
            if (newName && newName.trim() && newName !== currentName) {
              handleColumnNameChange(activeTab, columnField, newName.trim());
            }
          }}
          setSelectedRows={setSelectedRows}
          setRowDataByTab={setResults}
          setSearchProgress={setSearchProgress}
          isContinuousSearchActiveRef={isContinuousSearchActiveRef}
          gridRef={gridRef}
          significanceMin={significanceMin}
          relevanceMin={relevanceMin}
          trustMin={trustMin}
          onSignificanceChange={handleSignificanceChange}
          onRelevanceChange={handleRelevanceChange}
          onTrustChange={handleTrustChange}
          getRowClass={getRowClass}
          searchProgress={searchProgress}
          emptyMessage={emptyMessage}
          paintMode={paintMode}
        />

        <RowDetailsSidebar
          open={Boolean(sidebarState)}
          onClose={() => setSidebarState(null)}
          title={sidebarModel?.title || ''}
          link={sidebarModel?.link}
          fields={sidebarModel?.fields || []}
          summary={sidebarModel?.summary}
        />

        <AddColumnModal
          open={isAddColumnOpen}
          onOpenChange={setIsAddColumnOpen}
          existingFields={existingFields}
          existingColumns={activeDataColumns
            .filter((col) => col.field)
            .map((col) => ({
              field: col.field as string,
              headerName: col.headerName || '',
            }))}
          onSubmit={handleAddColumnSubmit}
        />

        <AddRowModal
          open={isAddRowOpen}
          onOpenChange={setIsAddRowOpen}
          columns={activeDataColumns}
          rowData={rowDataByTab[activeTab] || []}
          onSubmit={handleAddRowSubmit}
        />
      </main>

      <PaywallModal
        open={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSubscribe={() => setIsSubscribeOpen(true)}
        isSubscribeOpen={isSubscribeOpen}
      />
      <SubscribeModal open={isSubscribeOpen} onClose={() => setIsSubscribeOpen(false)} />
      <AuthModal open={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      <ConfirmDialog
        open={isConfirmNotMatchOpen}
        onOpenChange={setIsConfirmNotMatchOpen}
        title="Mark as Not Match"
        description={`Are you sure you want to mark ${selectedRows.length} selected ${selectedRows.length === 1 ? 'row' : 'rows'} as "Not Match"? This action will update their status in the pipeline.`}
        confirmText="Mark as Not Match"
        cancelText="Cancel"
        onConfirm={() => handleConfirmNotMatch(selectedRows, setResults, results, activeTab, setSelectedRows)}
        variant="destructive"
      />
    </div>
  );
}
