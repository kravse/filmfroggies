#!/usr/bin/env node
/**
 * Downloads committed poster files under data/posters/ for ids in data/my_list.csv.
 *
 * Writes data/posters.json so the deployed site knows which ids have local poster
 * files. Movie metadata comes from the account D1 batch cache, not this script.
 *
 * Reads TMDB_READ_TOKEN from the environment or from .env (gitignored).
 *
 * Incremental by default: only ids missing from the manifest or with incomplete
 * files on disk are fetched from TMDB. Pass --force to re-download every poster.
 * Manifest entries for ids missing from the CSV are kept unless --prune is passed.
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
  LOCAL_POSTERS_URL,
  posterFileFromPath,
  normalizeLocalData,
  normalizePostersManifest,
  serializePostersManifest,
} = require("./lib/local-data");
const { CSV_FILENAME, parseListCsv } = require("./lib/list-csv");

const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const POSTER_DIR = path.join(DATA_DIR, "posters");
const POSTERS_FILE = path.join(DATA_DIR, "posters.json");
const MOVIES_FILE = path.join(DATA_DIR, "movies.json");
const CSV_FILE = path.join(DATA_DIR, CSV_FILENAME);
const ENV_FILE = path.join(ROOT, ".env");

const REQUEST_TIMEOUT_MS = 12_000;
const CONCURRENCY = 6;

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

async function fetchPosterPath(movieId, token) {
  const response = await fetchWithTimeout(buildMovieUrl(movieId), buildRequestInit(token));
  const record = normalizeMovie(await response.json());
  if (!record?.posterPath) {
    throw new Error("movie has no poster");
  }
  return record.posterPath;
}

function posterFilesComplete(posterFile, { force }) {
  if (!posterFile) {
    return false;
  }
  for (const size of LOCAL_POSTER_SIZES) {
    const target = path.join(POSTER_DIR, size, posterFile);
    if (force || !fs.existsSync(target) || fs.statSync(target).size <= 0) {
      return false;
    }
  }
  return true;
}

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

function readPosterManifest() {
  if (fs.existsSync(POSTERS_FILE)) {
    try {
      return normalizePostersManifest(JSON.parse(fs.readFileSync(POSTERS_FILE, "utf8")));
    } catch (_) {
      console.warn("data/posters.json could not be read; rebuilding it from scratch.");
    }
  }
  if (fs.existsSync(MOVIES_FILE)) {
    try {
      const snapshot = normalizeLocalData(JSON.parse(fs.readFileSync(MOVIES_FILE, "utf8")));
      const posters = {};
      for (const record of snapshot.records) {
        if (record.poster) {
          posters[record.id] = record.poster;
        }
      }
      if (Object.keys(posters).length) {
        return {
          generatedAt: snapshot.generatedAt,
          posterSizes: snapshot.posterSizes.length ? snapshot.posterSizes : LOCAL_POSTER_SIZES,
          posters,
        };
      }
    } catch (_) {
      /* fall through */
    }
  }
  return { generatedAt: null, posterSizes: LOCAL_POSTER_SIZES, posters: {} };
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

function prunePosterFiles(postersById) {
  const keep = new Set(Object.values(postersById).filter(Boolean));
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

function writePosterManifest(postersById, previousGeneratedAt) {
  const file = serializePostersManifest(postersById, { generatedAt: previousGeneratedAt });
  const previous = fs.existsSync(POSTERS_FILE) ? fs.readFileSync(POSTERS_FILE, "utf8") : "";
  const unchanged = `${JSON.stringify(file, null, 2)}\n`;
  if (previous === unchanged) {
    return false;
  }
  const withStamp = { ...file, generatedAt: new Date().toISOString() };
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(POSTERS_FILE, `${JSON.stringify(withStamp, null, 2)}\n`);
  return true;
}

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
  const manifest = readPosterManifest();
  const postersById = { ...manifest.posters };

  const pendingFetch = [];
  let skipped = 0;
  for (const id of ids) {
    const existing = postersById[id];
    if (!force && posterFilesComplete(existing, { force: false })) {
      skipped += 1;
      continue;
    }
    pendingFetch.push(id);
  }

  const failed = [];
  let fetched = 0;

  if (pendingFetch.length) {
    console.log(`Fetching posters for ${pendingFetch.length} movies from TMDB…`);
  }
  await runWorkers([...pendingFetch], async (id) => {
    try {
      const posterPath = await fetchPosterPath(id, token);
      const poster = await fetchPosters(posterPath, { force });
      if (!poster) {
        throw new Error("poster download failed");
      }
      postersById[id] = poster;
      fetched += 1;
    } catch (error) {
      failed.push({ id, message: error.message || String(error) });
    }
  });

  await runWorkers(
    ids.filter((id) => postersById[id] && !posterFilesComplete(postersById[id], { force: false })),
    async (id) => {
      const posterPath = `/${postersById[id]}`;
      const poster = await fetchPosters(posterPath, { force: false });
      if (poster) {
        postersById[id] = poster;
      }
    },
  );

  const pruning = prune && !failed.length;
  if (pruning) {
    const wanted = new Set(ids);
    for (const id of Object.keys(postersById).map(Number)) {
      if (!wanted.has(id)) {
        delete postersById[id];
      }
    }
  }

  const posterCount = Object.keys(postersById).length;
  const removedPosters = pruning ? prunePosterFiles(postersById) : 0;
  const changed = writePosterManifest(postersById, manifest.generatedAt);

  console.log(
    [
      `${posterCount} ids in data/posters.json`,
      `${fetched} fetched`,
      `${skipped} already stored`,
      `${Object.values(postersById).filter(Boolean).length} with local poster files`,
      pruning ? `${removedPosters} poster files pruned` : null,
      changed ? "file updated" : "file unchanged",
    ]
      .filter(Boolean)
      .join(", "),
  );

  if (prune && !pruning) {
    console.warn("Skipped --prune because some posters could not be fetched.");
  }

  if (failed.length) {
    console.error(`\n${failed.length} posters could not be fetched:`);
    for (const entry of failed) {
      console.error(`  ${entry.id}: ${entry.message}`);
    }
    console.error("Those ids fall back to TMDB CDN posters in the app.");
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
