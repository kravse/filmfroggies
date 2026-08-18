const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  USER_STATE_KEY,
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
} = require("../scripts/lib/user-state");

test("storage keys are distinct so credentials never ride along with state", () => {
  assert.equal(USER_STATE_KEY, "moviecollector-user-state");
  assert.equal(TMDB_AUTH_KEY, "moviecollector-tmdb-auth");
  assert.equal(HOSTED_SESSION_KEY, "moviecollector-hosted-session");
  assert.equal(GIST_SYNC_KEY, "moviecollector-gist-sync");
  assert.equal(
    new Set([USER_STATE_KEY, TMDB_AUTH_KEY, HOSTED_SESSION_KEY, GIST_SYNC_KEY]).size,
    4,
  );
});

test("defaultUserState starts on local storage with the three preset lists", () => {
  const state = defaultUserState();
  assert.equal(state.version, USER_STATE_VERSION);
  assert.equal(state.storageMode, "local");
  assert.equal(state.activeListId, "watched");
  assert.deepEqual(
    state.lists.map((list) => list.id),
    ["watched", "favourites", "watchlist"],
  );
  assert.equal(state.updatedAt, null);
  assert.deepEqual(state.ratings, {});
});

test("the serialized payload carries no credential fields", () => {
  const json = serializeUserState(defaultUserState());
  assert.equal(json.includes("token"), false);
  assert.equal(json.includes("apiKey"), false);
  assert.equal(json.includes("tmdb"), false);
});

test("normalizePreferences rejects an unknown view mode and migrates list to cards", () => {
  assert.deepEqual(normalizePreferences({ viewMode: "carousel" }), {
    viewMode: "cards",
  });
  assert.deepEqual(normalizePreferences({ viewMode: "cards" }), {
    viewMode: "cards",
  });
  assert.deepEqual(normalizePreferences({ viewMode: "detail" }), {
    viewMode: "detail",
  });
  assert.deepEqual(normalizePreferences({ viewMode: "list" }), {
    viewMode: "cards",
  });
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

test("normalizeUserState rejects an unknown storage mode", () => {
  assert.equal(normalizeUserState({ storageMode: "dropbox" }).storageMode, "local");
  assert.equal(normalizeUserState({ storageMode: "gist" }).storageMode, "gist");
});

test("normalizeUserState cleans movie ids inside lists", () => {
  const state = normalizeUserState({
    lists: [{ id: "favourites", name: "Favourites", movieIds: [5, 5, "6", -1] }],
  });
  const favourites = state.lists.find((list) => list.id === "favourites");
  assert.deepEqual(favourites.movieIds, [5, 6]);
});

test("normalizeUserState normalizes ratings to movies in lists", () => {
  const state = normalizeUserState({
    lists: [{ id: "watchlist", name: "Watchlist", movieIds: [42] }],
    ratings: { 42: 8.25, 99: 7 },
  });
  assert.deepEqual(state.ratings, { 42: 8.3 });
});

test("parseUserState round-trips a serialized state", () => {
  const original = normalizeUserState({
    lists: [{ id: "favourites", name: "Favourites", movieIds: [603, 27205] }],
    activeListId: "favourites",
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
  assert.equal(parsed.lists.length, 3);
  assert.equal(parsed.activeListId, "watched");
});

test("parseUserState migrates a payload written before the preset lists", () => {
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

  // The custom list is dropped, favourites survives, and the surviving
  // favourite is promoted into watched.
  assert.deepEqual(
    parsed.lists.map((list) => list.id),
    ["watched", "favourites", "watchlist"],
  );
  assert.deepEqual(parsed.lists[0].movieIds, [603]);
  assert.deepEqual(parsed.lists[1].movieIds, [603]);
  assert.deepEqual(parsed.lists[2].movieIds, []);
  assert.equal(parsed.activeListId, "watched");
  assert.equal(parsed.preferences.viewMode, "cards");
});

test("touchUserState stamps updatedAt without mutating the input", () => {
  const state = defaultUserState();
  const touched = touchUserState(state, new Date("2026-08-18T12:00:00.000Z"));
  assert.equal(touched.updatedAt, "2026-08-18T12:00:00.000Z");
  assert.equal(state.updatedAt, null);
});
