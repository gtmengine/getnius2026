import { NextResponse, type NextRequest } from "next/server";

import { googleCseSearch } from "@/lib/googleCse";
import type { TabId } from "@/lib/grid-columns";

type SearchRequestBody = {
  query?: string;
  tab?: TabId;
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
    return NextResponse.json({ error: "Invalid JSON body", items: [] }, { status: 400 });
  }

  const query = typeof payload.query === "string" ? payload.query.trim() : "";
  const tab = isTabId(payload.tab) ? payload.tab : undefined;
  const start = typeof payload.start === "number" ? payload.start : undefined;

  if (!query) {
    return NextResponse.json({ error: "Query is required", items: [] }, { status: 400 });
  }

  if (!tab) {
    return NextResponse.json({ error: "Tab is required", items: [] }, { status: 400 });
  }

  if (query.length > 200) {
    return NextResponse.json({ error: "Query must be 200 characters or less", items: [] }, { status: 400 });
  }

  if (!process.env.GOOGLE_API_KEY || !process.env.GOOGLE_CSE_ID) {
    return NextResponse.json(
      {
        error: "Google CSE is not configured. Set GOOGLE_API_KEY and GOOGLE_CSE_ID.",
        items: [],
      },
      { status: 500 },
    );
  }

  try {
    const { items, searchInformation } = await googleCseSearch(tab, query, start);
    return NextResponse.json({ items, searchInformation });
  } catch (error) {
    console.error("Google CSE search error:", error);
    return NextResponse.json({ error: "Google CSE request failed", items: [] }, { status: 502 });
  }
}
