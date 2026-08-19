/**
 * User-defined custom lists, separate from Watched/Watchlist preset statuses.
 * A movie may belong to multiple custom lists and optionally to a preset list.
 */

const MAX_CUSTOM_LISTS = 10;
const MAX_NAME_LENGTH = 40;
const MIN_NAME_LENGTH = 1;
const CUSTOM_ID_PREFIX = "custom-";

function getLists() {
  if (typeof appLists !== "undefined") {
    return appLists;
  }
  if (typeof require === "function") {
    return require("./lists");
  }
  throw new Error("appLists is not available");
}

function normalizeStamp(value, fallback) {
  const time = Date.parse(String(value || ""));
  if (Number.isFinite(time)) {
    return new Date(time).toISOString();
  }
  if (fallback) {
    const fallbackTime = Date.parse(String(fallback));
    if (Number.isFinite(fallbackTime)) {
      return new Date(fallbackTime).toISOString();
    }
  }
  return new Date(0).toISOString();
}

function normalizeName(name) {
  return String(name || "").trim();
}

function nameKey(name) {
  return normalizeName(name).toLowerCase();
}

const CUSTOM_LIST_INDEX_SORT_MODES = new Set(["recent", "alphabetical", "size"]);
const DEFAULT_CUSTOM_LIST_INDEX_SORT = "recent";

function normalizeCustomListIndexSort(mode) {
  const value = String(mode || "").trim().toLowerCase();
  return CUSTOM_LIST_INDEX_SORT_MODES.has(value)
    ? value
    : DEFAULT_CUSTOM_LIST_INDEX_SORT;
}

function compareCustomListsForIndex(a, b, mode) {
  if (mode === "alphabetical") {
    const byName = nameKey(a.name).localeCompare(nameKey(b.name));
    if (byName !== 0) {
      return byName;
    }
    return b.updatedAt.localeCompare(a.updatedAt);
  }
  if (mode === "size") {
    const sizeDiff = b.movieIds.length - a.movieIds.length;
    if (sizeDiff !== 0) {
      return sizeDiff;
    }
    return nameKey(a.name).localeCompare(nameKey(b.name));
  }
  const byRecent = b.updatedAt.localeCompare(a.updatedAt);
  if (byRecent !== 0) {
    return byRecent;
  }
  return nameKey(a.name).localeCompare(nameKey(b.name));
}

function sortCustomListsForIndex(customLists, mode) {
  if (!Array.isArray(customLists)) {
    return [];
  }
  const normalizedMode = normalizeCustomListIndexSort(mode);
  return [...customLists].sort((a, b) =>
    compareCustomListsForIndex(a, b, normalizedMode),
  );
}

function isCustomListId(id) {
  return typeof id === "string" && id.startsWith(CUSTOM_ID_PREFIX) && id.length > CUSTOM_ID_PREFIX.length;
}

function normalizeMovieIds(raw) {
  return getLists().normalizeMovieIds(raw);
}

function defaultCustomLists() {
  return [];
}

function defaultCustomListTombstones() {
  return {};
}

function normalizeCustomList(raw, fallbackStamp) {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  if (!isCustomListId(id)) {
    return null;
  }
  const name = normalizeName(raw.name);
  if (name.length < MIN_NAME_LENGTH || name.length > MAX_NAME_LENGTH) {
    return null;
  }
  const stamp = normalizeStamp(raw.updatedAt || raw.createdAt, fallbackStamp);
  return {
    id,
    name,
    movieIds: normalizeMovieIds(raw.movieIds),
    createdAt: normalizeStamp(raw.createdAt, stamp),
    updatedAt: stamp,
  };
}

function normalizeCustomLists(raw, fallbackStamp) {
  if (!Array.isArray(raw)) {
    return [];
  }
  const seenIds = new Set();
  const seenNames = new Set();
  const out = [];
  for (const entry of raw) {
    const list = normalizeCustomList(entry, fallbackStamp);
    if (!list) {
      continue;
    }
    const key = nameKey(list.name);
    if (seenIds.has(list.id) || seenNames.has(key)) {
      continue;
    }
    seenIds.add(list.id);
    seenNames.add(key);
    out.push(list);
    if (out.length >= MAX_CUSTOM_LISTS) {
      break;
    }
  }
  return out;
}

function normalizeCustomListTombstones(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  const out = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!isCustomListId(key)) {
      continue;
    }
    const at = normalizeStamp(value);
    if (at) {
      out[key] = at;
    }
  }
  return out;
}

function findCustomList(customLists, listId) {
  if (!Array.isArray(customLists) || !isCustomListId(listId)) {
    return null;
  }
  return customLists.find((list) => list.id === listId) || null;
}

