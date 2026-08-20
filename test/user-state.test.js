const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  USER_STATE_KEY,
  USER_STATE_BACKUP_KEY,
  TMDB_AUTH_KEY,
  HOSTED_SESSION_KEY,
  GIST_SYNC_KEY,
  USER_STATE_VERSION,
  defaultUserState,
  normalizePreferences,
  normalizeUserState,
  parseUserState,
  serializeUserState,
  touchUserState,
  userStateSignature,
} = require("../scripts/lib/user-state");

test("storage keys are distinct so credentials never ride along with state", () => {
  assert.equal(USER_STATE_KEY, "moviecollector-user-state");
  assert.equal(TMDB_AUTH_KEY, "moviecollector-tmdb-auth");
  assert.equal(HOSTED_SESSION_KEY, "moviecollector-hosted-session");
  assert.equal(GIST_SYNC_KEY, "moviecollector-gist-sync");
  assert.equal(USER_STATE_BACKUP_KEY, "moviecollector-user-state-backup");
  assert.equal(
    new Set([
      USER_STATE_KEY,
      USER_STATE_BACKUP_KEY,
      TMDB_AUTH_KEY,
      HOSTED_SESSION_KEY,
      GIST_SYNC_KEY,
    ]).size,
    5,
  );
});

test("normalizeUserState backfills statuses from list membership", () => {
  const state = normalizeUserState({
    updatedAt: "2026-08-01T00:00:00.000Z",
    lists: [
      { id: "watched", movieIds: [1] },
      { id: "watchlist", movieIds: [2] },
    ],
  });
  assert.deepEqual(state.statuses, {
    1: { status: "watched", at: "2026-08-01T00:00:00.000Z" },
    2: { status: "watchlist", at: "2026-08-01T00:00:00.000Z" },
  });
});

test("normalizeUserState backfills missing addedAt from list order", () => {
  const state = normalizeUserState({
    lists: [
      { id: "watched", movieIds: [1, 2] },
      { id: "watchlist", movieIds: [3] },
    ],
  });
  assert.ok(Date.parse(state.addedAt["1"]) < Date.parse(state.addedAt["2"]));
  assert.ok(Date.parse(state.addedAt["2"]) < Date.parse(state.addedAt["3"]));
});

test("a removal record survives a serialize and parse round trip", () => {
  const json = serializeUserState({
    updatedAt: "2026-08-02T00:00:00.000Z",
    lists: [{ id: "watched", movieIds: [1] }],
    statuses: { 9: { status: "removed", at: "2026-08-02T00:00:00.000Z" } },
  });
  const parsed = parseUserState(json);
  assert.equal(parsed.statuses["9"].status, "removed");
  assert.equal(
    parsed.lists.every((list) => !list.movieIds.includes(9)),
    true,
  );
});

test("userStateSignature ignores updatedAt but tracks real edits", () => {
  const base = normalizeUserState({
    updatedAt: "2026-08-01T00:00:00.000Z",
    lists: [{ id: "watched", movieIds: [1, 2] }],
  });
  const restamped = touchUserState(base);
  assert.equal(userStateSignature(base), userStateSignature(restamped));

  const edited = { ...base, lists: [{ id: "watched", movieIds: [1] }] };
  assert.notEqual(userStateSignature(base), userStateSignature(edited));
});

test("userStateSignature is stable regardless of map key order", () => {
  const lists = [{ id: "watched", movieIds: [1, 2] }];
  const ascending = normalizeUserState({ lists, ratings: { 1: 8, 2: 6 } });
  const descending = normalizeUserState({ lists, ratings: { 2: 6, 1: 8 } });
  assert.equal(userStateSignature(ascending), userStateSignature(descending));
});

test("defaultUserState uses account storage with the two preset lists", () => {
  const state = defaultUserState();
  assert.equal(state.version, USER_STATE_VERSION);
  assert.equal(state.storageMode, "account");
  assert.equal(state.activeListId, "watched");
  assert.equal(state.preferences.sort, "user-rating-desc");
  assert.deepEqual(
    state.lists.map((list) => list.id),
    ["watched", "watchlist"],
  );
  assert.equal(state.updatedAt, null);
  assert.deepEqual(state.ratings, {});
  assert.deepEqual(state.addedAt, {});
});

