import type { NextRequest } from "next/server";

export type SearchMode = "mock" | "google";

const normalizeMode = (value?: string | null): SearchMode | null => {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "mock" || normalized === "google") {
    return normalized;
  }
  return null;
};

const parseRoute = (route?: string | null): string => {
  if (!route) return "/";
  try {
    return new URL(route).pathname || "/";
  } catch {
    return route.startsWith("/") ? route : "/";
  }
};

export function resolveSearchMode(params: {
  route?: string | null;
  envMode?: string | null;
}): SearchMode {
  const pathname = parseRoute(params.route);
  const envMode = normalizeMode(params.envMode);
  const mode: SearchMode = envMode ?? "google";

  if (process.env.NODE_ENV !== "production") {
    console.debug(`[search-mode] route=${pathname} mode=${mode}`);
  }

  return mode;
}

export function getSearchModeFromRequest(request: NextRequest): SearchMode {
  const routeHint =
    request.headers.get("x-search-route") ||
    request.headers.get("referer") ||
    request.nextUrl?.pathname ||
    "/";

  return resolveSearchMode({ route: routeHint, envMode: process.env.SEARCH_MODE });
}
