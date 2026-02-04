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
      queries?: Record<string, unknown>;
      spelling?: Record<string, unknown>;
    }
  | {
      ok: false;
      status: number;
      items: [];
      error: "quota_exceeded" | "google_cse_error";
    };

export type GoogleSearchParams = {
  query: string;
  start?: number;
  num?: number;
  siteSearch?: string;
  exactTerms?: string;
  dateRestrict?: string;
  fields?: string;
};

export const DEFAULT_FIELDS =
  "items(title,link,snippet,displayLink,pagemap),searchInformation,queries(nextPage),spelling";

const DEFAULT_NUM = 10;

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
    console.debug(`[googleSearch] Tab query (${tab}):`, refinedQuery);
  }

  return refinedQuery;
}

export function normalizeQueryForCache(query: string): string {
  return query.trim().replace(/\s+/g, " ").toLowerCase();
}

export async function googleSearch(
  params: GoogleSearchParams,
  options?: { signal?: AbortSignal; timeoutMs?: number },
): Promise<GoogleCseSearchResult> {
  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cseId = process.env.GOOGLE_CSE_CX;

  if (!apiKey || !cseId) {
    throw new Error("Google CSE credentials are missing");
  }

  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("cx", cseId);
  url.searchParams.set("q", params.query.trim());
  url.searchParams.set("num", String(Math.min(10, Math.max(1, params.num ?? DEFAULT_NUM))));
  url.searchParams.set("safe", "active");
  url.searchParams.set("fields", params.fields ?? DEFAULT_FIELDS);

  if (params.start && Number.isFinite(params.start)) {
    url.searchParams.set("start", String(params.start));
  }
  if (params.siteSearch) {
    url.searchParams.set("siteSearch", params.siteSearch);
  }
  if (params.exactTerms) {
    url.searchParams.set("exactTerms", params.exactTerms);
  }
  if (params.dateRestrict) {
    url.searchParams.set("dateRestrict", params.dateRestrict);
  }

  const controller = new AbortController();
  const timeoutMs = options?.timeoutMs ?? 8000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (options?.signal) {
    if (options.signal.aborted) {
      controller.abort();
    } else {
      options.signal.addEventListener("abort", () => controller.abort(), { once: true });
    }
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), { cache: "no-store", signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    if (response.status === 429) {
      return {
        ok: false,
        status: 429,
        items: [],
        error: "quota_exceeded",
      };
    }

    return {
      ok: false,
      status: response.status,
      items: [],
      error: "google_cse_error",
    };
  }

  let data: {
    items?: GoogleCseItem[];
    searchInformation?: Record<string, unknown>;
    queries?: Record<string, unknown>;
    spelling?: Record<string, unknown>;
  };

  try {
    data = (await response.json()) as typeof data;
  } catch {
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
    queries: data.queries,
    spelling: data.spelling,
  };
}
