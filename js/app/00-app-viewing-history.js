/* Generated from scripts/lib/viewing-history.js — run npm run bundle */

const appViewingHistory = (function () {
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

  function normalizeViewingHistory(raw) {
    const out = {};
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
    for (const [key, entries] of Object.entries(raw)) {
      const movieId = Number(key);
      if (!Number.isInteger(movieId) || movieId <= 0 || !Array.isArray(entries)) continue;
      const byId = new Map();
      for (const rawEntry of entries) {
        const entry = normalizeEntry(rawEntry);
        if (entry) byId.set(entry.id, chooseEntry(byId.get(entry.id), entry));
      }
      if (byId.size) out[String(movieId)] = [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
    }
    return out;
  }

  function viewingEntries(history, movieId, options = {}) {
    const entries = normalizeViewingHistory(history)[String(Number(movieId))] || [];
    return entries
      .filter((entry) => options.includeDeleted || !entry.deletedAt)
      .sort((a, b) => b.watchedOn.localeCompare(a.watchedOn) || b.updatedAt.localeCompare(a.updatedAt));
  }

  function latestViewingDate(history, movieId) {
    return viewingEntries(history, movieId)[0]?.watchedOn || null;
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
    return merged;
  }

  return {
    normalizeDate,
    today,
    createViewingId,
    normalizeViewingHistory,
    viewingEntries,
    latestViewingDate,
    addViewing,
    updateViewing,
    removeViewing,
    mergeViewingHistory,
  };
})();
