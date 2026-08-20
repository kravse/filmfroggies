/**
 * Allowlisted TMDB proxy paths. Mirrors scripts/lib/tmdb-proxy.js for the Worker.
 */

export const TMDB_API_BASE = "https://api.themoviedb.org/3";
export const TMDB_REQUEST_TIMEOUT_MS = 12_000;

export const ALLOWED_PATH_PATTERNS = [
  /^\/configuration$/,
  /^\/search\/movie$/,
  /^\/search\/person$/,
  /^\/discover\/movie$/,
  /^\/movie\/upcoming$/,
  /^\/movie\/now_playing$/,
  /^\/movie\/([1-9]\d*)$/,
  /^\/person\/([1-9]\d+)\/movie_credits$/,
];

export const ALLOWED_QUERY_KEYS = new Set([
  "query",
  "language",
  "page",
  "include_adult",
  "append_to_response",
  "region",
  "sort_by",
  "include_video",
  "primary_release_date.gte",
  "primary_release_date.lte",
  "release_date.gte",
  "release_date.lte",
  "with_release_type",
  "with_original_language",
  "vote_count.gte",
]);

export function isAllowedPathname(pathname) {
  const path = String(pathname || "");
  return ALLOWED_PATH_PATTERNS.some((pattern) => pattern.test(path));
}

function normalizeSearchParams(raw) {
  const params = new URLSearchParams();
  if (!raw || typeof raw !== "object") {
    return params;
  }
  for (const [key, value] of Object.entries(raw)) {
    if (!ALLOWED_QUERY_KEYS.has(key)) {
      continue;
    }
    if (value != null && value !== "") {
      params.set(key, String(value));
    }
  }
  return params;
}

export function buildProxiedTmdbUrl(pathname, searchParams) {
  const path = String(pathname || "");
  if (!isAllowedPathname(path)) {
    throw new Error(`TMDB path not allowed: ${path}`);
  }
  const url = new URL(`${TMDB_API_BASE}${path}`);
  const params = normalizeSearchParams(searchParams);
  for (const [key, value] of params.entries()) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

export function parseProxyRequestQuery(query) {
  const pathname = String(query?.path || "");
  if (!pathname.startsWith("/")) {
    throw new Error("path must start with /");
  }
  const searchParams = {};
  for (const key of ALLOWED_QUERY_KEYS) {
    if (query[key] != null && query[key] !== "") {
      searchParams[key] = query[key];
    }
  }
  return { pathname, searchParams };
}

export function tmdbCacheControl(pathname) {
  if (pathname === "/configuration") {
    return "public, max-age=86400";
  }
  return null;
}
