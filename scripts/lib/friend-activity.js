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

/** A plus tag starting with "test" marks a throwaway account, e.g. me+test@mail.com. */
function isTestAccountEmail(email) {
  const local = String(email || "").trim().toLowerCase().split("@")[0];
  return local.includes("+test");
}

/** Test accounts see every friend; real accounts never see a test account. */
function isVisibleActivityFriend(viewerEmail, friendEmail) {
  return !isTestAccountEmail(friendEmail) || isTestAccountEmail(viewerEmail);
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
    if (!isVisibleActivityFriend(options.viewerEmail, friend.email)) continue;
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

/** Relative labels for the activity rail; falls back to a short calendar date. */
function formatActivityDateLabel(isoDate, options = {}) {
  const watchedOn = normalizeDate(isoDate);
  if (!watchedOn) return String(isoDate || "");
  const today = normalizeDate(options.today) || new Date().toISOString().slice(0, 10);
  if (watchedOn === today) return "Today";
  const todayMs = Date.parse(`${today}T00:00:00.000Z`);
  const watchedMs = Date.parse(`${watchedOn}T00:00:00.000Z`);
  if (!Number.isFinite(todayMs) || !Number.isFinite(watchedMs)) return watchedOn;
  const dayDiff = Math.round((todayMs - watchedMs) / 86_400_000);
  if (dayDiff === 1) return "Yesterday";
  if (dayDiff > 1 && dayDiff < 7) return `${dayDiff} days ago`;
  if (dayDiff >= 7 && dayDiff < 14) return "Last week";
  const date = new Date(`${watchedOn}T00:00:00`);
  if (!Number.isFinite(date.getTime())) return watchedOn;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

module.exports = {
  DEFAULT_ACTIVITY_LIMIT,
  MAX_ACTIVITY_LIMIT,
  normalizeActivityLimit,
  isTestAccountEmail,
  isVisibleActivityFriend,
  friendActivityItems,
  formatActivityDateLabel,
};