function customListsForMovie(customLists, movieId) {
  const id = Number(movieId);
  if (!Array.isArray(customLists) || !Number.isInteger(id)) {
    return [];
  }
  return customLists.filter((list) => list.movieIds.includes(id));
}

function isDuplicateName(customLists, name, excludeId) {
  const key = nameKey(name);
  if (!key) {
    return true;
  }
  return customLists.some(
    (list) => list.id !== excludeId && nameKey(list.name) === key,
  );
}

function createCustomListId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${CUSTOM_ID_PREFIX}${crypto.randomUUID()}`;
  }
  const hex = () =>
    Math.floor(Math.random() * 0xffffffff)
      .toString(16)
      .padStart(8, "0");
  return `${CUSTOM_ID_PREFIX}${hex()}${hex()}-${hex()}-${hex()}-${hex()}-${hex()}${hex()}${hex()}`;
}

function createCustomList(customLists, name, now = new Date()) {
  const lists = Array.isArray(customLists) ? customLists : [];
  const trimmed = normalizeName(name);
  if (
    lists.length >= MAX_CUSTOM_LISTS ||
    trimmed.length < MIN_NAME_LENGTH ||
    trimmed.length > MAX_NAME_LENGTH ||
    isDuplicateName(lists, trimmed)
  ) {
    return lists;
  }
  const stamp = now.toISOString();
  return [
    ...lists,
    {
      id: createCustomListId(),
      name: trimmed,
      movieIds: [],
      createdAt: stamp,
      updatedAt: stamp,
    },
  ];
}

function renameCustomList(customLists, listId, name, now = new Date()) {
  const trimmed = normalizeName(name);
  if (
    !isCustomListId(listId) ||
    trimmed.length < MIN_NAME_LENGTH ||
    trimmed.length > MAX_NAME_LENGTH ||
    isDuplicateName(customLists, trimmed, listId)
  ) {
    return customLists;
  }
  const stamp = now.toISOString();
  return customLists.map((list) =>
    list.id === listId ? { ...list, name: trimmed, updatedAt: stamp } : list,
  );
}

function deleteCustomList(customLists, tombstones, listId, now = new Date()) {
  if (!isCustomListId(listId)) {
    return { customLists, tombstones };
  }
  const stamp = now.toISOString();
  return {
    customLists: customLists.filter((list) => list.id !== listId),
    tombstones: {
      ...(tombstones && typeof tombstones === "object" ? tombstones : {}),
      [listId]: stamp,
    },
  };
}

function addMovieToCustomList(customLists, listId, movieId, now = new Date()) {
  const id = Number(movieId);
  if (!isCustomListId(listId) || !Number.isInteger(id) || id <= 0) {
    return customLists;
  }
  const stamp = now.toISOString();
  return customLists.map((list) => {
    if (list.id !== listId || list.movieIds.includes(id)) {
      return list;
    }
    return {
      ...list,
      movieIds: [...list.movieIds, id],
      updatedAt: stamp,
    };
  });
}

function removeMovieFromCustomList(customLists, listId, movieId, now = new Date()) {
  const id = Number(movieId);
  if (!isCustomListId(listId) || !Number.isInteger(id)) {
    return customLists;
  }
  const stamp = now.toISOString();
  return customLists.map((list) => {
    if (list.id !== listId || !list.movieIds.includes(id)) {
      return list;
    }
    return {
      ...list,
      movieIds: list.movieIds.filter((entry) => entry !== id),
      updatedAt: stamp,
    };
  });
}

function replaceCustomListMovieIds(customLists, listId, movieIds, now = new Date()) {
  if (!isCustomListId(listId)) {
    return customLists;
  }
  const stamp = now.toISOString();
  const normalized = normalizeMovieIds(movieIds);
  return customLists.map((list) =>
    list.id === listId ? { ...list, movieIds: normalized, updatedAt: stamp } : list,
  );
}

module.exports = {
  MAX_CUSTOM_LISTS,
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
  CUSTOM_ID_PREFIX,
  isCustomListId,
  normalizeName,
  CUSTOM_LIST_INDEX_SORT_MODES,
  DEFAULT_CUSTOM_LIST_INDEX_SORT,
  normalizeCustomListIndexSort,
  sortCustomListsForIndex,
  defaultCustomLists,
  defaultCustomListTombstones,
  normalizeCustomList,
  normalizeCustomLists,
  normalizeCustomListTombstones,
  findCustomList,
  customListsForMovie,
  isDuplicateName,
  createCustomListId,
  createCustomList,
  renameCustomList,
  deleteCustomList,
  addMovieToCustomList,
  removeMovieFromCustomList,
  replaceCustomListMovieIds,
};
