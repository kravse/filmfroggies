const test = require("node:test");
const assert = require("node:assert/strict");
const {
  normalizeDate, today, normalizeViewingHistory, viewingEntries, latestViewingDate, addViewing,
  updateViewing, removeViewing, mergeViewingHistory,
} = require("../scripts/lib/viewing-history");

const T1 = new Date("2026-01-01T10:00:00.000Z");
const T2 = new Date("2026-02-02T10:00:00.000Z");
const T3 = new Date("2026-03-03T10:00:00.000Z");

test("normalizeDate accepts real calendar dates only", () => {
  assert.equal(normalizeDate("2024-02-29"), "2024-02-29");
  assert.equal(normalizeDate("2025-02-29"), null);
  assert.equal(normalizeDate("02/03/2026"), null);
});

test("today uses the user's local calendar date", () => {
  assert.equal(today(new Date(2026, 7, 19, 23, 30)), "2026-08-19");
});

test("viewings can be added, edited, and tombstoned", () => {
  let history = addViewing({}, 42, "2026-01-01", T1, "a");
  history = addViewing(history, 42, "2026-02-02", T2, "b");
  assert.deepEqual(viewingEntries(history, 42).map((x) => x.watchedOn), ["2026-02-02", "2026-01-01"]);
  assert.equal(latestViewingDate(history, 42), "2026-02-02");
  history = updateViewing(history, 42, "a", "2026-01-03", T3);
  assert.equal(viewingEntries(history, 42).find((x) => x.id === "a").watchedOn, "2026-01-03");
  history = removeViewing(history, 42, "b", T3);
  assert.deepEqual(viewingEntries(history, 42).map((x) => x.id), ["a"]);
  assert.equal(viewingEntries(history, 42, { includeDeleted: true }).length, 2);
});

test("normalization drops malformed movies and entries", () => {
  assert.deepEqual(normalizeViewingHistory({ nope: [], 42: [{ id: "", watchedOn: "2026-01-01", updatedAt: T1.toISOString() }] }), {});
});

test("normalization collapses duplicate active dates but retains tombstones", () => {
  const history = normalizeViewingHistory({
    42: [
      { id: "older", watchedOn: "2026-01-01", updatedAt: T1.toISOString() },
      { id: "newer", watchedOn: "2026-01-01", updatedAt: T2.toISOString() },
      {
        id: "deleted",
        watchedOn: "2026-01-01",
        updatedAt: T2.toISOString(),
        deletedAt: T2.toISOString(),
      },
    ],
  });

  assert.deepEqual(viewingEntries(history, 42).map((entry) => entry.id), ["newer"]);
  assert.deepEqual(
    viewingEntries(history, 42, { includeDeleted: true }).map((entry) => entry.id),
    ["deleted", "newer"],
  );
});

test("merge unions concurrent viewings", () => {
  const left = addViewing({}, 42, "2026-01-01", T1, "a");
  const right = addViewing({}, 42, "2026-02-02", T2, "b");
  assert.deepEqual(viewingEntries(mergeViewingHistory(left, right), 42).map((x) => x.id), ["b", "a"]);
});

test("merge collapses duplicate dates created with different ids", () => {
  const left = addViewing({}, 42, "2026-01-01", T1, "older");
  const right = addViewing({}, 42, "2026-01-01", T2, "newer");
  assert.deepEqual(
    viewingEntries(mergeViewingHistory(left, right), 42).map((entry) => entry.id),
    ["newer"],
  );
});

test("newer edits win and deletions win timestamp ties", () => {
  const original = addViewing({}, 42, "2026-01-01", T1, "a");
  const edited = updateViewing(original, 42, "a", "2026-02-02", T2);
  const removed = removeViewing(original, 42, "a", T2);
  assert.equal(viewingEntries(mergeViewingHistory(original, edited), 42)[0].watchedOn, "2026-02-02");
  assert.deepEqual(viewingEntries(mergeViewingHistory(edited, removed), 42), []);
});

test("equal-time conflicting edits converge in either merge direction", () => {
  const original = addViewing({}, 42, "2026-01-01", T1, "a");
  const early = updateViewing(original, 42, "a", "2026-02-01", T3);
  const late = updateViewing(original, 42, "a", "2026-02-02", T3);
  assert.deepEqual(mergeViewingHistory(early, late), mergeViewingHistory(late, early));
  assert.equal(viewingEntries(mergeViewingHistory(early, late), 42)[0].watchedOn, "2026-02-02");
});

test("add and edit reject future viewing dates", () => {
  const history = addViewing({}, 42, "2027-01-01", T1, "a");
  assert.deepEqual(history, {});
  const existing = addViewing({}, 42, "2026-01-01", T2, "a");
  assert.equal(updateViewing(existing, 42, "a", "2027-01-01", T2), existing);
});