test("the serialized payload carries no credential fields", () => {
  const json = serializeUserState(defaultUserState());
  assert.equal(json.includes("token"), false);
  assert.equal(json.includes("apiKey"), false);
  assert.equal(json.includes("tmdb"), false);
});

test("normalizePreferences rejects an unknown view mode and migrates list to cards", () => {
  const basePrefs = {
    customListIndexSort: "recent",
    pinnedCustomListId: null,
    pinnedCustomListAt: null,
  };
  assert.deepEqual(normalizePreferences({ viewMode: "carousel" }), {
    viewMode: "cards",
    sort: "user-rating-desc",
    ...basePrefs,
  });
  assert.deepEqual(normalizePreferences({ viewMode: "cards" }), {
    viewMode: "cards",
    sort: "user-rating-desc",
    ...basePrefs,
  });
  assert.deepEqual(normalizePreferences({ viewMode: "detail" }), {
    viewMode: "detail",
    sort: "user-rating-desc",
    ...basePrefs,
  });
  assert.deepEqual(normalizePreferences({ viewMode: "list" }), {
    viewMode: "cards",
    sort: "user-rating-desc",
    ...basePrefs,
  });
});

test("normalizePreferences normalizes watched sort modes", () => {
  const basePrefs = {
    customListIndexSort: "recent",
    pinnedCustomListId: null,
    pinnedCustomListAt: null,
  };
  assert.deepEqual(normalizePreferences({ sort: "year-desc" }), {
    viewMode: "cards",
    sort: "year-desc",
    ...basePrefs,
  });
  assert.deepEqual(normalizePreferences({ sort: "invalid" }), {
    viewMode: "cards",
    sort: "user-rating-desc",
    ...basePrefs,
  });
  assert.deepEqual(normalizePreferences({ sort: "custom" }), {
    viewMode: "cards",
    sort: "user-rating-desc",
    ...basePrefs,
  });
});

test("normalizePreferences keeps a valid pinned custom list id", () => {
  const customLists = [
    {
      id: "custom-abc",
      name: "Sci-Fi",
      movieIds: [],
      createdAt: "2026-08-19T00:00:00.000Z",
      updatedAt: "2026-08-19T00:00:00.000Z",
    },
  ];
  assert.deepEqual(
    normalizePreferences(
      {
        pinnedCustomListId: "custom-abc",
        pinnedCustomListAt: "2026-08-19T12:00:00.000Z",
      },
      customLists,
    ),
    {
      viewMode: "cards",
      sort: "user-rating-desc",
      customListIndexSort: "recent",
      pinnedCustomListId: "custom-abc",
      pinnedCustomListAt: "2026-08-19T12:00:00.000Z",
    },
  );
});

test("normalizeUserState falls back when the active list id is not a preset", () => {
  const state = normalizeUserState({
    lists: [{ id: "watchlist", name: "Watchlist", movieIds: [1] }],
    activeListId: "some-old-custom-list",
  });
  assert.equal(state.activeListId, "watched");
});

test("normalizeUserState keeps a valid preset as the active list", () => {
  assert.equal(normalizeUserState({ activeListId: "watched" }).activeListId, "watched");
});

test("normalizeUserState normalizes legacy storage modes to account", () => {
  assert.equal(normalizeUserState({ storageMode: "dropbox" }).storageMode, "account");
  assert.equal(normalizeUserState({ storageMode: "gist" }).storageMode, "account");
  assert.equal(normalizeUserState({ storageMode: "local" }).storageMode, "account");
});

test("normalizeUserState cleans movie ids inside lists", () => {
  const state = normalizeUserState({
    lists: [{ id: "watched", name: "Watched", movieIds: [5, 5, "6", -1] }],
  });
  const watched = state.lists.find((list) => list.id === "watched");
  assert.deepEqual(watched.movieIds, [5, 6]);
});

test("normalizeUserState normalizes ratings to watched movies only", () => {
  const state = normalizeUserState({
    lists: [{ id: "watchlist", name: "Watchlist", movieIds: [42] }],
    ratings: { 42: 8.25, 99: 7 },
  });
  assert.deepEqual(state.ratings, {});
});

