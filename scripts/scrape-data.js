#!/usr/bin/env node
/**
 * Writes the committed movie snapshot under data/.
 *
 * Reads the ids in data/my_list.csv — exported from Settings on the running
 * site — fetches each one from TMDB, and stores the normalized record plus its
 * posters in the repo. The site then renders those movies without a single API
 * call, which is both faster and immune to the API changing under it.
 *
 * This is the one script that talks to TMDB from a shell, so it is the one place
 * that needs a token outside the browser. It reads TMDB_READ_TOKEN from the
 * environment or from .env, which is gitignored.
 *
 * Incremental by default: ids already in the snapshot are left alone and posters
 * already on disk are not re-downloaded. Pass --force to refetch everything.
 * Records for ids missing from the CSV are kept unless --prune is passed, so an
 * export taken from a half-synced device cannot quietly delete the snapshot.
 */
const fs = require("fs");
const path = require("path");

const {
  isReadAccessToken,
  buildRequestInit,
  buildMovieUrl,
  buildImageUrl,
  normalizeMovie,
} = require("./lib/tmdb");
const {
  LOCAL_POSTER_SIZES,
  posterFileFromPath,
  normalizeLocalData,
  normalizeLocalRecord,
  serializeLocalData,
} = require("./lib/local-data");
const { CSV_FILENAME, parseListCsv } = require("./lib/list-csv");

const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const MOVIES_FILE = path.join(DATA_DIR, "movies.json");
const POSTER_DIR = path.join(DATA_DIR, "posters");
const CSV_FILE = path.join(DATA_DIR, CSV_FILENAME);
const ENV_FILE = path.join(ROOT, ".env");

const REQUEST_TIMEOUT_MS = 12_000;
const CONCURRENCY = 6;

/* --- Token --- */

/** Minimal KEY=value reader. Existing environment values always win. */
function loadDotEnv() {
  if (!fs.existsSync(ENV_FILE)) {
    return;
  }
  for (const line of fs.readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!match || line.trim().startsWith("#")) {
      continue;
    }
    const [, key, rawValue] = match;
    if (process.env[key] != null) {
      continue;
    }
    process.env[key] = rawValue.trim().replace(/^(['"])(.*)\1$/, "$2");
  }
}

function readToken() {
  loadDotEnv();
  const token = String(process.env.TMDB_READ_TOKEN || "").trim();
  if (!isReadAccessToken(token)) {
    throw new Error(
      "Set TMDB_READ_TOKEN to your TMDB API Read Access Token, either in the environment or in .env (gitignored).",
    );
  }
  return token;
}

/* --- Requests --- */

async function fetchWithTimeout(url, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) {
      throw new Error(`request failed (${response.status})`);
    }
    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchMovie(movieId, token) {
  const response = await fetchWithTimeout(buildMovieUrl(movieId), buildRequestInit(token));
  const record = normalizeMovie(await response.json());
  if (!record) {
    throw new Error("unexpected TMDB payload");
  }
  return record;
}

/**
 * Downloads every stored size for one poster and returns the filename, or null
 * when any size is missing. All-or-nothing keeps the manifest honest: a `poster`
 * field always means every size the manifest advertises is on disk.
 */
async function fetchPosters(posterPath, { force }) {
  const file = posterFileFromPath(posterPath);
  if (!file) {
    return null;
  }
  for (const size of LOCAL_POSTER_SIZES) {
    const dir = path.join(POSTER_DIR, size);
    const target = path.join(dir, file);
    if (!force && fs.existsSync(target) && fs.statSync(target).size > 0) {
      continue;
    }
    const url = buildImageUrl(posterPath, size);
    if (!url) {
      return null;
    }
    try {
      const response = await fetchWithTimeout(url, { headers: { accept: "image/*" } });
      const bytes = Buffer.from(await response.arrayBuffer());
      if (!bytes.length) {
        return null;
      }
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(target, bytes);
    } catch (_) {
      return null;
    }
  }
  return file;
}

/* --- Snapshot --- */

function readSnapshot() {
  if (!fs.existsSync(MOVIES_FILE)) {
    return { generatedAt: null, records: [] };
  }
  try {
    return normalizeLocalData(JSON.parse(fs.readFileSync(MOVIES_FILE, "utf8")));
  } catch (_) {
    console.warn("data/movies.json could not be read; rebuilding it from scratch.");
    return { generatedAt: null, records: [] };
  }
}

function readIds() {
  if (!fs.existsSync(CSV_FILE)) {
    throw new Error(
      `No data/${CSV_FILENAME}. Open Settings on the site, use "Export backup", and commit the file there.`,
    );
  }
  const ids = parseListCsv(fs.readFileSync(CSV_FILE, "utf8"));
  if (!ids.length) {
    throw new Error(`data/${CSV_FILENAME} has no movie ids in its first column.`);
  }
  return ids;
}

/** Deletes poster files no remaining record points at. */
function prunePosters(records) {
  const keep = new Set(records.map((record) => record.poster).filter(Boolean));
  let removed = 0;
  for (const size of LOCAL_POSTER_SIZES) {
    const dir = path.join(POSTER_DIR, size);
    if (!fs.existsSync(dir)) {
      continue;
    }
    for (const file of fs.readdirSync(dir)) {
      if (keep.has(file)) {
        continue;
      }
      fs.rmSync(path.join(dir, file), { force: true });
      removed += 1;
    }
  }
  return removed;
}

/**
 * Rewrites generatedAt only when a record actually changed, so a no-op scrape
 * leaves the file byte-identical and produces no commit.
 */
function writeSnapshot(records, previousGeneratedAt) {
  const file = serializeLocalData(records, { generatedAt: previousGeneratedAt });
  const previous = fs.existsSync(MOVIES_FILE) ? fs.readFileSync(MOVIES_FILE, "utf8") : "";
  const unchanged = `${JSON.stringify(file, null, 2)}\n`;
  if (previous === unchanged) {
    return false;
  }
  const withStamp = { ...file, generatedAt: new Date().toISOString() };
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(MOVIES_FILE, `${JSON.stringify(withStamp, null, 2)}\n`);
  return true;
}

/* --- Run --- */

async function runWorkers(pending, handle) {
  const workerCount = Math.min(CONCURRENCY, pending.length);
  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (pending.length) {
        await handle(pending.shift());
      }
    }),
  );
}

