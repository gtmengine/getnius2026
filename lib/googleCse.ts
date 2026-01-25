import type { TabId } from "@/lib/grid-columns";

export type GoogleCseItem = {
  title?: string;
  link?: string;
  snippet?: string;
  displayLink?: string;
  pagemap?: Record<string, unknown>;
};

export type GoogleCseSearchResult =
  | {
      ok: true;
      status: number;
      items: GoogleCseItem[];
      searchInformation?: Record<string, unknown>;
    }
  | {
      ok: false;
      status: number;
      items: [];
      error: "quota_exceeded" | "google_cse_error";
    };

type GoogleCseResponse = {
  items?: GoogleCseItem[];
  searchInformation?: Record<string, unknown>;
};

const tabQueryRefinements: Record<TabId, (q: string) => string> = {
  companies: (q) => `${q} (company OR startup OR "headquarters" OR "funding") -site:linkedin.com/in`,
  people: (q) =>
    `${q} (CEO OR founder OR "VP" OR "LinkedIn") (site:linkedin.com/in OR site:x.com OR site:twitter.com)`,
  news: (q) =>
    `${q} (news OR "press release" OR announcement) (site:reuters.com OR site:techcrunch.com OR site:bloomberg.com OR site:ft.com OR site:theverge.com OR site:wsj.com)`,
  signals: (q) => `${q} ("raised" OR funding OR acquisition OR partnership OR "product launch")`,
  market: (q) =>
    `${q} ("market report" OR "industry report" OR outlook OR forecast) (filetype:pdf OR report)`,
  patents: (q) =>
    `${q} (patent OR USPTO OR WIPO) (site:patents.google.com OR site:wipo.int OR site:uspto.gov)`,
  "research-papers": (q) =>
    `${q} ("research paper" OR study OR arxiv OR IEEE OR ACM) (site:arxiv.org OR site:ieee.org OR site:acm.org OR site:springer.com OR filetype:pdf)`,
};

export function buildTabQuery(tab: TabId, query: string): string {
  const trimmedQuery = query.trim();
  const refinement = tabQueryRefinements[tab];
  const refinedQuery = refinement ? refinement(trimmedQuery) : trimmedQuery;

  if (process.env.NODE_ENV !== "production") {
    console.debug(`[googleCse] Tab query (${tab}):`, refinedQuery);
  }

  return refinedQuery;
}

export async function googleCseSearch(
  tab: TabId,
  query: string,
  start?: number,
): Promise<GoogleCseSearchResult> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cseId = process.env.GOOGLE_CSE_ID;

  if (!apiKey || !cseId) {
    throw new Error("Google CSE credentials are missing");
  }

  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("cx", cseId);
  url.searchParams.set("q", buildTabQuery(tab, query));
  url.searchParams.set("num", "10");
  url.searchParams.set("safe", "active");
  url.searchParams.set("fields", "items(title,link,snippet,displayLink,pagemap),searchInformation");

  if (start && Number.isFinite(start)) {
    url.searchParams.set("start", String(start));
  }

  const response = await fetch(url.toString(), { cache: "no-store" });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 429) {
      return {
        ok: false,
        status: 429,
        items: [],
        error: "quota_exceeded",
      };
    }

    if (response.status >= 500) {
      throw new Error(`Google CSE error: ${response.status} ${errorText}`);
    }

    return {
      ok: false,
      status: response.status,
      items: [],
      error: "google_cse_error",
    };
  }

  let data: GoogleCseResponse;
  try {
    data = (await response.json()) as GoogleCseResponse;
  } catch (error) {
    throw new Error("Google CSE returned malformed JSON");
  }

  if (!data || typeof data !== "object") {
    throw new Error("Google CSE returned malformed response");
  }

  return {
    ok: true,
    status: response.status,
    items: data.items ?? [],
    searchInformation: data.searchInformation,
  };
}