test("normalizeUserState drops ratings for custom-list-only movies", () => {
  const state = normalizeUserState({
    lists: [
      { id: "watched", name: "Watched", movieIds: [] },
      { id: "watchlist", name: "Watchlist", movieIds: [] },
    ],
    customLists: [
      {
        id: "custom-abc",
        name: "Sci-Fi",
        movieIds: [42],
        createdAt: "2020-01-01T00:00:00.000Z",
        updatedAt: "2020-01-01T00:00:00.000Z",
      },
    ],
    ratings: { 42: 8.25, 99: 7 },
  });
  assert.deepEqual(state.ratings, {});
});

test("parseUserState round-trips a serialized state", () => {
  const original = normalizeUserState({
    lists: [{ id: "watched", name: "Watched", movieIds: [603, 27205] }],
    activeListId: "watched",
    preferences: { viewMode: "detail" },
  });
  const parsed = parseUserState(serializeUserState(original));
  assert.deepEqual(parsed, original);
});

test("parseUserState returns null for empty or malformed input", () => {
  assert.equal(parseUserState(""), null);
  assert.equal(parseUserState(null), null);
  assert.equal(parseUserState("{not json"), null);
  assert.equal(parseUserState("[1,2,3]".replace("[", "").replace("]", "")), null);
});

test("parseUserState survives a partially corrupted payload", () => {
  const parsed = parseUserState('{"lists":"broken","activeListId":42}');
  assert.equal(parsed.lists.length, 2);
  assert.equal(parsed.activeListId, "watched");
});

test("parseUserState drops unknown list ids from legacy payloads", () => {
  const legacy = JSON.stringify({
    version: 1,
    lists: [
      { id: "favourites", name: "Favourites", movieIds: [603] },
      { id: "sci-fi", name: "Sci-Fi", movieIds: [78, 603] },
    ],
    activeListId: "sci-fi",
    preferences: { viewMode: "list" },
  });
  const parsed = parseUserState(legacy);

  assert.deepEqual(
    parsed.lists.map((list) => list.id),
    ["watched", "watchlist"],
  );
  assert.deepEqual(parsed.lists[0].movieIds, []);
  assert.deepEqual(parsed.lists[1].movieIds, []);
  assert.equal(parsed.activeListId, "watched");
  assert.equal(parsed.preferences.viewMode, "cards");
});

test("defaultUserState includes empty custom lists", () => {
  const state = defaultUserState();
  assert.deepEqual(state.customLists, []);
  assert.deepEqual(state.customListTombstones, {});
});

test("viewing history survives serialization and affects the state signature", () => {
  const base = defaultUserState();
  const entry = { id: "view-a", watchedOn: "2026-08-19", updatedAt: "2026-08-19T12:00:00.000Z" };
  const changed = { ...base, viewingHistory: { 42: [entry] } };
  assert.deepEqual(parseUserState(serializeUserState(changed)).viewingHistory[42], [entry]);
  assert.notEqual(userStateSignature(base), userStateSignature(changed));
});

test("normalizeUserState round-trips custom lists", () => {
  const state = normalizeUserState({
    customLists: [
      {
        id: "custom-abc123",
        name: "Sci-Fi",
        movieIds: [1, 2],
        createdAt: "2026-08-19T00:00:00.000Z",
        updatedAt: "2026-08-19T00:00:00.000Z",
      },
    ],
    customListTombstones: { "custom-deleted": "2026-08-19T01:00:00.000Z" },
  });
  assert.equal(state.customLists.length, 1);
  assert.equal(state.customLists[0].name, "Sci-Fi");
  assert.equal(state.customListTombstones["custom-deleted"], "2026-08-19T01:00:00.000Z");
  const parsed = parseUserState(serializeUserState(state));
  assert.deepEqual(parsed.customLists, state.customLists);
});

test("touchUserState stamps updatedAt without mutating the input", () => {
  const state = defaultUserState();
  const touched = touchUserState(state, new Date("2026-08-18T12:00:00.000Z"));
  assert.equal(touched.updatedAt, "2026-08-18T12:00:00.000Z");
  assert.equal(state.updatedAt, null);
});
