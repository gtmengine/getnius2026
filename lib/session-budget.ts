export const SESSION_BUDGET_COOKIE = "gn_budget";
export const SESSION_BUDGET_LIMIT = 20;

export function parseSessionBudget(value?: string | null): number {
  if (!value) return 0;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function incrementSessionBudget(
  current: number,
  limit: number = SESSION_BUDGET_LIMIT,
): { count: number; remaining: number; exceeded: boolean } {
  const next = current + 1;
  return {
    count: next,
    remaining: Math.max(0, limit - next),
    exceeded: next > limit,
  };
}
