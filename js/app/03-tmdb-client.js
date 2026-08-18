/**
 * TMDB access with a stale-while-revalidate Cache API layer.
 *
 * Movie detail responses are cached under a synthetic key that omits the
 * credential, so the cache survives a credential change and never stores the
 * secret itself. Search is transient and only memoized for the session.
 */

const TMDB_CACHE_NAME = "moviecollector-tmdb-v1";
const CACHE_KEY_ORIGIN = "https://moviecollector.invalid/tmdb";
const REQUEST_TIMEOUT_MS = 12000;
const HYDRATE_CONCURRENCY = 6;

const searchMemo = new Map();

let cachePromise;

/* --- Credential --- */

function loadCredential() {
  try {
    tmdbCredential = localStorage.getItem(appUserState.TMDB_AUTH_KEY) || "";
  } catch (_) {
    tmdbCredential = "";
  }
  return tmdbCredential;
}

function saveCredential(value) {
  tmdbCredential = String(value || "").trim();
  try {
    if (tmdbCredential) {
      localStorage.setItem(appUserState.TMDB_AUTH_KEY, tmdbCredential);
    } else {
      localStorage.removeItem(appUserState.TMDB_AUTH_KEY);
    }
  } catch (_) {
    /* Private browsing can refuse writes; the in-memory value still works. */
  }
  return tmdbCredential;
}

function hasCredential() {
  return appTmdb.isReadAccessToken(tmdbCredential);
}

/* --- Cache --- */

/** The Cache API is unavailable on file:// and in some privacy modes. */
function openTmdbCache() {
  if (cachePromise === undefined) {
    cachePromise =
      typeof caches === "undefined"
        ? Promise.resolve(null)
        : caches.open(TMDB_CACHE_NAME).catch(() => null);
  }
  return cachePromise;
}

function movieCacheKey(movieId) {
  return `${CACHE_KEY_ORIGIN}/movie/${movieId}`;
}

async function clearMovieCache() {
  searchMemo.clear();
  if (typeof caches === "undefined") {
    return false;
  }
  cachePromise = undefined;
  try {
    return await caches.delete(TMDB_CACHE_NAME);
  } catch (_) {
    return false;
  }
}

/* --- Requests --- */

async function fetchTmdb(url, options = {}) {
  if (!hasCredential()) {
    throw new Error("No TMDB credential");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abortOuter = () => controller.abort();
  const outerSignal = options.signal;

  if (outerSignal) {
    if (outerSignal.aborted) {
      controller.abort();
    } else {
      outerSignal.addEventListener("abort", abortOuter, { once: true });
    }
  }

  try {
    const response = await fetch(
      url,
      appTmdb.buildRequestInit(tmdbCredential, { signal: controller.signal }),
    );
    if (!response.ok) {
      throw new Error(`TMDB request failed (${response.status})`);
    }
    return response;
  } finally {
    clearTimeout(timer);
    if (outerSignal) {
      outerSignal.removeEventListener("abort", abortOuter);
    }
  }
}

function parseMovieText(text) {
  try {
    return appTmdb.normalizeMovie(JSON.parse(text));
  } catch (_) {
    return null;
  }
}

/**
 * Background refresh after a cache hit. Failures are intentionally silent:
 * the caller already has a usable record and may simply be offline.
 */
async function revalidateMovie(movieId, cacheKey, cache, cachedText, onUpdate) {
  try {
    const response = await fetchTmdb(appTmdb.buildMovieUrl(movieId));
    const text = await response.text();
    if (text === cachedText) {
      return;
    }
    const record = parseMovieText(text);
    if (!record) {
      return;
    }
    if (cache) {
      await cache.put(cacheKey, new Response(text, { headers: { "content-type": "application/json" } }));
    }
    movieById.set(movieId, record);
    if (typeof onUpdate === "function") {
      onUpdate(movieId, record);
    }
  } catch (_) {
    /* Stale data stays on screen. */
  }
}

async function fetchAndCacheMovie(movieId, cacheKey, cache) {
  const response = await fetchTmdb(appTmdb.buildMovieUrl(movieId));
  const text = await response.text();
  const record = parseMovieText(text);
  if (!record) {
    throw new Error(`Unexpected TMDB payload for movie ${movieId}`);
  }
  if (cache) {
    await cache.put(
      cacheKey,
      new Response(text, { headers: { "content-type": "application/json" } }),
    );
  }
  return record;
}

/** Resolves from cache when possible, then refreshes behind the caller. */
async function getMovie(movieId, options = {}) {
  const id = Number(movieId);
  const cacheKey = movieCacheKey(id);
  const cache = await openTmdbCache();

  if (cache) {
    const cached = await cache.match(cacheKey);
    if (cached) {
      const cachedText = await cached.text();
      const record = parseMovieText(cachedText);
      if (record) {
        revalidateMovie(id, cacheKey, cache, cachedText, options.onUpdate);
        return record;
      }
    }
  }

  return fetchAndCacheMovie(id, cacheKey, cache);
}

/**
 * Cheapest authenticated call TMDB offers, so a bad credential is caught before
 * it fans out into one failing request per movie.
 */
async function verifyCredential() {
  const response = await fetchTmdb(appTmdb.buildConfigurationUrl());
  const body = await response.json();
  if (!body?.images?.secure_base_url) {
    throw new Error("TMDB returned an unexpected configuration payload");
  }
  return true;
}

async function searchMovies(query, options = {}) {
  const trimmed = String(query || "").trim();
  if (!trimmed) {
    return [];
  }
  if (searchMemo.has(trimmed)) {
    return searchMemo.get(trimmed);
  }
  const response = await fetchTmdb(appTmdb.buildSearchUrl(trimmed), {
    signal: options.signal,
  });
  const results = appTmdb.normalizeSearchResults(await response.json());
  searchMemo.set(trimmed, results);
  return results;
}

/**
 * Fetch many movies with a bounded number of in-flight requests. TMDB has no
 * batch endpoint for arbitrary ids, so a long list is many small requests.
 */
async function hydrateMovies(ids, handlers = {}) {
  // Without a credential every request would fail, turning the whole grid into
  // error cards. Leaving the skeletons up reads better and stays accurate.
  if (!hasCredential()) {
    return;
  }
  const queue = ids.filter((id) => !movieById.has(id));
  if (!queue.length) {
    return;
  }

  const pending = [...queue];

  async function worker() {
    while (pending.length) {
      const id = pending.shift();
      try {
        const record = await getMovie(id, { onUpdate: handlers.onUpdate });
        movieById.set(id, record);
        movieErrors.delete(id);
        handlers.onRecord?.(id, record);
      } catch (_) {
        movieErrors.add(id);
        handlers.onRecord?.(id, null);
      }
    }
  }

  const workerCount = Math.min(HYDRATE_CONCURRENCY, pending.length);
  await Promise.all(Array.from({ length: workerCount }, worker));
}
