const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  GIST_STATE_FILENAME,
  parseGistSyncConfig,
  serializeGistSyncConfig,
  isConnectedGistConfig,
  extractStateJsonFromGistResponse,
  findCollectorGistId,
  buildGistCreatePayload,
  buildGistUpdatePayload,
  resolveGistConnectState,
} = require("../scripts/lib/gist-sync");

test("parseGistSyncConfig reads a stored token and gist id", () => {
  assert.deepEqual(parseGistSyncConfig('{"token":"abc","gistId":"123"}'), {
    token: "abc",
    gistId: "123",
    backupGistId: "",
  });
});

test("parseGistSyncConfig returns null without a token", () => {
  assert.equal(parseGistSyncConfig('{"gistId":"123"}'), null);
  assert.equal(parseGistSyncConfig('{"token":"  "}'), null);
  assert.equal(parseGistSyncConfig("not json"), null);
  assert.equal(parseGistSyncConfig(""), null);
  assert.equal(parseGistSyncConfig(null), null);
});

test("serializeGistSyncConfig round-trips through parse", () => {
  const config = { token: "abc", gistId: "123", backupGistId: "backup" };
  assert.deepEqual(parseGistSyncConfig(serializeGistSyncConfig(config)), config);
});

test("isConnectedGistConfig requires both a token and a gist id", () => {
  assert.equal(isConnectedGistConfig({ token: "a", gistId: "b" }), true);
  assert.equal(isConnectedGistConfig({ token: "a", gistId: "" }), false);
  assert.equal(isConnectedGistConfig(null), false);
});

test("extractStateJsonFromGistResponse reads the state file", () => {
  const body = { files: { [GIST_STATE_FILENAME]: { content: '{"version":1}' } } };
  assert.equal(extractStateJsonFromGistResponse(body), '{"version":1}');
});

test("extractStateJsonFromGistResponse returns null when the file is absent", () => {
  assert.equal(extractStateJsonFromGistResponse({ files: {} }), null);
  assert.equal(extractStateJsonFromGistResponse({}), null);
  assert.equal(extractStateJsonFromGistResponse(null), null);
});

test("findCollectorGistId matches on the state filename", () => {
  const gists = [
    { id: "other", files: { "notes.md": {} } },
    { id: "mine", files: { [GIST_STATE_FILENAME]: {} } },
  ];
  assert.equal(findCollectorGistId(gists), "mine");
  assert.equal(findCollectorGistId([]), null);
  assert.equal(findCollectorGistId(null), null);
});

test("gist payloads are private and carry only the state file", () => {
  const create = buildGistCreatePayload('{"version":1}');
  assert.equal(create.public, false);
  assert.deepEqual(Object.keys(create.files), [GIST_STATE_FILENAME]);

  const update = buildGistUpdatePayload('{"version":1}');
  assert.deepEqual(Object.keys(update.files), [GIST_STATE_FILENAME]);
  assert.equal(update.public, undefined);
});

function listsOf(watched, watchlist) {
  return [
    { id: "watched", name: "Watched", movieIds: watched },
    { id: "watchlist", name: "Watchlist", movieIds: watchlist },
  ];
}

test("resolveGistConnectState adopts an existing gist rather than overwriting", () => {
  const resolved = resolveGistConnectState({
    gistId: "abc",
    remoteState: { updatedAt: "2026-02-01T00:00:00.000Z", lists: listsOf([1], []) },
    localState: { updatedAt: "2026-01-01T00:00:00.000Z", lists: listsOf([], [2]) },
  });
  assert.equal(resolved.ok, true);
  assert.equal(resolved.action, "adopt");
  assert.equal(resolved.gistId, "abc");
});

test("connecting merges local movies into the adopted gist instead of dropping them", () => {
  const resolved = resolveGistConnectState({
    gistId: "abc",
    remoteState: { updatedAt: "2026-02-01T00:00:00.000Z", lists: listsOf([1], []) },
    localState: { updatedAt: "2026-01-01T00:00:00.000Z", lists: listsOf([], [2]) },
  });
  const idsIn = (listId) =>
    resolved.nextState.lists.find((list) => list.id === listId).movieIds;
  assert.deepEqual(idsIn("watched"), [1]);
  assert.deepEqual(idsIn("watchlist"), [2]);
});

test("resolveGistConnectState refuses to clobber an unreadable gist", () => {
  const resolved = resolveGistConnectState({
    gistId: "abc",
    remoteState: null,
    localState: { tag: "local" },
  });
  assert.equal(resolved.ok, false);
  assert.match(resolved.error, /not changed/);
});

test("resolveGistConnectState creates a gist when the account has none", () => {
  const localState = { tag: "local" };
  const resolved = resolveGistConnectState({
    gistId: null,
    remoteState: null,
    localState,
  });
  assert.equal(resolved.action, "create");
  assert.equal(resolved.nextState, localState);
});
