import type { GoogleCseItem } from "../google-search";

export type NormalizedSearchRow = {
  id: string;
  title: string;
  url: string;
  source: string;
  snippet: string;
  tab?: string;
  [key: string]: unknown;
};

type NormalizeOptions = {
  tab?: string;
};

const safeText = (value?: string) => value?.trim() ?? "";

const highTrustDomains = new Set([
  "reuters.com",
  "ft.com",
  "wsj.com",
  "bloomberg.com",
  "techcrunch.com",
  "theverge.com",
  "wired.com",
  "bbc.co.uk",
  "nytimes.com",
  "economist.com",
]);

const normalizeDomain = (source: string) => {
  const trimmed = source.trim().toLowerCase();
  if (!trimmed) return "";
  const withoutProtocol = trimmed.replace(/^https?:\/\//, "");
  const withoutPath = withoutProtocol.split("/")[0] ?? "";
  const withoutPort = withoutPath.split(":")[0] ?? "";
  return withoutPort.replace(/^www\./, "");
};

const computeTrustScoreFromSource = (source: string) => {
  const domain = normalizeDomain(source);
  if (!domain) return 0;
  for (const trusted of highTrustDomains) {
    if (domain === trusted || domain.endsWith(`.${trusted}`)) {
      return 9.0;
    }
  }
  return 5;
};

const extractDate = (text: string) => {
  const candidates = [
    /\b\d{4}-\d{2}-\d{2}\b/,
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/,
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/i,
  ];

  for (const pattern of candidates) {
    const match = text.match(pattern);
    if (match) return match[0];
  }

  return "";
};

const cleanPeopleTitle = (title: string) =>
  title
    .replace(/\s*[-|]\s*LinkedIn.*$/i, "")
    .replace(/\s*[-|]\s*Twitter.*$/i, "")
    .replace(/\s*[-|]\s*X\.com.*$/i, "")
    .replace(/\s*[-|]\s*X\s*$/i, "")
    .trim();

const extractPersonName = (title: string) => {
  const cleaned = cleanPeopleTitle(title);
  const parts = cleaned.split("|")[0]?.split(" - ") ?? [];
  return (parts[0] || cleaned).trim();
};

const extractCompanyFromTitle = (title: string) => {
  const cleaned = cleanPeopleTitle(title);
  const parts = cleaned.split(" - ").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return parts[parts.length - 1];
  }
  return "";
};

const extractAuthors = (text: string) => {
  const match = text.match(/(?:by|authors?:)\s+([^.|-]{3,})/i);
  if (match) return match[1].trim();
  return "";
};

export function normalizeCseItems(items: GoogleCseItem[], options: NormalizeOptions = {}): NormalizedSearchRow[] {
  const tab = options.tab;
  const now = Date.now();

  return items.map((item, index) => {
    const title = safeText(item.title);
    const url = safeText(item.link);
    const source = safeText(item.displayLink);
    const snippet = safeText(item.snippet);
    const dateGuess = extractDate(`${title} ${snippet}`);

    const base: NormalizedSearchRow = {
      id: `cse-${now}-${index}`,
      title,
      url,
      source,
      snippet,
      tab,
    };

    switch (tab) {
      case "companies":
        return {
          ...base,
          name: title,
          description: snippet,
          website: url,
          sourceDomain: source,
          location: "",
          founded: "",
          employees: "",
          status: "Pending",
          revenue: "",
          people: 0,
          news: 0,
          matchStatus: null,
        };
      case "people": {
        const personName = extractPersonName(title);
        const companyName = source || extractCompanyFromTitle(title);
        return {
          ...base,
          name: personName || title,
          company: companyName,
          role: "",
          location: "",
          email: "",
          matchStatus: null,
          intents: 0,
        };
      }
      case "news":
        return {
          ...base,
          summary: snippet,
          company: "",
          date: dateGuess,
          trustScore: computeTrustScoreFromSource(source),
          matchStatus: null,
        };
      case "signals":
        return {
          ...base,
          signalType: "Signal",
          person: "",
          company: "",
          date: dateGuess,
          confidence: "Pending",
          description: snippet,
          source: url,
        };
      case "market":
        return {
          ...base,
          publisher: source,
          date: dateGuess,
          region: "",
          category: "",
          pages: "",
        };
      case "patents":
        return {
          ...base,
          type: "Patent",
          inventor: "",
          company: "",
          dateFiled: dateGuess,
          status: "Pending",
        };
      case "research-papers": {
        const authors = extractAuthors(`${title} ${snippet}`);
        return {
          ...base,
          authors,
          journal: "",
          publicationDate: "",
          citations: "",
          field: "",
        };
      }
      default:
        return base;
    }
  });
}
