const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  MAX_CUSTOM_LISTS,
  MAX_CUSTOM_LIST_MOVIES,
  isCustomListId,
  defaultCustomLists,
  normalizeCustomLists,
  normalizeCustomListTombstones,
  normalizeCustomListIndexSort,
  normalizePinnedCustomListId,
  sortCustomListsForIndex,
  togglePinnedCustomListId,
  findCustomList,
  customListsForMovie,
  isDuplicateName,
  createCustomList,
  renameCustomList,
  deleteCustomList,
  addMovieToCustomList,
  removeMovieFromCustomList,
  isCustomListAtMovieCap,
  canAddMovieToCustomList,
} = require("../scripts/lib/custom-lists");

const NOW = new Date("2026-08-19T12:00:00.000Z");
const LATER = new Date("2026-08-19T13:00:00.000Z");

function seedList(id, name, movieIds = []) {
  return {
    id,
    name,
    movieIds,
    createdAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
  };
}

test("isCustomListId accepts custom- prefix only", () => {
  assert.equal(isCustomListId("custom-abc"), true);
  assert.equal(isCustomListId("watched"), false);
  assert.equal(isCustomListId("custom-"), false);
});

test("createCustomList enforces max count and unique names", () => {
  let lists = defaultCustomLists();
  for (let i = 0; i < MAX_CUSTOM_LISTS; i += 1) {
    lists = createCustomList(lists, `List ${i}`, NOW);
  }
  assert.equal(lists.length, MAX_CUSTOM_LISTS);
  assert.equal(createCustomList(lists, "One too many", NOW), lists);
  assert.equal(createCustomList(lists, "List 0", NOW), lists);
  assert.equal(createCustomList(lists, "  list 0  ", NOW), lists);
});

test("rename and delete update timestamps and tombstones", () => {
  const lists = createCustomList(defaultCustomLists(), "Sci-Fi", NOW);
  const id = lists[0].id;
  const renamed = renameCustomList(lists, id, "Science Fiction", LATER);
  assert.equal(findCustomList(renamed, id).name, "Science Fiction");
  assert.equal(findCustomList(renamed, id).updatedAt, LATER.toISOString());

  const { customLists, tombstones } = deleteCustomList(renamed, {}, id, LATER);
  assert.equal(customLists.length, 0);
  assert.equal(tombstones[id], LATER.toISOString());
});

test("membership add and remove are independent per list", () => {
  let lists = createCustomList(defaultCustomLists(), "A", NOW);
  lists = createCustomList(lists, "B", NOW);
  const idA = lists[0].id;
  const idB = lists[1].id;
  lists = addMovieToCustomList(lists, idA, 42, LATER);
  lists = addMovieToCustomList(lists, idB, 42, LATER);
  assert.deepEqual(findCustomList(lists, idA).movieIds, [42]);
  assert.deepEqual(findCustomList(lists, idB).movieIds, [42]);
  assert.equal(customListsForMovie(lists, 42).length, 2);

  lists = removeMovieFromCustomList(lists, idA, 42, LATER);
  assert.deepEqual(findCustomList(lists, idA).movieIds, []);
  assert.deepEqual(findCustomList(lists, idB).movieIds, [42]);
});

test("normalizeCustomLists drops invalid entries and caps at max", () => {
  const raw = [];
  for (let i = 0; i < MAX_CUSTOM_LISTS + 2; i += 1) {
    raw.push(seedList(`custom-${i}`, `Name ${i}`, [i]));
  }
  raw.push({ id: "watched", name: "Bad", movieIds: [] });
  raw.push(seedList("custom-dup", "Sci-Fi", []));
  raw.push(seedList("custom-dup2", "sci-fi", []));
  const normalized = normalizeCustomLists(raw);
  assert.equal(normalized.length, MAX_CUSTOM_LISTS);
  assert.equal(isDuplicateName(normalized, "Name 0"), true);
});

test("normalizeCustomListTombstones keeps custom ids only", () => {
  assert.deepEqual(
    normalizeCustomListTombstones({
      "custom-abc": "2026-08-19T00:00:00.000Z",
      watched: "2026-08-19T00:00:00.000Z",
      bad: "not-a-date",
    }),
    { "custom-abc": "2026-08-19T00:00:00.000Z" },
  );
});

test("normalizeCustomListIndexSort falls back to recent", () => {
  assert.equal(normalizeCustomListIndexSort("recent"), "recent");
  assert.equal(normalizeCustomListIndexSort("alphabetical"), "alphabetical");
  assert.equal(normalizeCustomListIndexSort("size"), "size");
  assert.equal(normalizeCustomListIndexSort("invalid"), "recent");
});

test("sortCustomListsForIndex orders by recent, alphabetical, and size", () => {
  const lists = [
    {
      ...seedList("custom-a", "Zulu", [1, 2]),
      updatedAt: "2026-08-19T10:00:00.000Z",
    },
    {
      ...seedList("custom-b", "Alpha", [5]),
      updatedAt: "2026-08-19T12:00:00.000Z",
    },
    {
      ...seedList("custom-c", "Beta", []),
      updatedAt: "2026-08-19T11:00:00.000Z",
    },
  ];

  assert.deepEqual(
    sortCustomListsForIndex(lists, "recent").map((list) => list.id),
    ["custom-b", "custom-c", "custom-a"],
  );
  assert.deepEqual(
    sortCustomListsForIndex(lists, "alphabetical").map((list) => list.id),
    ["custom-b", "custom-c", "custom-a"],
  );
  assert.deepEqual(
    sortCustomListsForIndex(lists, "size").map((list) => list.id),
    ["custom-a", "custom-b", "custom-c"],
  );
});

test("sortCustomListsForIndex pins one list to the top regardless of sort", () => {
  const lists = [
    {
      ...seedList("custom-a", "Zulu", [1, 2]),
      updatedAt: "2026-08-19T10:00:00.000Z",
    },
    {
      ...seedList("custom-b", "Alpha", [5]),
      updatedAt: "2026-08-19T12:00:00.000Z",
    },
    {
      ...seedList("custom-c", "Beta", []),
      updatedAt: "2026-08-19T11:00:00.000Z",
    },
  ];

  assert.deepEqual(
    sortCustomListsForIndex(lists, "alphabetical", "custom-a").map((list) => list.id),
    ["custom-a", "custom-b", "custom-c"],
  );
  assert.equal(normalizePinnedCustomListId("custom-a", lists), "custom-a");
  assert.equal(normalizePinnedCustomListId("custom-a", []), null);
  assert.equal(togglePinnedCustomListId(null, "custom-b", lists), "custom-b");
  assert.equal(togglePinnedCustomListId("custom-b", "custom-b", lists), null);
  assert.equal(togglePinnedCustomListId("custom-a", "custom-b", lists), "custom-b");
});

test("addMovieToCustomList enforces the per-list movie cap", () => {
  let lists = createCustomList(defaultCustomLists(), "Big", NOW);
  const listId = lists[0].id;
  for (let id = 1; id <= MAX_CUSTOM_LIST_MOVIES; id += 1) {
    lists = addMovieToCustomList(lists, listId, id, LATER);
  }
  assert.equal(lists[0].movieIds.length, MAX_CUSTOM_LIST_MOVIES);
  assert.equal(isCustomListAtMovieCap(lists, listId), true);
  assert.equal(canAddMovieToCustomList(lists, listId, 999), false);
  assert.equal(addMovieToCustomList(lists, listId, 999, LATER), lists);
});
