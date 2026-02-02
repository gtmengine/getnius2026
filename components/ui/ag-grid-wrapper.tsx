"use client";

import { useCallback, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { 
  ColDef, 
  GridReadyEvent, 
  RowClickedEvent,
  SelectionChangedEvent,
  GridApi,
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz
} from 'ag-grid-community';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Custom theme based on Quartz
const customTheme = themeQuartz.withParams({
  headerHeight: 48,
  headerForegroundColor: 'rgb(107 114 128)',
  headerBackgroundColor: 'rgb(249 250 251)',
  borderColor: 'rgb(229 231 235)',
  rowBorder: { color: 'rgb(243 244 246)' },
  fontSize: 14,
  rowHeight: 48,
  cellHorizontalPadding: 16,
  rowHoverColor: 'rgb(249 250 251)',
  selectedRowBackgroundColor: 'rgb(239 246 255)',
  rangeSelectionBorderColor: 'rgb(99 102 241)',
});

export interface HeaderClickInfo {
  field: string;
  headerName: string;
  rect: DOMRect;
}

export interface AgGridWrapperProps {
  rowData: any[];
  columnDefs: ColDef[];
  onRowClick?: (data: any) => void;
  onOpenRow?: (data: any) => void;
  onAddColumn?: () => void;
  onSelectionChanged?: (selectedRows: any[]) => void;
  onCellValueChanged?: (event: any) => void;
  onCellClicked?: (event: any) => void;
  onColumnHeaderClick?: (info: HeaderClickInfo) => void;
  className?: string;
  height?: string;
  rowSelection?: { mode: 'singleRow' | 'multiRow'; checkboxes?: boolean; headerCheckbox?: boolean } | false;
  loading?: boolean;
  emptyMessage?: string;
  getRowClass?: (params: any) => string;
}

export interface AgGridWrapperRef {
  api: GridApi | null;
  getSelectedRows: () => any[];
  deselectAll: () => void;
  selectAll: () => void;
}

export const AgGridWrapper = forwardRef<AgGridWrapperRef, AgGridWrapperProps>(({
  rowData,
  columnDefs,
  onRowClick,
  onOpenRow,
  onAddColumn,
  onSelectionChanged,
  onCellValueChanged,
  onCellClicked,
  onColumnHeaderClick,
  className = "",
  height = "60vh",
  rowSelection = { mode: 'multiRow' },
  loading = false,
  emptyMessage = "No results to display",
  getRowClass,
}, ref) => {
  const gridRef = useRef<AgGridReact>(null);

  useImperativeHandle(ref, () => ({
    api: gridRef.current?.api || null,
    getSelectedRows: () => gridRef.current?.api?.getSelectedRows() || [],
    deselectAll: () => gridRef.current?.api?.deselectAll(),
    selectAll: () => gridRef.current?.api?.selectAll(),
  }));

  const onGridReady = useCallback((params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  }, []);

  const onRowClicked = useCallback((event: RowClickedEvent) => {
    if (onRowClick && event.data) {
      onRowClick(event.data);
    }
  }, [onRowClick]);

  const handleSelectionChanged = useCallback((event: SelectionChangedEvent) => {
    if (onSelectionChanged) {
      const selectedRows = event.api.getSelectedRows();
      onSelectionChanged(selectedRows);
    }
  }, [onSelectionChanged]);

  const handleCellValueChanged = useCallback((event: any) => {
    if (onCellValueChanged) {
      onCellValueChanged(event);
    }
  }, [onCellValueChanged]);

  const handleColumnHeaderClicked = useCallback((event: any) => {
    if (onColumnHeaderClick && event.column) {
      const columnField = event.column.getColId();
      
      // Skip special columns (actions, select) - these have their own click handlers
      if (columnField === 'actions' || columnField === 'select') {
        return;
      }
      
      const currentName = event.column.getColDef().headerName || event.column.getColDef().field || '';
      
      // Get the header cell element to capture its dimensions
      const headerElement = event.event?.target?.closest('.ag-header-cell');
      if (headerElement) {
        const rect = headerElement.getBoundingClientRect();
        onColumnHeaderClick({
          field: columnField,
          headerName: currentName,
          rect,
        });
      }
    }
  }, [onColumnHeaderClick]);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 100,
  }), []);

  const loadingOverlayComponent = useMemo(() => {
    return () => (
      <div className="flex flex-col items-center justify-center gap-3 p-8">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <span className="text-sm text-gray-600 font-medium">Searching...</span>
      </div>
    );
  }, []);

  const noRowsOverlayComponent = useMemo(() => {
    return () => (
      <div className="flex flex-col items-center justify-center gap-2 p-8">
        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="text-sm text-gray-500">{emptyMessage}</span>
      </div>
    );
  }, [emptyMessage]);

  const context = useMemo(() => ({
    onOpenRow,
    onAddColumn,
  }), [onOpenRow, onAddColumn]);

  return (
    <div className={`ag-theme-quartz ${className}`} style={{ height, width: '100%' }}>
      <style>{`
        .ag-theme-quartz [col-id="select"] .ag-cell-wrapper {
          justify-content: flex-start !important;
          padding-left: 8px !important;
        }
        .ag-theme-quartz [col-id="select"] .ag-selection-checkbox {
          margin-left: 0 !important;
        }
        .ag-theme-quartz [col-id="ag-Grid-SelectionColumn"] {
          display: none !important;
        }
      `}</style>
      <AgGridReact
        ref={gridRef}
        theme={customTheme}
        rowData={rowData}
        columnDefs={columnDefs}
        context={context}
        onGridReady={onGridReady}
        onRowClicked={onRowClicked}
        onCellClicked={onCellClicked}
        rowSelection={rowSelection}
        onSelectionChanged={handleSelectionChanged}
        onCellValueChanged={handleCellValueChanged}
        onColumnHeaderClicked={handleColumnHeaderClicked}
        animateRows={true}
        suppressRowClickSelection={true}
        suppressCellFocus={false}
        defaultColDef={defaultColDef}
        loadingOverlayComponent={loadingOverlayComponent}
        noRowsOverlayComponent={noRowsOverlayComponent}
        loading={loading}
        suppressCellFocus={false}
        enableCellTextSelection={true}
        ensureDomOrder={true}
        getRowClass={getRowClass}
      />
    </div>
  );
});

AgGridWrapper.displayName = 'AgGridWrapper';
