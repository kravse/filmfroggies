/** Read-only aggregation for the accepted-friends activity rail. */

const DEFAULT_ACTIVITY_LIMIT = 20;
const MAX_ACTIVITY_LIMIT = 50;

function normalizeActivityLimit(value, fallback = DEFAULT_ACTIVITY_LIMIT) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, MAX_ACTIVITY_LIMIT);
}

function normalizeRating(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 10) return null;
  return Math.round(parsed * 10) / 10;
}

function normalizeDate(value) {
  const text = String(value || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const date = new Date(`${text}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === text ? text : null;
}

function friendActivityItems(friends, options = {}) {
  const limit = normalizeActivityLimit(options.limit);
  const latestDate = normalizeDate(options.today) || new Date().toISOString().slice(0, 10);
  const items = [];
  for (const friend of Array.isArray(friends) ? friends : []) {
    const friendId = Number(friend?.id);
    const displayName = String(friend?.displayName || "").trim();
    const doc = friend?.doc;
    if (!Number.isInteger(friendId) || friendId <= 0 || !displayName || !doc || typeof doc !== "object") {
      continue;
    }
    const ratings = doc.ratings && typeof doc.ratings === "object" ? doc.ratings : {};
    const history = doc.viewingHistory;
    if (!history || typeof history !== "object" || Array.isArray(history)) continue;
    for (const [rawMovieId, rawEntries] of Object.entries(history)) {
      const movieId = Number(rawMovieId);
      if (!Number.isInteger(movieId) || movieId <= 0 || !Array.isArray(rawEntries)) continue;
      const activeByDate = new Map();
      for (const entry of rawEntries) {
        const watchedOn = normalizeDate(entry?.watchedOn);
        const updatedAt = Number.isFinite(Date.parse(entry?.updatedAt || ""))
          ? new Date(entry.updatedAt).toISOString()
          : null;
        if (!entry?.id || !watchedOn || watchedOn > latestDate || !updatedAt || entry.deletedAt) continue;
        const current = activeByDate.get(watchedOn);
        if (!current || updatedAt > current.updatedAt || (updatedAt === current.updatedAt && String(entry.id) > current.entryId)) {
          activeByDate.set(watchedOn, { entryId: String(entry.id), watchedOn, updatedAt });
        }
      }
      for (const entry of activeByDate.values()) {
        items.push({
          ...entry,
          movieId,
          friend: { id: friendId, displayName },
          rating: normalizeRating(ratings[String(movieId)]),
        });
      }
    }
  }
  return items
    .sort((a, b) =>
      b.watchedOn.localeCompare(a.watchedOn) ||
      b.updatedAt.localeCompare(a.updatedAt) ||
      a.friend.id - b.friend.id ||
      a.movieId - b.movieId ||
      a.entryId.localeCompare(b.entryId),
    )
    .slice(0, limit);
}

module.exports = {
  DEFAULT_ACTIVITY_LIMIT,
  MAX_ACTIVITY_LIMIT,
  normalizeActivityLimit,
  friendActivityItems,
};
