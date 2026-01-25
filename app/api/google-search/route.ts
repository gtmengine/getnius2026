import { NextResponse, type NextRequest } from "next/server";

import type { TabId } from "@/lib/grid-columns";
import { buildMockCseItemsForTab, mockSearchInformation } from "@/lib/mock-search";

type SearchRequestBody = {
  query?: string;
  tab?: TabId;
  start?: number;
};

const DEFAULT_MOCK_COUNT = 50;

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

  if (!query) {
    return NextResponse.json({ error: "Query is required", items: [] }, { status: 400 });
  }

  if (!tab) {
    return NextResponse.json({ error: "Tab is required", items: [] }, { status: 400 });
  }

  if (query.length > 200) {
    return NextResponse.json({ error: "Query must be 200 characters or less", items: [] }, { status: 400 });
  }

  const items = buildMockCseItemsForTab(tab, DEFAULT_MOCK_COUNT, query);
  return NextResponse.json(
    {
      ok: true,
      items,
      searchInformation: mockSearchInformation(items),
      source: "mock",
    },
    { status: 200 },
  );
}
