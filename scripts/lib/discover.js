/**
 * TMDB discover browse: tab ids and page merge.
 */

const DISCOVER_TABS = new Set(["upcoming", "now-playing"]);
const DEFAULT_DISCOVER_TAB = "upcoming";
const DISCOVER_DEFAULT_PAGE = 1;
const DISCOVER_MAX_MOVIES = 50;
/** Fixed discover columns: 4 on wide viewports, 2 on mobile (see discover.css). */
const DISCOVER_GRID_COLUMNS = 4;
const DISCOVER_GRID_COLUMNS_MOBILE = 2;
/** lcm(2, 4) — page sizes aligned to this fill both grids without a trailing orphan. */
const DISCOVER_PAGE_COMPLETE_UNIT = 4;
const DEFAULT_DISCOVER_REGION = "US";
/** Bumped when discover list query semantics change so session memo refreshes. */
const DISCOVER_LIST_CACHE_VERSION = 25;
/** Skip obscure listings unless TMDB shows real interest. */
const DISCOVER_MIN_VOTE_COUNT = 10;
const DISCOVER_MIN_POPULARITY = 8;

function normalizeDiscoverTab(raw) {
  const tab = String(raw || "").trim();
  return DISCOVER_TABS.has(tab) ? tab : DEFAULT_DISCOVER_TAB;
}

function normalizeDiscoverPage(raw, options = {}) {
  const page = Math.floor(Number(raw));
  if (!Number.isFinite(page) || page < 1) {
    return DISCOVER_DEFAULT_PAGE;
  }
  const maxPages = options.maxPages;
  if (Number.isInteger(maxPages) && maxPages > 0 && page > maxPages) {
    return maxPages;
  }
  return page;
}

function buildDiscoverHash(tab, page) {
  const normalizedTab = normalizeDiscoverTab(tab);
  const normalizedPage = normalizeDiscoverPage(page);
  if (normalizedPage <= 1) {
    return `#discover/${normalizedTab}`;
  }
  return `#discover/${normalizedTab}/${normalizedPage}`;
}

function parseDiscoverHash(hash) {
  const match = /^#discover\/(upcoming|now-playing)(?:\/(\d+))?$/.exec(String(hash || ""));
  if (!match) {
    return null;
  }
  return {
    tab: normalizeDiscoverTab(match[1]),
    page: normalizeDiscoverPage(match[2]),
  };
}

function normalizeDiscoverListMeta(payload) {
  const page = normalizeDiscoverPage(payload?.page);
  const totalPagesRaw = Math.floor(Number(payload?.total_pages));
  const totalPages = Number.isInteger(totalPagesRaw) && totalPagesRaw >= 1 ? totalPagesRaw : 1;
  const totalResultsRaw = Math.floor(Number(payload?.total_results));
  const totalResults =
    Number.isInteger(totalResultsRaw) && totalResultsRaw >= 0 ? totalResultsRaw : 0;
  return { page, totalPages, totalResults };
}

function todayIsoDate(date = new Date()) {
  const value = date instanceof Date ? date : new Date(date);
  return value.toISOString().slice(0, 10);
}

function shiftIsoDate(isoDate, dayOffset) {
  const value = new Date(`${isoDate}T00:00:00.000Z`);
  if (Number.isNaN(value.getTime())) {
    throw new Error("Invalid date");
  }
  value.setUTCDate(value.getUTCDate() + dayOffset);
  return value.toISOString().slice(0, 10);
}

/** Keep TBA rows; drop titles whose list release date is already past. */
function isUpcomingReleaseEntry(entry, todayIso) {
  const releaseDate = String(entry?.releaseDate || "").trim();
  if (!releaseDate) {
    return true;
  }
  const releaseTime = Date.parse(releaseDate);
  const todayTime = Date.parse(todayIso);
  if (!Number.isFinite(releaseTime) || !Number.isFinite(todayTime)) {
    return false;
  }
  return releaseTime >= todayTime;
}

function isProminentDiscoverEntry(entry, options = {}) {
  const minVotes = options.minVoteCount ?? DISCOVER_MIN_VOTE_COUNT;
  const minPopularity = options.minPopularity ?? DISCOVER_MIN_POPULARITY;
  const votes = Number(entry?.voteCount) || 0;
  const popularity = Number(entry?.popularity) || 0;
  return votes >= minVotes || popularity >= minPopularity;
}

