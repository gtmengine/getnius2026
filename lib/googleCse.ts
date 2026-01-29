import type { TabId } from "@/lib/grid-columns";
import {
  buildTabQuery,
  googleSearch,
  type GoogleCseItem,
  type GoogleCseSearchResult,
} from "@/lib/google-search";

export type { GoogleCseItem, GoogleCseSearchResult };
export { buildTabQuery };

export async function googleCseSearch(
  tab: TabId,
  query: string,
  start?: number,
): Promise<GoogleCseSearchResult> {
  return googleSearch({ query: buildTabQuery(tab, query), start, num: 10 });
}
