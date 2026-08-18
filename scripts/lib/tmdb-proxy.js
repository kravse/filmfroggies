/**
 * Allowlisted TMDB proxy paths for the Netlify function. Only query keys the
 * app already uses are forwarded; pathname must match a fixed pattern.
 */

const TMDB_API_BASE = "https://api.themoviedb.org/3";

const ALLOWED_PATH_PATTERNS = [
  /^\/configuration$/,
  /^\/search\/movie$/,
  /^\/movie\/([1-9]\d*)$/,
];

const ALLOWED_QUERY_KEYS = new Set([
  "query",
  "language",
  "page",
  "include_adult",
  "append_to_response",
]);

function isAllowedPathname(pathname) {
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

function buildProxiedTmdbUrl(pathname, searchParams) {
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

function parseProxyRequestQuery(query) {
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

module.exports = {
  TMDB_API_BASE,
  ALLOWED_PATH_PATTERNS,
  ALLOWED_QUERY_KEYS,
  isAllowedPathname,
  normalizeSearchParams,
  buildProxiedTmdbUrl,
  parseProxyRequestQuery,
};
