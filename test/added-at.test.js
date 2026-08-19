const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  MS_PER_DAY,
  normalizeAddedAt,
  getAddedAt,
  recordAddedAt,
  removeAddedAt,
  mergeAddedAt,
} = require("../scripts/lib/added-at");

const STAMP_A = "2026-01-01T00:00:00.000Z";
const STAMP_B = "2026-06-01T00:00:00.000Z";
const STAMP_END = "2026-08-18T12:00:00.000Z";

function listsWith(...entries) {
  const watched = [];
  const watchlist = [];
  for (const [id, listId] of entries) {
    (listId === "watchlist" ? watchlist : watched).push(id);
  }
  return [
    { id: "watched", name: "Watched", movieIds: watched },
    { id: "watchlist", name: "Watchlist", movieIds: watchlist },
  ];
}

test("recordAddedAt stamps once and ignores later calls", () => {
  let map = {};
  map = recordAddedAt(map, 603, new Date(STAMP_A));
  map = recordAddedAt(map, 603, new Date(STAMP_B));
  assert.equal(getAddedAt(map, 603), STAMP_A);
});

test("recordAddedAt overwrites when readded after a soft delete", () => {
  let map = recordAddedAt({}, 603, new Date(STAMP_A));
  map = recordAddedAt(map, 603, new Date(STAMP_B), { readded: true });
  assert.equal(getAddedAt(map, 603), STAMP_B);
});

test("removeAddedAt drops the stamp", () => {
  let map = recordAddedAt({}, 603, new Date(STAMP_A));
  map = removeAddedAt(map, 603);
  assert.equal(getAddedAt(map, 603), null);
});

test("normalizeAddedAt keeps stamps only for movies still in a list", () => {
  const lists = listsWith([603, "watched"], [604, "watchlist"]);
  const normalized = normalizeAddedAt(
    { 603: STAMP_A, 604: STAMP_B, 999: STAMP_A },
    lists,
    new Date(STAMP_END),
  );
  assert.deepEqual(normalized, { 603: STAMP_A, 604: STAMP_B });
});

test("normalizeAddedAt backfills missing stamps from list order ending today", () => {
  const lists = listsWith([10, "watched"], [20, "watched"], [30, "watchlist"]);
  const endMs = Date.parse(STAMP_END);
  const normalized = normalizeAddedAt({}, lists, new Date(STAMP_END));
  assert.equal(normalized["10"], new Date(endMs - 2 * MS_PER_DAY).toISOString());
  assert.equal(normalized["20"], new Date(endMs - MS_PER_DAY).toISOString());
  assert.equal(normalized["30"], STAMP_END);
});

test("normalizeAddedAt keeps an explicit stamp over a synthetic backfill", () => {
  const lists = listsWith([603, "watched"], [604, "watched"]);
  const normalized = normalizeAddedAt({ 603: STAMP_A }, lists, new Date(STAMP_END));
  assert.equal(normalized["603"], STAMP_A);
  assert.notEqual(normalized["604"], normalized["603"]);
});

test("normalizeAddedAt repairs a collection where every stamp is identical", () => {
  const lists = listsWith([10, "watched"], [20, "watched"], [30, "watched"]);
  const normalized = normalizeAddedAt(
    {
      10: STAMP_END,
      20: STAMP_END,
      30: STAMP_END,
    },
    lists,
    new Date(STAMP_END),
  );
  const endMs = Date.parse(STAMP_END);
  assert.equal(normalized["10"], new Date(endMs - 2 * MS_PER_DAY).toISOString());
  assert.equal(normalized["20"], new Date(endMs - MS_PER_DAY).toISOString());
  assert.equal(normalized["30"], STAMP_END);
});

test("mergeAddedAt keeps the later stamp when both sides have one", () => {
  assert.deepEqual(
    mergeAddedAt({ 603: STAMP_A }, { 603: STAMP_B }),
    { 603: STAMP_B },
  );
});

test("mergeAddedAt preserves a stamp that exists on only one side", () => {
  assert.deepEqual(mergeAddedAt({ 603: STAMP_A }, {}), { 603: STAMP_A });
  assert.deepEqual(mergeAddedAt({}, { 604: STAMP_B }), { 604: STAMP_B });
});
