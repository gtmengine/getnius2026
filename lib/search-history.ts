import type { TabId } from '@/lib/grid-columns';

export type SearchHistoryEntry = {
  id: string;
  query: string;
  createdAt: string;
  tab?: TabId;
};

const STORAGE_KEY = 'getnius:v1:searchHistory';
const MAX_ENTRIES = 50;

const isBrowser = () => typeof window !== 'undefined';

const safeParse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const loadSearchHistory = (): SearchHistoryEntry[] => {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  const data = safeParse<SearchHistoryEntry[]>(raw, []);
  return Array.isArray(data) ? data : [];
};

export const saveSearchHistory = (entries: SearchHistoryEntry[]) => {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const addSearchHistoryEntry = (entry: SearchHistoryEntry) => {
  if (!isBrowser()) return;
  const normalized = entry.query.trim().toLowerCase();
  const existing = loadSearchHistory();
  const filtered = existing.filter((item) => item.query.trim().toLowerCase() !== normalized);
  const next = [entry, ...filtered].slice(0, MAX_ENTRIES);
  saveSearchHistory(next);
};

export const clearSearchHistory = () => {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
};
