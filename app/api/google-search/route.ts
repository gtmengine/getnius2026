import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_CACHE_TTL_MS, getCache, setCache } from "@/lib/cache";
import { buildTabQuery, googleSearch, normalizeQueryForCache } from "@/lib/google-search";
import type { GoogleCseItem } from "@/lib/google-search";
import type { TabId } from "@/lib/grid-columns";
import { buildMockCseItemsForTab, mockSearchInformation } from "@/lib/mock-search";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSearchModeFromRequest } from "@/lib/search-mode";
import {
  incrementSessionBudget,
  parseSessionBudget,
  SESSION_BUDGET_COOKIE,
  SESSION_BUDGET_LIMIT,
} from "@/lib/session-budget";

type SearchRequestBody = {
  query?: string;
  tab?: TabId;
  start?: number;
};

const DEFAULT_MOCK_COUNT = 50;
const RATE_LIMIT = { limit: 30, windowMs: 10 * 60 * 1000 };
const REQUEST_TIMEOUT_MS = 8000;
const MAX_START = 91;

type CachedResponse = {
  items: GoogleCseItem[];
  searchInformation?: Record<string, unknown>;
  source: "google" | "mock";
  banner?: string;
};

const inflight = new Map<string, Promise<{ status: number; payload: CachedResponse }>>();

const tabIds: TabId[] = [
  "companies",
  "people",
  "news",
  "signals",
  "market",
  "patents",
  "research-papers",
];

const isTabId = (value?: string): value is TabId =>
  Boolean(value) && tabIds.includes(value as TabId);

const getClientIp = (request: NextRequest) => {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return ip || "unknown";
};

export async function POST(request: NextRequest) {
  let payload: SearchRequestBody;

  try {
    payload = (await request.json()) as SearchRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body", items: [] }, { status: 400 });
  }

  const query = typeof payload.query === "string" ? payload.query.trim() : "";
  const tab = isTabId(payload.tab) ? payload.tab : undefined;
  const start = typeof payload.start === "number" ? payload.start : 1;

  if (!query) {
    return NextResponse.json({ error: "Query is required", items: [] }, { status: 400 });
  }

  if (!tab) {
    return NextResponse.json({ error: "Tab is required", items: [] }, { status: 400 });
  }

  if (query.length < 2) {
    return NextResponse.json({ error: "Query must be at least 2 characters", items: [] }, { status: 400 });
  }

  if (query.length > 200) {
    return NextResponse.json({ error: "Query must be 200 characters or less", items: [] }, { status: 400 });
  }

  if (!Number.isFinite(start) || start < 1 || start > MAX_START) {
    return NextResponse.json(
      { error: `Start must be between 1 and ${MAX_START}`, items: [] },
      { status: 400 },
    );
  }

  const mode = getSearchModeFromRequest(request);
  const cacheKey = `${tab}::${normalizeQueryForCache(query)}::${start}`;
  const cached = getCache<CachedResponse>(cacheKey);
  if (cached) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[googleSearch] cache hit: ${cacheKey}`);
    }
    return NextResponse.json({ ...cached, ok: true }, { status: 200 });
  }

  if (process.env.NODE_ENV !== "production") {
    console.debug(`[googleSearch] cache miss: ${cacheKey}`);
  }

  if (mode === "mock") {
    const mockItems = buildMockCseItemsForTab(tab, DEFAULT_MOCK_COUNT, query);
    const mockPayload: CachedResponse = {
      items: mockItems,
      searchInformation: mockSearchInformation(mockItems),
      source: "mock",
      banner: "Using demo results",
    };
    setCache(cacheKey, mockPayload, DEFAULT_CACHE_TTL_MS);
    return NextResponse.json({ ...mockPayload, ok: true }, { status: 200 });
  }

  if (!process.env.GOOGLE_CSE_API_KEY || !process.env.GOOGLE_CSE_CX) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[googleSearch] Missing GOOGLE_CSE_API_KEY/GOOGLE_CSE_CX. Falling back to mock.");
    }
    const mockItems = buildMockCseItemsForTab(tab, DEFAULT_MOCK_COUNT, query);
    const fallbackPayload: CachedResponse = {
      items: mockItems,
      searchInformation: mockSearchInformation(mockItems),
      source: "mock",
      banner: "Using demo results",
    };
    setCache(cacheKey, fallbackPayload, DEFAULT_CACHE_TTL_MS);
    return NextResponse.json({ ...fallbackPayload, ok: true }, { status: 200 });
  }

  const existing = inflight.get(cacheKey);
  if (existing) {
    const result = await existing;
    return NextResponse.json({ ...result.payload, ok: true }, { status: result.status });
  }

  const rateKey = `google-search:${getClientIp(request)}`;
  const rate = checkRateLimit(rateKey, RATE_LIMIT);
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Please try again shortly.",
        items: [],
        rateLimit: { remaining: rate.remaining, resetAt: rate.resetAt, limit: rate.limit },
      },
      { status: 429 },
    );
  }

  const currentBudget = parseSessionBudget(request.cookies.get(SESSION_BUDGET_COOKIE)?.value);
  if (currentBudget >= SESSION_BUDGET_LIMIT) {
    return NextResponse.json(
      {
        error: "Session budget exceeded. Preview ended.",
        items: [],
        banner: "Preview ended",
        budget: { remaining: 0, limit: SESSION_BUDGET_LIMIT },
      },
      { status: 429 },
    );
  }

  const searchPromise = (async () => {
    const budgetState = incrementSessionBudget(currentBudget, SESSION_BUDGET_LIMIT);
    let responsePayload: CachedResponse;
    let status = 200;

    try {
      const result = await googleSearch(
        {
          query: buildTabQuery(tab, query),
          start,
          num: 10,
        },
        { timeoutMs: REQUEST_TIMEOUT_MS },
      );

      if (!result.ok) {
        const mockItems = buildMockCseItemsForTab(tab, DEFAULT_MOCK_COUNT, query);
        responsePayload = {
          items: mockItems,
          searchInformation: mockSearchInformation(mockItems),
          source: "mock",
          banner: "Using demo results",
        };
      } else {
        responsePayload = {
          items: result.items,
          searchInformation: result.searchInformation,
          source: "google",
        };
      }

      if (process.env.NODE_ENV !== "production") {
        console.debug(
          `[googleSearch] google status: ${result.ok ? result.status : result.status} (${cacheKey})`,
        );
      }

      setCache(cacheKey, responsePayload, DEFAULT_CACHE_TTL_MS);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.debug(`[googleSearch] google error: ${String(error)}`);
      }
      const mockItems = buildMockCseItemsForTab(tab, DEFAULT_MOCK_COUNT, query);
      responsePayload = {
        items: mockItems,
        searchInformation: mockSearchInformation(mockItems),
        source: "mock",
        banner: "Using demo results",
      };
      setCache(cacheKey, responsePayload, DEFAULT_CACHE_TTL_MS);
    }

    return { status, payload: responsePayload, budget: budgetState };
  })();

  inflight.set(cacheKey, searchPromise.then(({ status, payload }) => ({ status, payload })));

  try {
    const result = await searchPromise;
    const response = NextResponse.json({ ...result.payload, ok: true }, { status: result.status });
    response.cookies.set(SESSION_BUDGET_COOKIE, String(result.budget.count), {
      httpOnly: false,
      path: "/",
      sameSite: "lax",
    });
    return response;
  } finally {
    inflight.delete(cacheKey);
  }
}