function mergeDiscoverListEntries(pageResults, options = {}) {
  const max = options.max ?? DISCOVER_MAX_MOVIES;
  const filterUpcoming = options.filterUpcoming === true;
  const filterProminent = options.filterProminent === true;
  const todayIso = options.todayIso;
  const seen = new Set();
  const entries = [];
  for (const page of pageResults) {
    if (!Array.isArray(page)) {
      continue;
    }
    for (const entry of page) {
      if (filterProminent && !isProminentDiscoverEntry(entry, options)) {
        continue;
      }
      if (filterUpcoming && todayIso && !isUpcomingReleaseEntry(entry, todayIso)) {
        continue;
      }
      const id = Number(entry?.id);
      if (!Number.isInteger(id) || id <= 0 || seen.has(id)) {
        continue;
      }
      seen.add(id);
      entries.push(entry);
      if (entries.length >= max) {
        return entries;
      }
    }
  }
  return entries;
}

function filterDiscoverPageEntries(pageResults, options = {}) {
  if (!Array.isArray(pageResults)) {
    return [];
  }
  const entries = mergeDiscoverListEntries([pageResults], {
    ...options,
    max: Number.MAX_SAFE_INTEGER,
  });
  return trimDiscoverPageToGrid(entries, options);
}

/**
 * Largest count <= n that fills complete rows on both 2- and 4-column discover grids.
 * Uses 4 (lcm of 2 and 4) when possible; smaller pages fall back to min(⌊n/4⌋×4, ⌊n/2⌋×2).
 */
function discoverCompleteCount(count) {
  if (!Number.isInteger(count) || count <= 0) {
    return 0;
  }
  const byUnit = Math.floor(count / DISCOVER_PAGE_COMPLETE_UNIT) * DISCOVER_PAGE_COMPLETE_UNIT;
  if (byUnit > 0) {
    return byUnit;
  }
  const byDesktop = Math.floor(count / DISCOVER_GRID_COLUMNS) * DISCOVER_GRID_COLUMNS;
  const byMobile = Math.floor(count / DISCOVER_GRID_COLUMNS_MOBILE) * DISCOVER_GRID_COLUMNS_MOBILE;
  const byBoth = Math.min(byDesktop, byMobile);
  return byBoth > 0 ? byBoth : count;
}

/**
 * Drop trailing incomplete rows on non-final pages so the grid never ends with
 * a lone movie. The last TMDB page keeps whatever count remains.
 */
function trimDiscoverPageToGrid(entries, options = {}) {
  if (!Array.isArray(entries) || options.isLastPage) {
    return entries;
  }
  const completeCount = discoverCompleteCount(entries.length);
  if (completeCount === 0 || completeCount >= entries.length) {
    return entries;
  }
  return entries.slice(0, completeCount);
}

function mergeDiscoverMovieIds(pageResults, options = {}) {
  return mergeDiscoverListEntries(pageResults, options).map((entry) => entry.id);
}

module.exports = {
  DISCOVER_TABS,
  DEFAULT_DISCOVER_TAB,
  DISCOVER_DEFAULT_PAGE,
  DISCOVER_MAX_MOVIES,
  DISCOVER_GRID_COLUMNS,
  DISCOVER_GRID_COLUMNS_MOBILE,
  DISCOVER_PAGE_COMPLETE_UNIT,
  DEFAULT_DISCOVER_REGION,
  DISCOVER_LIST_CACHE_VERSION,
  DISCOVER_MIN_VOTE_COUNT,
  DISCOVER_MIN_POPULARITY,
  normalizeDiscoverTab,
  normalizeDiscoverPage,
  buildDiscoverHash,
  parseDiscoverHash,
  normalizeDiscoverListMeta,
  todayIsoDate,
  shiftIsoDate,
  isUpcomingReleaseEntry,
  isProminentDiscoverEntry,
  mergeDiscoverMovieIds,
  mergeDiscoverListEntries,
  filterDiscoverPageEntries,
  trimDiscoverPageToGrid,
  discoverCompleteCount,
};
