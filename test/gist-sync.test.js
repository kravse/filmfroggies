const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  GIST_STATE_FILENAME,
  parseGistSyncConfig,
  serializeGistSyncConfig,
  isConnectedGistConfig,
  mergeStateByUpdatedAt,
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
  const config = { token: "abc", gistId: "123" };
  assert.deepEqual(parseGistSyncConfig(serializeGistSyncConfig(config)), config);
});

test("isConnectedGistConfig requires both a token and a gist id", () => {
  assert.equal(isConnectedGistConfig({ token: "a", gistId: "b" }), true);
  assert.equal(isConnectedGistConfig({ token: "a", gistId: "" }), false);
  assert.equal(isConnectedGistConfig(null), false);
});

test("mergeStateByUpdatedAt takes the newer side", () => {
  const local = { updatedAt: "2026-01-01T00:00:00.000Z", tag: "local" };
  const remote = { updatedAt: "2026-02-01T00:00:00.000Z", tag: "remote" };
  assert.equal(mergeStateByUpdatedAt(local, remote).tag, "remote");
  assert.equal(mergeStateByUpdatedAt(remote, local).tag, "remote");
});

test("mergeStateByUpdatedAt keeps local on an exact tie", () => {
  const stamp = "2026-01-01T00:00:00.000Z";
  const local = { updatedAt: stamp, tag: "local" };
  const remote = { updatedAt: stamp, tag: "remote" };
  assert.equal(mergeStateByUpdatedAt(local, remote).tag, "local");
});

test("mergeStateByUpdatedAt prefers the side that has a timestamp", () => {
  const local = { updatedAt: null, tag: "local" };
  const remote = { updatedAt: "2026-01-01T00:00:00.000Z", tag: "remote" };
  assert.equal(mergeStateByUpdatedAt(local, remote).tag, "remote");
  assert.equal(mergeStateByUpdatedAt(remote, local).tag, "remote");
});

test("mergeStateByUpdatedAt falls back to whichever side exists", () => {
  const local = { updatedAt: null, tag: "local" };
  assert.equal(mergeStateByUpdatedAt(local, null).tag, "local");
  assert.equal(mergeStateByUpdatedAt(null, local).tag, "local");
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

test("resolveGistConnectState adopts an existing gist rather than overwriting", () => {
  const remoteState = { updatedAt: "2026-01-01T00:00:00.000Z", tag: "remote" };
  const resolved = resolveGistConnectState({
    gistId: "abc",
    remoteState,
    localState: { tag: "local" },
  });
  assert.deepEqual(resolved, {
    ok: true,
    action: "adopt",
    gistId: "abc",
    nextState: remoteState,
  });
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
