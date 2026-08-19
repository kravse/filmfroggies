/**
 * Merge for multi-tab and multi-device sync.
 *
 * Every tab holds its own in-memory copy, so a blind "newest payload wins" push
 * lets a tab that has been open for an hour replace everything another tab
 * added. Merging fixes that, but merging on list membership alone cannot work:
 * an id missing from one side is either a movie that side deleted or one it
 * never heard of, and those look identical.
 *
 * So removal is recorded rather than inferred. Every movie carries a status —
 * `watched`, `watchlist`, or `removed` — stamped with the time it last changed,
 * and merging compares those per-movie stamps. Deletion becomes a positive
 * fact, which is what makes it survive a stale tab without needing to track
 * what each copy has already seen.
 *
 * `movieIds` still holds membership and order for everything the UI touches.
 * Removed ids live only in this map, so nothing renders them and TMDB is never
 * asked about them.
 */

const REMOVED_STATUS = "removed";
/** Unknown history sorts oldest, so any real stamp beats a backfilled one. */
const EPOCH_ISO = "1970-01-01T00:00:00.000Z";
/** Bounds the payload: removal records are the only entries that accumulate. */
const REMOVED_LIMIT = 500;

function getLists() {
  if (typeof appLists !== "undefined") {
    return appLists;
  }
  if (typeof require === "function") {
    return require("./lists");
  }
  throw new Error("appLists is not available");
}

function getAddedAt() {
  if (typeof appAddedAt !== "undefined") {
    return appAddedAt;
  }
  if (typeof require === "function") {
    return require("./added-at");
  }
  throw new Error("appAddedAt is not available");
}

function parseStamp(value) {
  const time = Date.parse(value || "");
  return Number.isFinite(time) ? time : null;
}

function normalizeStamp(value) {
  const time = parseStamp(value);
  return time == null ? null : new Date(time).toISOString();
}

/** Returns whichever ISO stamp is later, preferring the one that parses. */
function newerStamp(a, b) {
  const aTime = parseStamp(a);
  const bTime = parseStamp(b);
  if (aTime == null) {
    return bTime == null ? null : b;
  }
  if (bTime == null) {
    return a;
  }
  return bTime > aTime ? b : a;
}

function isStatus(value) {
  return value === REMOVED_STATUS || getLists().isListId(value);
}

function statusEntry(status, at) {
  return { status, at };
}

function statusOf(statuses, movieId) {
  return statuses?.[String(movieId)]?.status || null;
}

function isRemoved(statuses, movieId) {
  return statusOf(statuses, movieId) === REMOVED_STATUS;
}

/**
 * Rebuilds the map against the lists, which stay authoritative for membership
 * while the app is running: an id in a list gets that list's status, an id in no
 * list keeps a removal record, and anything else is dropped. Dropping is safe
 * because a missing entry means "no opinion", and merge keeps the movie.
 */
function normalizeStatuses(raw, lists, fallbackStamp) {
  const listsLib = getLists();
  const fallback = normalizeStamp(fallbackStamp) || EPOCH_ISO;

  const stored = new Map();
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const [key, value] of Object.entries(raw)) {
      const id = Number(key);
      if (!Number.isInteger(id) || id <= 0 || !isStatus(value?.status)) {
        continue;
      }
      stored.set(
        id,
        statusEntry(value.status, normalizeStamp(value?.at) || fallback),
      );
    }
  }

  const next = {};
  const inList = new Set();
  for (const listId of listsLib.LIST_IDS) {
    const list = listsLib.findList(lists, listId);
    for (const entry of list?.movieIds || []) {
      const id = Number(entry);
      if (!Number.isInteger(id) || id <= 0) {
        continue;
      }
      inList.add(id);
      const existing = stored.get(id);
      // A stored status that disagrees with membership is out of date, so the
      // stamp is refreshed too: keeping the old one would let another copy's
      // removal outrank a movie that is demonstrably back in a list.
      const at = existing && existing.status === listId ? existing.at : fallback;
      next[String(id)] = statusEntry(listId, at);
    }
  }

  const removals = [];
  for (const [id, entry] of stored) {
    if (!inList.has(id) && entry.status === REMOVED_STATUS) {
      removals.push([id, entry]);
    }
  }
  removals.sort((a, b) => Date.parse(b[1].at) - Date.parse(a[1].at));
  for (const [id, entry] of removals.slice(0, REMOVED_LIMIT)) {
    next[String(id)] = entry;
  }

  return next;
}

function setMovieStatus(statuses, movieId, status, now = new Date()) {
  const id = Number(movieId);
  const base = statuses && typeof statuses === "object" ? statuses : {};
  if (!Number.isInteger(id) || id <= 0 || !isStatus(status)) {
    return base;
  }
  return {
    ...base,
    [String(id)]: statusEntry(status, now.toISOString()),
  };
}

