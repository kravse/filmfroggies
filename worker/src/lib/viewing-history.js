/* Generated from scripts/lib/viewing-history.js — run npm run sync-worker-lib */

/** Per-movie viewing dates with entry-level merge metadata for Gist sync. */

function normalizeDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
    ? value
    : null;
}

function normalizeStamp(value) {
  const time = Date.parse(value || "");
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

function today(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createViewingId(now = new Date()) {
  const random = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
  return `view-${now.getTime().toString(36)}-${random}`;
}

function normalizeEntry(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = String(raw.id || "").trim();
  const watchedOn = normalizeDate(raw.watchedOn);
  const updatedAt = normalizeStamp(raw.updatedAt);
  const deletedAt = normalizeStamp(raw.deletedAt);
  if (!id || !watchedOn || !updatedAt) return null;
  return { id, watchedOn, updatedAt, ...(deletedAt ? { deletedAt } : {}) };
}

function chooseEntry(a, b) {
  if (!a) return b;
  if (!b) return a;
  const aTime = Date.parse(a.deletedAt || a.updatedAt);
  const bTime = Date.parse(b.deletedAt || b.updatedAt);
  if (bTime > aTime) return b;
  if (aTime > bTime) return a;
  if (a.deletedAt && !b.deletedAt) return a;
  if (b.deletedAt && !a.deletedAt) return b;
  // Equal-time concurrent edits must converge regardless of merge direction.
  return b.watchedOn > a.watchedOn ? b : a;
}

/**
 * Normalizing walks every movie in the history. Render paths look one movie up
 * per card and again inside sort comparators, so an unmemoized pass turns a
 * single list paint into O(movies x history). Callers only ever read the result
 * or copy it, so the same object can be shared for a given input reference.
 */
const normalizedHistoryCache = new WeakMap();

function normalizeViewingHistory(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const cached = normalizedHistoryCache.get(raw);
  if (cached) return cached;
  const out = buildNormalizedViewingHistory(raw);
  normalizedHistoryCache.set(raw, out);
  return out;
}

function buildNormalizedViewingHistory(raw) {
  const out = {};
  for (const [key, entries] of Object.entries(raw)) {
    const movieId = Number(key);
    if (!Number.isInteger(movieId) || movieId <= 0 || !Array.isArray(entries)) continue;
    const byId = new Map();
    for (const rawEntry of entries) {
      const entry = normalizeEntry(rawEntry);
      if (entry) byId.set(entry.id, chooseEntry(byId.get(entry.id), entry));
    }
    // A viewing is identified to users by its movie and calendar date. Older
    // imports created fresh random ids for the same date, so a Gist merge could
    // display that viewing more than once. Keep the newest active entry for a
    // date while retaining tombstones, which stop deleted entries from being
    // resurrected by a stale client.
    const activeByDate = new Map();
    const tombstones = [];
    for (const entry of byId.values()) {
      if (entry.deletedAt) {
        tombstones.push(entry);
        continue;
      }
      const existing = activeByDate.get(entry.watchedOn);
      if (
        !existing ||
        entry.updatedAt > existing.updatedAt ||
        (entry.updatedAt === existing.updatedAt && entry.id > existing.id)
      ) {
        activeByDate.set(entry.watchedOn, entry);
      }
    }
    const normalized = [...activeByDate.values(), ...tombstones];
    if (normalized.length) {
      out[String(movieId)] = normalized.sort((a, b) => a.id.localeCompare(b.id));
    }
  }
  return out;
}

function viewingEntries(history, movieId, options = {}) {
  const entries = normalizeViewingHistory(history)[String(Number(movieId))] || [];
  return entries
    .filter((entry) => options.includeDeleted || !entry.deletedAt)
    .sort(
      (a, b) =>
        a.watchedOn.localeCompare(b.watchedOn) ||
        a.updatedAt.localeCompare(b.updatedAt) ||
        a.id.localeCompare(b.id),
    );
}

/** Hot path: read the normalized entries directly rather than sorting a copy. */
function latestViewingDate(history, movieId) {
  const entries = normalizeViewingHistory(history)[String(Number(movieId))];
  if (!entries) {
    return null;
  }
  let latest = null;
  for (const entry of entries) {
    if (entry.deletedAt) {
      continue;
    }
    if (latest === null || entry.watchedOn > latest) {
      latest = entry.watchedOn;
    }
  }
  return latest;
}

function hasActiveViewingOnDate(history, movieId, watchedOn) {
  const date = normalizeDate(watchedOn);
  if (!date) {
    return false;
  }
  return viewingEntries(history, movieId).some((entry) => entry.watchedOn === date);
}

function addViewing(history, movieId, watchedOn, now = new Date(), id = createViewingId(now)) {
  const movie = Number(movieId);
  const date = normalizeDate(watchedOn);
  if (!Number.isInteger(movie) || movie <= 0 || !date || date > today(now) || !id) return history || {};
  const base = normalizeViewingHistory(history);
  const entries = base[String(movie)] || [];
  return { ...base, [String(movie)]: [...entries, { id: String(id), watchedOn: date, updatedAt: now.toISOString() }] };
}

function updateViewing(history, movieId, entryId, watchedOn, now = new Date()) {
  const movie = Number(movieId);
  const date = normalizeDate(watchedOn);
  const base = normalizeViewingHistory(history);
  const entries = base[String(movie)] || [];
  if (!date || date > today(now) || !entries.some((entry) => entry.id === entryId && !entry.deletedAt)) return history || {};
  return { ...base, [String(movie)]: entries.map((entry) => entry.id === entryId ? { id: entry.id, watchedOn: date, updatedAt: now.toISOString() } : entry) };
}

function removeViewing(history, movieId, entryId, now = new Date()) {
  const movie = Number(movieId);
  const base = normalizeViewingHistory(history);
  const entries = base[String(movie)] || [];
  if (!entries.some((entry) => entry.id === entryId && !entry.deletedAt)) return history || {};
  const stamp = now.toISOString();
  return { ...base, [String(movie)]: entries.map((entry) => entry.id === entryId ? { ...entry, updatedAt: stamp, deletedAt: stamp } : entry) };
}

function mergeViewingHistory(a, b) {
  const left = normalizeViewingHistory(a);
  const right = normalizeViewingHistory(b);
  const merged = {};
  for (const movieId of new Set([...Object.keys(left), ...Object.keys(right)])) {
    const byId = new Map();
    for (const entry of [...(left[movieId] || []), ...(right[movieId] || [])]) {
      byId.set(entry.id, chooseEntry(byId.get(entry.id), entry));
    }
    merged[movieId] = [...byId.values()].sort((x, y) => x.id.localeCompare(y.id));
  }
  return normalizeViewingHistory(merged);
}

export { normalizeDate, today, createViewingId, normalizeViewingHistory, viewingEntries, latestViewingDate, hasActiveViewingOnDate, addViewing, updateViewing, removeViewing, mergeViewingHistory };
