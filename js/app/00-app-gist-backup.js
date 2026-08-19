/* Generated from scripts/lib/gist-backup.js — run npm run bundle */

const appGistBackup = (function () {
  /**
   * Immutable Gist snapshots of user state. Each snapshot is a separate gist file;
   * files are never updated, only added or deleted when the ring buffer overflows.
   */

  const BACKUP_GIST_DESCRIPTION = "Movie collector backups";
  const SNAPSHOT_PREFIX = "snapshot-";
  const SNAPSHOT_SUFFIX = ".json";
  const MAX_SNAPSHOTS = 5;
  const SNAPSHOT_INTERVAL_MS = 20 * 60 * 1000;

  function isSnapshotFilename(name) {
    return (
      typeof name === "string" &&
      name.startsWith(SNAPSHOT_PREFIX) &&
      name.endsWith(SNAPSHOT_SUFFIX)
    );
  }

  function snapshotFilenameFromDate(date) {
    const value = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(value.getTime())) {
      return null;
    }
    const pad = (part) => String(part).padStart(2, "0");
    const stamp = [
      value.getUTCFullYear(),
      pad(value.getUTCMonth() + 1),
      pad(value.getUTCDate()),
      "T",
      pad(value.getUTCHours()),
      pad(value.getUTCMinutes()),
      pad(value.getUTCSeconds()),
      "Z",
    ].join("");
    return `${SNAPSHOT_PREFIX}${stamp}${SNAPSHOT_SUFFIX}`;
  }

  function parseSnapshotFilename(name) {
    if (!isSnapshotFilename(name)) {
      return null;
    }
    const stem = name.slice(SNAPSHOT_PREFIX.length, -SNAPSHOT_SUFFIX.length);
    const match = stem.match(
      /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
    );
    if (!match) {
      return null;
    }
    const [, year, month, day, hour, minute, second] = match;
    const time = Date.UTC(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      parseInt(hour, 10),
      parseInt(minute, 10),
      parseInt(second, 10),
    );
    const date = new Date(time);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function listSnapshotFilenames(files) {
    if (!files || typeof files !== "object") {
      return [];
    }
    return Object.keys(files).filter(isSnapshotFilename).sort();
  }

  function snapshotEntriesFromFiles(files) {
    return listSnapshotFilenames(files)
      .map((filename) => {
        const at = parseSnapshotFilename(filename);
        if (!at) {
          return null;
        }
        return { filename, at: at.toISOString() };
      })
      .filter(Boolean)
      .sort((a, b) => a.at.localeCompare(b.at));
  }

  function shouldCreateSnapshot(filenames, nowMs, intervalMs = SNAPSHOT_INTERVAL_MS) {
    if (!filenames.length) {
      return true;
    }
    const latestName = filenames[filenames.length - 1];
    const latestAt = parseSnapshotFilename(latestName);
    if (!latestAt) {
      return true;
    }
    return nowMs - latestAt.getTime() >= intervalMs;
  }

  function filenamesToPurgeBeforeAdd(sortedFilenames, maxSnapshots = MAX_SNAPSHOTS) {
    const nextCount = sortedFilenames.length + 1;
    if (nextCount <= maxSnapshots) {
      return [];
    }
    return sortedFilenames.slice(0, nextCount - maxSnapshots);
  }

  function findBackupGistId(gists, syncGistId) {
    if (!Array.isArray(gists)) {
      return null;
    }
    for (const gist of gists) {
      if (!gist?.id || gist.id === syncGistId) {
        continue;
      }
      if (gist.description === BACKUP_GIST_DESCRIPTION) {
        return gist.id;
      }
      const files = gist.files || {};
      if (Object.keys(files).some(isSnapshotFilename)) {
        return gist.id;
      }
    }
    return null;
  }

  function buildBackupGistCreatePayload(filename, stateJson) {
    return {
      description: BACKUP_GIST_DESCRIPTION,
      public: false,
      files: { [filename]: { content: stateJson } },
    };
  }

  function buildBackupGistUpdatePayload({ add, deleteFilenames = [] }) {
    const files = {
      [add.filename]: { content: add.content },
    };
    for (const name of deleteFilenames) {
      files[name] = null;
    }
    return { files };
  }

  function extractSnapshotContent(body, filename) {
    if (!body?.files || typeof body.files !== "object") {
      return null;
    }
    const content = body.files[filename]?.content;
    return typeof content === "string" ? content : null;
  }

  return {
    BACKUP_GIST_DESCRIPTION,
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
  };
})();
