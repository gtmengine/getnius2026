type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export const DEFAULT_CACHE_TTL_MS = 15 * 60 * 1000;

const memoryCache = new Map<string, CacheEntry<unknown>>();

export function getCache<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value as T;
}

export function setCache<T>(key: string, value: T, ttlMs: number = DEFAULT_CACHE_TTL_MS): void {
  memoryCache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function clearCache(key: string): void {
  memoryCache.delete(key);
}
