const WEEKLY_STORAGE_KEY = "gn_weekly_usage";
const SESSION_START_KEY = "gn_session_start";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface WeeklyUsage {
  count: number;
  resetAt: number;
}

function loadWeekly(): WeeklyUsage {
  try {
    const raw = localStorage.getItem(WEEKLY_STORAGE_KEY);
    if (raw) {
      const parsed: WeeklyUsage = JSON.parse(raw);
      if (parsed.resetAt && Date.now() < parsed.resetAt) {
        return parsed;
      }
    }
  } catch {
    /* ignore */
  }
  const fresh: WeeklyUsage = { count: 0, resetAt: Date.now() + WEEK_MS };
  localStorage.setItem(WEEKLY_STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

/** Call after each successful search to increment weekly counter and init session timer. */
export function trackSearchUsage(): void {
  if (typeof window === "undefined") return;

  // Initialize session start if not set
  if (!localStorage.getItem(SESSION_START_KEY)) {
    localStorage.setItem(SESSION_START_KEY, String(Date.now()));
  }

  // Increment weekly counter
  const weekly = loadWeekly();
  weekly.count += 1;
  localStorage.setItem(WEEKLY_STORAGE_KEY, JSON.stringify(weekly));
}
