/**
 * TMDB discover browse: tab ids and page merge.
 */

const DISCOVER_TABS = new Set(["upcoming", "now-playing"]);
const DEFAULT_DISCOVER_TAB = "upcoming";
const DISCOVER_MAX_MOVIES = 50;
const DISCOVER_PAGES = 3;
const DEFAULT_DISCOVER_REGION = "US";
/** Bumped when discover list query semantics change so session memo refreshes. */
const DISCOVER_LIST_CACHE_VERSION = 7;
const NOW_PLAYING_WINDOW_DAYS = 84;
/** Skip obscure listings unless TMDB shows real interest. */
const DISCOVER_MIN_VOTE_COUNT = 10;
const DISCOVER_MIN_POPULARITY = 8;

function normalizeDiscoverTab(raw) {
  const tab = String(raw || "").trim();
  return DISCOVER_TABS.has(tab) ? tab : DEFAULT_DISCOVER_TAB;
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

/** Theatrical releases in region within the recent window, not future dated. */
function isNowPlayingReleaseEntry(entry, todayIso, windowDays = NOW_PLAYING_WINDOW_DAYS) {
  const releaseDate = String(entry?.releaseDate || "").trim();
  if (!releaseDate) {
    return false;
  }
  const releaseTime = Date.parse(releaseDate);
  const todayTime = Date.parse(todayIso);
  const windowStartTime = Date.parse(shiftIsoDate(todayIso, -windowDays));
  if (
    !Number.isFinite(releaseTime) ||
    !Number.isFinite(todayTime) ||
    !Number.isFinite(windowStartTime)
  ) {
    return false;
  }
  return releaseTime <= todayTime && releaseTime >= windowStartTime;
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
  const filterNowPlaying = options.filterNowPlaying === true;
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
      if (filterNowPlaying && todayIso && !isNowPlayingReleaseEntry(entry, todayIso)) {
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

function mergeDiscoverMovieIds(pageResults, options = {}) {
  return mergeDiscoverListEntries(pageResults, options).map((entry) => entry.id);
}

module.exports = {
  DISCOVER_TABS,
  DEFAULT_DISCOVER_TAB,
  DISCOVER_MAX_MOVIES,
  DISCOVER_PAGES,
  DEFAULT_DISCOVER_REGION,
  DISCOVER_LIST_CACHE_VERSION,
  NOW_PLAYING_WINDOW_DAYS,
  DISCOVER_MIN_VOTE_COUNT,
  DISCOVER_MIN_POPULARITY,
  normalizeDiscoverTab,
  todayIsoDate,
  shiftIsoDate,
  isUpcomingReleaseEntry,
  isNowPlayingReleaseEntry,
  isProminentDiscoverEntry,
  mergeDiscoverMovieIds,
  mergeDiscoverListEntries,
};