async function scrape(argv = []) {
  const force = argv.includes("--force");
  const prune = argv.includes("--prune");

  const token = readToken();
  const ids = readIds();
  const snapshot = readSnapshot();

  const byId = new Map(snapshot.records.map((record) => [record.id, record]));
  const pending = ids.filter((id) => force || !byId.has(id));
  const skipped = ids.length - pending.length;
  const failed = [];
  let fetched = 0;

  if (pending.length) {
    console.log(`Fetching ${pending.length} movies from TMDB…`);
  }
  await runWorkers([...pending], async (id) => {
    try {
      const record = await fetchMovie(id, token);
      const poster = await fetchPosters(record.posterPath, { force });
      byId.set(id, normalizeLocalRecord({ ...record, poster }));
      fetched += 1;
    } catch (error) {
      failed.push({ id, message: error.message || String(error) });
    }
  });

  // Posters can also be missing for ids that were already in the snapshot, for
  // example after a --prune or a manual delete.
  await runWorkers(
    [...byId.values()].filter((record) => record.posterPath && !record.poster),
    async (record) => {
      const poster = await fetchPosters(record.posterPath, { force: false });
      if (poster) {
        byId.set(record.id, { ...record, poster });
      }
    },
  );

  // A run with failures is a run you will repeat, so it must not delete anything
  // in the meantime: the ids it could not reach would come back empty-handed.
  const pruning = prune && !failed.length;
  if (pruning) {
    const wanted = new Set(ids);
    for (const id of [...byId.keys()]) {
      if (!wanted.has(id)) {
        byId.delete(id);
      }
    }
  }

  const records = [...byId.values()];
  const removedPosters = pruning ? prunePosters(records) : 0;
  const changed = writeSnapshot(records, snapshot.generatedAt);

  console.log(
    [
      `${records.length} movies in data/movies.json`,
      `${fetched} fetched`,
      `${skipped} already stored`,
      `${records.filter((record) => record.poster).length} with local posters`,
      pruning ? `${removedPosters} poster files pruned` : null,
      changed ? "file updated" : "file unchanged",
    ]
      .filter(Boolean)
      .join(", "),
  );

  if (prune && !pruning) {
    console.warn("Skipped --prune because some movies could not be fetched.");
  }

  if (failed.length) {
    console.error(`\n${failed.length} movies could not be fetched:`);
    for (const entry of failed) {
      console.error(`  ${entry.id}: ${entry.message}`);
    }
    console.error("The site falls back to the API for these ids.");
  }
  return failed.length;
}

if (require.main === module) {
  scrape(process.argv.slice(2))
    .then((failures) => {
      process.exitCode = failures ? 1 : 0;
    })
    .catch((error) => {
      console.error(error.message || error);
      process.exitCode = 1;
    });
}

module.exports = { scrape };
