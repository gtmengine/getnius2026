import { NextResponse, type NextRequest } from "next/server";

import { googleCseSearch } from "@/lib/googleCse";
import { normalizeCseItems } from "@/lib/google/normalize";
import type { TabId } from "@/lib/grid-columns";

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

  if (!process.env.GOOGLE_API_KEY || !process.env.GOOGLE_CSE_ID) {
    return NextResponse.json(
      {
        error: "Google CSE is not configured. Set GOOGLE_API_KEY and GOOGLE_CSE_ID.",
        results: [],
      },
      { status: 500 },
    );
  }

  try {
    const { items, searchInformation } = await googleCseSearch(resolvedTab, query, start);
    const results = normalizeCseItems(items, { tab: resolvedTab });
    return NextResponse.json({ results, searchInformation });
  } catch (error) {
    console.error("Google CSE search error:", error);
    return NextResponse.json(
      { error: "Google CSE request failed", results: [] },
      { status: 502 },
    );
  }
}
