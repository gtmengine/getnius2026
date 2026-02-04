'use client'

import { useState, useEffect } from 'react'
import { Activity } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { SESSION_BUDGET_COOKIE, SESSION_BUDGET_LIMIT } from '@/lib/session-budget'

const WEEKLY_STORAGE_KEY = 'gn_weekly_usage'
const WEEKLY_LIMIT = 100
const WEEK_MS = 7 * 24 * 60 * 60 * 1000
const SESSION_DURATION_MS = 5 * 60 * 60 * 1000 // 5 hours

interface WeeklyUsage {
  count: number
  resetAt: number
}

function getCookieValue(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

function getSessionResetLabel(): string {
  // Session cookie doesn't store creation time, so estimate remaining
  // based on a 5-hour window from first visit
  const key = 'gn_session_start'
  let start = Number(localStorage.getItem(key))
  if (!start || Date.now() - start > SESSION_DURATION_MS) {
    start = Date.now()
    localStorage.setItem(key, String(start))
  }
  const remaining = Math.max(0, SESSION_DURATION_MS - (Date.now() - start))
  const hours = Math.ceil(remaining / (60 * 60 * 1000))
  return `Resets in ${hours}h`
}

function getWeeklyUsage(): WeeklyUsage {
  try {
    const raw = localStorage.getItem(WEEKLY_STORAGE_KEY)
    if (raw) {
      const parsed: WeeklyUsage = JSON.parse(raw)
      if (parsed.resetAt && Date.now() < parsed.resetAt) {
        return parsed
      }
    }
  } catch { /* ignore */ }
  const fresh: WeeklyUsage = { count: 0, resetAt: Date.now() + WEEK_MS }
  localStorage.setItem(WEEKLY_STORAGE_KEY, JSON.stringify(fresh))
  return fresh
}

function getWeeklyResetLabel(resetAt: number): string {
  const remaining = Math.max(0, resetAt - Date.now())
  const days = Math.ceil(remaining / (24 * 60 * 60 * 1000))
  return `Resets in ${days}d`
}

export function UsageTracker() {
  const [sessionCount, setSessionCount] = useState(0)
  const [weekly, setWeekly] = useState<WeeklyUsage>({ count: 0, resetAt: Date.now() + WEEK_MS })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const budgetVal = getCookieValue(SESSION_BUDGET_COOKIE)
    setSessionCount(budgetVal ? Math.min(Number(budgetVal) || 0, SESSION_BUDGET_LIMIT) : 0)
    setWeekly(getWeeklyUsage())
    setMounted(true)
  }, [])

  if (!mounted) return null

  const sessionPct = Math.round((sessionCount / SESSION_BUDGET_LIMIT) * 100)
  const weeklyPct = Math.round((weekly.count / WEEKLY_LIMIT) * 100)

  return (
    <div className="rounded-xl bg-zinc-900 text-zinc-100 p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        <Activity className="h-3.5 w-3.5" />
        Usage
      </div>

      {/* Session */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-300">Session (5hr)</span>
          <span className="font-medium">{sessionPct}%</span>
        </div>
        <Progress
          value={sessionPct}
          className="h-2 bg-zinc-700 [&>div]:bg-sky-400"
        />
        <p className="text-xs text-zinc-500">{getSessionResetLabel()}</p>
      </div>

      {/* Weekly */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-300">Weekly (7 day)</span>
          <span className="font-medium">{weeklyPct}%</span>
        </div>
        <Progress
          value={weeklyPct}
          className="h-2 bg-zinc-700 [&>div]:bg-sky-400"
        />
        <p className="text-xs text-zinc-500">{getWeeklyResetLabel(weekly.resetAt)}</p>
      </div>
    </div>
  )
}
