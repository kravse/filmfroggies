const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  SNAPSHOT_PREFIX,
  MAX_SNAPSHOTS,
  SNAPSHOT_INTERVAL_MS,
  isSnapshotFilename,
  snapshotFilenameFromDate,
  parseSnapshotFilename,
  listSnapshotFilenames,
  snapshotEntriesFromFiles,
  shouldCreateSnapshot,
  filenamesToPurgeBeforeAdd,
  findBackupGistId,
  buildBackupGistCreatePayload,
  buildBackupGistUpdatePayload,
  extractSnapshotContent,
  BACKUP_GIST_DESCRIPTION,
} = require("../scripts/lib/gist-backup");

test("isSnapshotFilename accepts only snapshot json files", () => {
  assert.equal(isSnapshotFilename("snapshot-20260819T121530Z.json"), true);
  assert.equal(isSnapshotFilename("moviecollector-state.json"), false);
  assert.equal(isSnapshotFilename("snapshot-readme.md"), false);
});

test("snapshotFilenameFromDate and parseSnapshotFilename round-trip", () => {
  const date = new Date("2026-08-19T12:15:30.000Z");
  const filename = snapshotFilenameFromDate(date);
  assert.equal(filename, `${SNAPSHOT_PREFIX}20260819T121530Z.json`);
  assert.equal(parseSnapshotFilename(filename)?.toISOString(), date.toISOString());
});

test("listSnapshotFilenames sorts chronologically", () => {
  const files = {
    "snapshot-20260819T130000Z.json": {},
    "notes.md": {},
    "snapshot-20260819T120000Z.json": {},
  };
  assert.deepEqual(listSnapshotFilenames(files), [
    "snapshot-20260819T120000Z.json",
    "snapshot-20260819T130000Z.json",
  ]);
});

test("shouldCreateSnapshot requires an empty list or a 20-minute gap", () => {
  const now = Date.parse("2026-08-19T12:30:00.000Z");
  assert.equal(shouldCreateSnapshot([], now), true);
  const recent = [snapshotFilenameFromDate(new Date(now - 5 * 60 * 1000))];
  assert.equal(shouldCreateSnapshot(recent, now), false);
  const old = [snapshotFilenameFromDate(new Date(now - SNAPSHOT_INTERVAL_MS))];
  assert.equal(shouldCreateSnapshot(old, now), true);
});

test("filenamesToPurgeBeforeAdd drops the oldest files only", () => {
  const names = [
    "snapshot-20260819T100000Z.json",
    "snapshot-20260819T110000Z.json",
    "snapshot-20260819T120000Z.json",
    "snapshot-20260819T130000Z.json",
    "snapshot-20260819T140000Z.json",
  ];
  assert.deepEqual(filenamesToPurgeBeforeAdd(names, MAX_SNAPSHOTS), [
    "snapshot-20260819T100000Z.json",
  ]);
  assert.deepEqual(
    filenamesToPurgeBeforeAdd(names.slice(0, 3), MAX_SNAPSHOTS),
    [],
  );
});

test("findBackupGistId skips the sync gist and matches backup description", () => {
  const gists = [
    { id: "sync", description: "Movie collector sync", files: { "moviecollector-state.json": {} } },
    { id: "backup", description: BACKUP_GIST_DESCRIPTION, files: {} },
  ];
  assert.equal(findBackupGistId(gists, "sync"), "backup");
});

test("findBackupGistId can discover a gist by snapshot files", () => {
  const gists = [
    { id: "sync", files: { "moviecollector-state.json": {} } },
    { id: "backup", files: { "snapshot-20260819T120000Z.json": {} } },
  ];
  assert.equal(findBackupGistId(gists, "sync"), "backup");
});

test("backup gist payloads stay private and delete files with null content", () => {
  const create = buildBackupGistCreatePayload(
    "snapshot-20260819T120000Z.json",
    '{"version":2}',
  );
  assert.equal(create.public, false);
  assert.equal(create.description, BACKUP_GIST_DESCRIPTION);

  const update = buildBackupGistUpdatePayload({
    add: { filename: "snapshot-20260819T130000Z.json", content: "{}" },
    deleteFilenames: ["snapshot-20260819T120000Z.json"],
  });
  assert.deepEqual(update.files["snapshot-20260819T130000Z.json"], { content: "{}" });
  assert.equal(update.files["snapshot-20260819T120000Z.json"], null);
});

test("snapshotEntriesFromFiles returns sorted metadata", () => {
  const entries = snapshotEntriesFromFiles({
    "snapshot-20260819T130000Z.json": {},
    "snapshot-20260819T120000Z.json": {},
  });
  assert.equal(entries.length, 2);
  assert.equal(entries[0].filename, "snapshot-20260819T120000Z.json");
  assert.equal(entries[1].at, "2026-08-19T13:00:00.000Z");
});

test("extractSnapshotContent reads one snapshot file", () => {
  const body = {
    files: {
      "snapshot-20260819T120000Z.json": { content: '{"version":2}' },
    },
  };
  assert.equal(
    extractSnapshotContent(body, "snapshot-20260819T120000Z.json"),
    '{"version":2}',
  );
  assert.equal(extractSnapshotContent(body, "missing.json"), null);
});
