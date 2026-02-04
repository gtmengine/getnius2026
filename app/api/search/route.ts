import { NextResponse, type NextRequest } from "next/server";

import { buildTabQuery, googleSearch } from "@/lib/google-search";
import { normalizeCseItems } from "@/lib/google/normalize";
import type { TabId } from "@/lib/grid-columns";
import { buildMockRowsForTab } from "@/lib/mock-search";
import { getSearchModeFromRequest } from "@/lib/search-mode";

type SearchRequestBody = {
  query?: string;
  tab?: string;
  start?: number;
};

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

export async function POST(request: NextRequest) {
  let payload: SearchRequestBody;

  try {
    payload = (await request.json()) as SearchRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body", results: [] }, { status: 400 });
  }

  const query = typeof payload.query === "string" ? payload.query.trim() : "";
  const tab = isTabId(payload.tab) ? payload.tab : undefined;
  const start = typeof payload.start === "number" ? payload.start : undefined;
  const resolvedTab: TabId = tab ?? "companies";

  if (!query) {
    return NextResponse.json({ error: "Query is required", results: [] }, { status: 400 });
  }

  if (query.length > 200) {
    return NextResponse.json(
      { error: "Query must be 200 characters or less", results: [] },
      { status: 400 },
    );
  }

  const mode = getSearchModeFromRequest(request);
  if (mode === "mock") {
    const mockResults = buildMockRowsForTab(resolvedTab, 50, query);
    return NextResponse.json({ results: mockResults, source: "mock", banner: "Using demo results" });
  }

  if (!process.env.GOOGLE_CSE_API_KEY || !process.env.GOOGLE_CSE_CX) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[search] Missing GOOGLE_CSE_API_KEY/GOOGLE_CSE_CX. Falling back to mock.");
    }
    const mockResults = buildMockRowsForTab(resolvedTab, 50, query);
    return NextResponse.json({ results: mockResults, source: "mock", banner: "Using demo results" });
  }

  try {
    const result = await googleSearch({ query: buildTabQuery(resolvedTab, query), start, num: 10 });

    if (!result.ok) {
      return NextResponse.json({ results: [], error: result.error }, { status: result.status });
    }

    const results = normalizeCseItems(result.items, { tab: resolvedTab });
    return NextResponse.json({ results, searchInformation: result.searchInformation });
  } catch (error) {
    console.error("Google CSE search error:", error);
    return NextResponse.json(
      { error: "google_cse_error", results: [] },
      { status: 502 },
    );
  }
}
