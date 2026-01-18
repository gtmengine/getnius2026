import { TabId } from './grid-columns';

export type TabKey = TabId;

export type ColumnKind = 'text' | 'number' | 'badge' | 'link';

export interface StoredColumnDef {
  headerName: string;
  field: string;
  type: ColumnKind;
  width?: number;
  minWidth?: number;
  flex?: number;
}

const STORAGE_PREFIX = 'getnius:v1';

const isBrowser = () => typeof window !== 'undefined';

export const getColumnDefsStorageKey = (tab: TabKey) =>
  `${STORAGE_PREFIX}:columnDefs:${tab}`;

export const getRowDataStorageKey = (tab: TabKey) =>
  `${STORAGE_PREFIX}:rowData:${tab}`;

export const labelToField = (label: string) => {
  const trimmed = label.trim();
  if (!trimmed) return '';
  const normalized = trimmed
    .replace(/["'`]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase();

  if (!normalized) return '';
  return normalized.split(' ').join('_');
};

const safeParse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const loadStoredColumnDefs = (tab: TabKey): StoredColumnDef[] => {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(getColumnDefsStorageKey(tab));
  const data = safeParse<StoredColumnDef[]>(raw, []);
  return Array.isArray(data) ? data : [];
};

export const saveStoredColumnDefs = (tab: TabKey, columns: StoredColumnDef[]) => {
  if (!isBrowser()) return;
  localStorage.setItem(getColumnDefsStorageKey(tab), JSON.stringify(columns));
};

export const loadStoredRowData = (tab: TabKey): any[] => {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(getRowDataStorageKey(tab));
  const data = safeParse<any[]>(raw, []);
  return Array.isArray(data) ? data : [];
};

export const saveStoredRowData = (tab: TabKey, rows: any[]) => {
  if (!isBrowser()) return;
  localStorage.setItem(getRowDataStorageKey(tab), JSON.stringify(rows));
};
