/**
 * Gist merge for custom lists: per-list last-write-wins on updatedAt, with
 * tombstones for deleted lists.
 */

function getCustomLists() {
  if (typeof appCustomLists !== "undefined") {
    return appCustomLists;
  }
  if (typeof require === "function") {
    return require("./custom-lists");
  }
  throw new Error("appCustomLists is not available");
}

function getSyncMerge() {
  if (typeof appSyncMerge !== "undefined") {
    return appSyncMerge;
  }
  if (typeof require === "function") {
    return require("./sync-merge");
  }
  throw new Error("appSyncMerge is not available");
}

function parseStamp(value) {
  const time = Date.parse(String(value || ""));
  return Number.isFinite(time) ? time : null;
}

function listIsDeleted(list, tombstones) {
  const deletedAt = parseStamp(tombstones?.[list.id]);
  const updatedAt = parseStamp(list.updatedAt);
  if (deletedAt == null) {
    return false;
  }
  if (updatedAt == null) {
    return true;
  }
  return deletedAt >= updatedAt;
}

function mergeCustomListTombstones(a, b) {
  const left = getCustomLists().normalizeCustomListTombstones(a);
  const right = getCustomLists().normalizeCustomListTombstones(b);
  const merged = { ...left };
  for (const [id, at] of Object.entries(right)) {
    merged[id] = getSyncMerge().newerStamp(merged[id], at) || at;
  }
  return merged;
}

function pickListWinner(left, right) {
  const leftTime = parseStamp(left?.updatedAt);
  const rightTime = parseStamp(right?.updatedAt);
  if (rightTime != null && (leftTime == null || rightTime > leftTime)) {
    return right;
  }
  return left;
}

function mergeCustomLists(aLists, bLists, tombstones) {
  const customLists = getCustomLists();
  const left = customLists.normalizeCustomLists(aLists);
  const right = customLists.normalizeCustomLists(bLists);
  const byId = new Map();

  for (const list of [...left, ...right]) {
    const existing = byId.get(list.id);
    byId.set(list.id, existing ? pickListWinner(existing, list) : list);
  }

  const merged = [];
  for (const list of byId.values()) {
    if (listIsDeleted(list, tombstones)) {
      continue;
    }
    merged.push(list);
  }

  merged.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return merged.slice(0, customLists.MAX_CUSTOM_LISTS);
}

function mergeCustomListState(a, b) {
  const tombstones = mergeCustomListTombstones(
    a?.customListTombstones,
    b?.customListTombstones,
  );
  const customLists = mergeCustomLists(a?.customLists, b?.customLists, tombstones);
  return { customLists, customListTombstones: tombstones };
}

module.exports = {
  mergeCustomListTombstones,
  mergeCustomLists,
  mergeCustomListState,
  listIsDeleted,
};
