/**
 * When each movie first entered the collection. Stored beside ratings in user
 * state, never in TMDB records or the data/ snapshot.
 *
 * Set once on add, cleared on remove, and stamped again when a removed movie is
 * re-added. Moving watchlist → watched does not touch it. Sync merges by keeping
 * the later stamp so a re-add beats a stale pre-delete copy left on another device.
 *
 * Legacy payloads with no per-movie stamp are backfilled from list order: the
 * last movie in the list is treated as added today, each earlier one one day
 * before. A collection where every stamp is identical — the old "all today"
 * migration — is repaired the same way on the next normalize.
 */

const MS_PER_DAY = 86_400_000;

function getLists() {
  if (typeof appLists !== "undefined") {
    return appLists;
  }
  if (typeof require === "function") {
    return require("./lists");
  }
  throw new Error("appLists is not available");
}

function parseStamp(value) {
  const time = Date.parse(value || "");
  return Number.isFinite(time) ? time : null;
}

function normalizeStamp(value) {
  const time = parseStamp(value);
  return time == null ? null : new Date(time).toISOString();
}

/** Watched first, then watchlist, each in stored order — same as list export. */
function orderedMovieIds(lists) {
  const ids = [];
  const seen = new Set();
  for (const listId of getLists().LIST_IDS) {
    const list = Array.isArray(lists) ? lists.find((entry) => entry?.id === listId) : null;
    for (const movieId of list?.movieIds || []) {
      const id = Number(movieId);
      if (!Number.isInteger(id) || id <= 0 || seen.has(id)) {
        continue;
      }
      seen.add(id);
      ids.push(id);
    }
  }
  return ids;
}

function stampFromListIndex(index, total, now) {
  const endMs = parseStamp(normalizeStamp(now));
  const daysAgo = Math.max(0, total - 1 - index);
  return new Date(endMs - daysAgo * MS_PER_DAY).toISOString();
}

/** When every movie shares one stamp, spread them by list order so sort works. */
function repairUniformAddedAt(next, ordered, now) {
  if (ordered.length < 2) {
    return next;
  }
  const stamps = ordered.map((id) => next[String(id)]).filter(Boolean);
  if (stamps.length < 2 || new Set(stamps).size !== 1) {
    return next;
  }
  const repaired = {};
  for (let index = 0; index < ordered.length; index++) {
    repaired[String(ordered[index])] = stampFromListIndex(index, ordered.length, now);
  }
  return repaired;
}

function normalizeAddedAt(raw, lists, now = new Date()) {
  const ordered = orderedMovieIds(lists);
  const rawMap = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const next = {};

  for (let index = 0; index < ordered.length; index++) {
    const id = ordered[index];
    const key = String(id);
    const fromRaw = normalizeStamp(rawMap[key]);
    next[key] = fromRaw || stampFromListIndex(index, ordered.length, now);
  }

  return repairUniformAddedAt(next, ordered, now);
}

function getAddedAt(addedAt, movieId) {
  const id = Number(movieId);
  if (!addedAt || typeof addedAt !== "object" || !Number.isInteger(id) || id <= 0) {
    return null;
  }
  return normalizeStamp(addedAt[String(id)]);
}

/** Overwrites only when the stamp actually changes. */
function setAddedAt(addedAt, movieId, at) {
  const id = Number(movieId);
  const stamp = normalizeStamp(at);
  if (!Number.isInteger(id) || id <= 0 || !stamp) {
    return addedAt || {};
  }

  const base =
    addedAt && typeof addedAt === "object" && !Array.isArray(addedAt) ? addedAt : {};
  const key = String(id);
  if (getAddedAt(base, id) === stamp) {
    return base;
  }
  return { ...base, [key]: stamp };
}

/** First add only, unless `readded` — then always stamp again. */
function recordAddedAt(addedAt, movieId, at = new Date(), options = {}) {
  if (!options.readded && getAddedAt(addedAt, movieId)) {
    return addedAt || {};
  }
  return setAddedAt(addedAt, movieId, at);
}

function removeAddedAt(addedAt, movieId) {
  const id = Number(movieId);
  if (!Number.isInteger(id) || id <= 0) {
    return addedAt || {};
  }
  const base =
    addedAt && typeof addedAt === "object" && !Array.isArray(addedAt) ? addedAt : {};
  const key = String(id);
  if (!(key in base)) {
    return base;
  }
  const next = { ...base };
  delete next[key];
  return next;
}

/** Later stamp wins so a re-add after removal beats a stale pre-delete copy. */
function mergeAddedAt(a, b) {
  const left = a && typeof a === "object" && !Array.isArray(a) ? a : {};
  const right = b && typeof b === "object" && !Array.isArray(b) ? b : {};
  const merged = {};

  for (const key of new Set([...Object.keys(left), ...Object.keys(right)])) {
    const leftStamp = normalizeStamp(left[key]);
    const rightStamp = normalizeStamp(right[key]);
    if (leftStamp == null) {
      merged[key] = right[key];
      continue;
    }
    if (rightStamp == null) {
      merged[key] = left[key];
      continue;
    }
    merged[key] = leftStamp >= rightStamp ? left[key] : right[key];
  }
  return merged;
}

module.exports = {
  MS_PER_DAY,
  normalizeStamp,
  orderedMovieIds,
  normalizeAddedAt,
  getAddedAt,
  setAddedAt,
  recordAddedAt,
  removeAddedAt,
  mergeAddedAt,
};
