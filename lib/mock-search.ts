import type { TabId } from "@/lib/grid-columns";
import type { GoogleCseItem } from "@/lib/googleCse";
import { sampleDataMap } from "@/lib/sample-data";

const toDisplayLink = (value?: string) => {
  if (!value) return "example.com";
  const withoutProtocol = value.replace(/^https?:\/\//, "");
  const domain = withoutProtocol.split("/")[0] ?? "";
  return domain.includes(".") ? domain : "example.com";
};

const makeUniqueLink = (baseLink: string, index: number, query?: string) => {
  const suffix = `mock=${index + 1}${query ? `&q=${encodeURIComponent(query)}` : ""}`;
  if (!baseLink) return `https://example.com/?${suffix}`;
  return baseLink.includes("?") ? `${baseLink}&${suffix}` : `${baseLink}?${suffix}`;
};

const appendMockSuffix = (value: string, index: number) =>
  value ? `${value} (Mock #${index + 1})` : `Mock #${index + 1}`;

export const buildMockCseItemsForTab = (
  tab: TabId,
  count: number,
  query?: string,
): GoogleCseItem[] => {
  const rows = sampleDataMap[tab] ?? [];
  const safeCount = Math.max(0, count);

  return Array.from({ length: safeCount }, (_, index) => {
    const row = rows.length ? rows[index % rows.length] : {};
    switch (tab) {
      case "companies": {
        const title = row.name ?? `Company ${index + 1}`;
        const link = "https://example.com/company";
        return {
          title: appendMockSuffix(title, index),
          snippet: row.description ?? "Sample company description.",
          link: makeUniqueLink(link, index, query),
          displayLink: "example.com",
        };
      }
      case "people": {
        const title = `${row.name ?? "Person"} - ${row.company ?? "Company"}`;
        const link = "https://linkedin.com/in/sample";
        return {
          title: appendMockSuffix(title, index),
          snippet: row.role ?? "Sample role",
          link: makeUniqueLink(link, index, query),
          displayLink: "linkedin.com",
        };
      }
      case "news": {
        const title = row.title ?? `News ${index + 1}`;
        const link = "https://example.com/news";
        return {
          title: appendMockSuffix(title, index),
          snippet: row.summary ?? "Sample news summary.",
          link: makeUniqueLink(link, index, query),
          displayLink: toDisplayLink(row.source),
        };
      }
      case "signals": {
        const title = `${row.signalType ?? "Signal"}: ${row.company ?? "Company"}`;
        const link = row.source ?? "https://example.com/signal";
        return {
          title: appendMockSuffix(title, index),
          snippet: row.description ?? "Sample signal description.",
          link: makeUniqueLink(link, index, query),
          displayLink: toDisplayLink(row.source),
        };
      }
      case "market": {
        const title = row.title ?? `Market Report ${index + 1}`;
        const link = "https://example.com/report";
        return {
          title: appendMockSuffix(title, index),
          snippet: `${row.publisher ?? "Publisher"} ${row.category ?? ""}`.trim(),
          link: makeUniqueLink(link, index, query),
          displayLink: toDisplayLink(row.publisher),
        };
      }
      case "patents": {
        const title = row.title ?? `Patent ${index + 1}`;
        const link = "https://example.com/patent";
        return {
          title: appendMockSuffix(title, index),
          snippet: `${row.company ?? ""} ${row.inventor ?? ""}`.trim(),
          link: makeUniqueLink(link, index, query),
          displayLink: "example.com",
        };
      }
      case "research-papers": {
        const title = row.title ?? `Research Paper ${index + 1}`;
        const link = "https://example.com/paper";
        return {
          title: appendMockSuffix(title, index),
          snippet: `${row.authors ?? ""} ${row.journal ?? ""}`.trim(),
          link: makeUniqueLink(link, index, query),
          displayLink: toDisplayLink(row.journal),
        };
      }
      default: {
        const link = "https://example.com";
        return {
          title: appendMockSuffix(`Result ${index + 1}`, index),
          snippet: "Sample result",
          link: makeUniqueLink(link, index, query),
          displayLink: "example.com",
        };
      }
    }
  });
};

const makeMockEmail = (email: string | undefined, index: number) => {
  if (!email) return `mock${index + 1}@example.com`;
  const [local, domain] = email.split("@");
  if (!domain) return `${email}+mock${index + 1}`;
  return `${local}+mock${index + 1}@${domain}`;
};

const withMockTitle = (value: string | undefined, index: number) =>
  appendMockSuffix(value ?? "", index);

export const buildMockRowsForTab = (tab: TabId, count: number, query?: string) => {
  const rows = sampleDataMap[tab] ?? [];
  const safeCount = Math.max(0, count);
  return Array.from({ length: safeCount }, (_, index) => {
    const row = rows.length ? rows[index % rows.length] : {};
    const baseId = `${tab}-${index + 1}`;
    switch (tab) {
      case "companies":
        return {
          ...row,
          id: baseId,
          name: withMockTitle(row.name, index),
        };
      case "people":
        return {
          ...row,
          id: baseId,
          name: withMockTitle(row.name, index),
          email: makeMockEmail(row.email, index),
        };
      case "news":
        return {
          ...row,
          id: baseId,
          title: withMockTitle(row.title, index),
          summary: row.summary
            ? `${row.summary} (Mock #${index + 1})`
            : `Mock summary #${index + 1}`,
        };
      case "signals":
        return {
          ...row,
          id: baseId,
          signalType: withMockTitle(row.signalType, index),
          source: makeUniqueLink(row.source ?? "https://example.com/signal", index, query),
        };
      case "market":
        return {
          ...row,
          id: baseId,
          title: withMockTitle(row.title, index),
        };
      case "patents":
        return {
          ...row,
          id: baseId,
          title: withMockTitle(row.title, index),
        };
      case "research-papers":
        return {
          ...row,
          id: baseId,
          title: withMockTitle(row.title, index),
        };
      default:
        return {
          ...row,
          id: baseId,
        };
    }
  });
};

export const mockSearchInformation = (items: GoogleCseItem[]) => ({
  totalResults: String(items.length),
  formattedTotalResults: String(items.length),
  searchTime: 0.01,
});
