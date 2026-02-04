"use client"

import { useSyncExternalStore } from "react"

const STORAGE_KEY = "gn_paid"

function getSnapshot(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(STORAGE_KEY) === "1"
}

function getServerSnapshot(): boolean {
  return false
}

function subscribe(callback: () => void): () => void {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback()
  }
  window.addEventListener("storage", handleStorage)
  return () => window.removeEventListener("storage", handleStorage)
}

/**
 * Returns `true` when `localStorage.gn_paid === "1"`.
 * SSR-safe: always returns `false` on the server.
 *
 * Toggle for testing:
 *   localStorage.setItem("gn_paid", "1")  // paid
 *   localStorage.removeItem("gn_paid")     // free
 */
export function useIsPaid(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
