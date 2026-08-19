const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  mergeCustomLists,
  mergeCustomListState,
  listIsDeleted,
} = require("../scripts/lib/custom-list-merge");

const EARLY = "2026-08-19T10:00:00.000Z";
const MID = "2026-08-19T11:00:00.000Z";
const LATE = "2026-08-19T12:00:00.000Z";

function list(id, name, movieIds, updatedAt) {
  return {
    id,
    name,
    movieIds,
    createdAt: EARLY,
    updatedAt,
  };
}

test("mergeCustomLists picks newer updatedAt per list id", () => {
  const left = [list("custom-a", "Left", [1], EARLY)];
  const right = [list("custom-a", "Right", [1, 2], LATE)];
  const merged = mergeCustomLists(left, right, {});
  assert.equal(merged.length, 1);
  assert.equal(merged[0].name, "Right");
  assert.deepEqual(merged[0].movieIds, [1, 2]);
});

test("tombstone newer than list updatedAt drops the list", () => {
  const lists = [list("custom-a", "Gone", [1], EARLY)];
  const tombstones = { "custom-a": LATE };
  assert.equal(listIsDeleted(lists[0], tombstones), true);
  assert.deepEqual(mergeCustomLists(lists, lists, tombstones), []);
});

test("list recreated after delete wins when updatedAt beats tombstone", () => {
  const lists = [list("custom-a", "Back", [3], LATE)];
  const tombstones = { "custom-a": MID };
  assert.equal(listIsDeleted(lists[0], tombstones), false);
  assert.equal(mergeCustomLists(lists, [], tombstones).length, 1);
});

test("mergeCustomListState merges tombstones and lists together", () => {
  const a = {
    customLists: [list("custom-a", "A", [1], EARLY)],
    customListTombstones: { "custom-b": MID },
  };
  const b = {
    customLists: [
      list("custom-a", "A newer", [1, 2], LATE),
      list("custom-b", "B", [], EARLY),
    ],
    customListTombstones: { "custom-b": LATE },
  };
  const merged = mergeCustomListState(a, b);
  assert.equal(merged.customLists.length, 1);
  assert.equal(merged.customLists[0].name, "A newer");
  assert.equal(merged.customListTombstones["custom-b"], LATE);
});
