import type { TabId } from './grid-columns';

export type VerificationStatus = 'verified' | 'needs_review' | 'rejected';
export type EvidenceType = 'url' | 'text' | 'file';

export interface Verification {
  id: string;
  tabId: TabId;
  rowId: string;
  fieldId: string;
  value?: string | number | null;
  tool?: string | null;
  method?: string | null;
  source?: string | null;
  status: VerificationStatus;
  evidenceType: EvidenceType;
  url: string | null;
  quote: string | null;
  fileRef: string | null;
  notes: string | null;
  createdAt: number;
  createdBy?: string;
}

export interface FieldVerificationSummary {
  count: number;
  bestStatus: VerificationStatus | null;
}

const STORAGE_KEY = 'getnius:v1:verifications';

const isBrowser = () => typeof window !== 'undefined';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function loadAllVerifications(): Verification[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAll(verifications: Verification[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(verifications));
}

export function saveVerification(
  v: Omit<Verification, 'id' | 'createdAt'>
): Verification {
  const all = loadAllVerifications();
  const record: Verification = {
    ...v,
    id: generateId(),
    createdAt: Date.now(),
  };
  all.push(record);
  saveAll(all);
  return record;
}

export function deleteVerification(id: string): void {
  const all = loadAllVerifications();
  saveAll(all.filter((v) => v.id !== id));
}

export function getVerificationsForRow(
  tabId: TabId,
  rowId: string
): Verification[] {
  return loadAllVerifications().filter(
    (v) => v.tabId === tabId && v.rowId === rowId
  );
}

export function getVerificationsForField(
  tabId: TabId,
  rowId: string,
  fieldId: string
): Verification[] {
  return loadAllVerifications().filter(
    (v) => v.tabId === tabId && v.rowId === rowId && v.fieldId === fieldId
  );
}

const STATUS_PRIORITY: Record<VerificationStatus, number> = {
  verified: 3,
  needs_review: 2,
  rejected: 1,
};

export function getVerificationCountsForRow(
  tabId: TabId,
  rowId: string
): Record<string, FieldVerificationSummary> {
  const rows = getVerificationsForRow(tabId, rowId);
  const result: Record<string, FieldVerificationSummary> = {};

  for (const v of rows) {
    if (!result[v.fieldId]) {
      result[v.fieldId] = { count: 0, bestStatus: null };
    }
    result[v.fieldId].count += 1;
    const current = result[v.fieldId].bestStatus;
    if (!current || STATUS_PRIORITY[v.status] > STATUS_PRIORITY[current]) {
      result[v.fieldId].bestStatus = v.status;
    }
  }

  return result;
}