/**
 * Per-movie last write wins. A tie keeps the movie rather than the removal,
 * because losing a film is the only outcome here that cannot be undone by hand.
 */
function mergeStatuses(a, b) {
  const left = a && typeof a === "object" ? a : {};
  const right = b && typeof b === "object" ? b : {};
  const merged = {};

  for (const key of new Set([...Object.keys(left), ...Object.keys(right)])) {
    const leftEntry = left[key];
    const rightEntry = right[key];
    if (!leftEntry || !rightEntry) {
      merged[key] = leftEntry || rightEntry;
      continue;
    }
    const leftTime = parseStamp(leftEntry.at);
    const rightTime = parseStamp(rightEntry.at);
    if (rightTime != null && (leftTime == null || rightTime > leftTime)) {
      merged[key] = rightEntry;
    } else if (leftTime != null && (rightTime == null || leftTime > rightTime)) {
      merged[key] = leftEntry;
    } else {
      merged[key] = leftEntry.status === REMOVED_STATUS ? rightEntry : leftEntry;
    }
  }

  return merged;
}

function idsFor(state, listId) {
  const list = getLists().findList(state?.lists, listId);
  return Array.isArray(list?.movieIds) ? list.movieIds.map(Number) : [];
}

/**
 * Membership comes from the merged statuses; the old arrays only supply order,
 * newer side first. A movie that changed lists is positioned by wherever it
 * already appeared, which is why every array is offered as a hint.
 */
function orderedIdsForStatus(statuses, listId, orderHints) {
  const wanted = new Set();
  for (const [key, entry] of Object.entries(statuses)) {
    if (entry.status === listId) {
      wanted.add(Number(key));
    }
  }

  const ordered = [];
  const placed = new Set();
  for (const hint of orderHints) {
    for (const id of hint) {
      if (wanted.has(id) && !placed.has(id)) {
        placed.add(id);
        ordered.push(id);
      }
    }
  }
  for (const id of wanted) {
    if (!placed.has(id)) {
      placed.add(id);
      ordered.push(id);
    }
  }
  return ordered;
}

/**
 * Combines two payloads. The result is raw: callers run it through
 * normalizeUserState to re-apply the list invariants.
 */
function mergeUserStates(a, b) {
  if (!a) {
    return b || null;
  }
  if (!b) {
    return a;
  }

  const lists = getLists();
  const aTime = parseStamp(a.updatedAt);
  const bTime = parseStamp(b.updatedAt);
  // Ties and missing stamps keep `a` primary, so the local copy is never
  // demoted by a payload that cannot prove it is newer. This decides display
  // order and preferences only; membership is settled per movie.
  const bWins = bTime != null && (aTime == null || bTime > aTime);
  const primary = bWins ? b : a;
  const secondary = bWins ? a : b;

  // Derived per side rather than trusted: a payload written before statuses
  // existed has none, and reading membership straight from an empty map would
  // merge both lists down to nothing. Backfill stamps come from each side's own
  // `updatedAt`, never from now, or a stale tab would look freshly edited.
  const statuses = mergeStatuses(
    normalizeStatuses(a.statuses, a.lists, a.updatedAt),
    normalizeStatuses(b.statuses, b.lists, b.updatedAt),
  );
  const orderHints = [
    ...lists.LIST_IDS.map((listId) => idsFor(primary, listId)),
    ...lists.LIST_IDS.map((listId) => idsFor(secondary, listId)),
  ];

  return {
    ...primary,
    updatedAt: newerStamp(a.updatedAt, b.updatedAt),
    lists: lists.LIST_IDS.map((listId) => ({
      id: listId,
      movieIds: orderedIdsForStatus(statuses, listId, orderHints),
    })),
    ratings: {
      ...(secondary.ratings && typeof secondary.ratings === "object" ? secondary.ratings : {}),
      ...(primary.ratings && typeof primary.ratings === "object" ? primary.ratings : {}),
    },
    addedAt: getAddedAt().mergeAddedAt(
      secondary.addedAt && typeof secondary.addedAt === "object" ? secondary.addedAt : {},
      primary.addedAt && typeof primary.addedAt === "object" ? primary.addedAt : {},
    ),
    statuses,
  };
}

module.exports = {
  REMOVED_STATUS,
  REMOVED_LIMIT,
  EPOCH_ISO,
  newerStamp,
  statusOf,
  isRemoved,
  normalizeStatuses,
  setMovieStatus,
  mergeStatuses,
  mergeUserStates,
};
