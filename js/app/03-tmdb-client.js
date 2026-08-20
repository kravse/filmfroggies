/**
 * TMDB access with a Cache API layer for movie detail responses.
 *
 * Movie detail responses are cached under a synthetic key that omits the
 * credential, so the cache survives a credential change and never stores the
 * secret itself. Cached movies are served immediately; TMDB is checked again
 * only after appTmdbMovieCache.MOVIE_CACHE_REVALIDATE_MS (30 days). Search is
 * transient and only memoized for the session.
 *
 * Ahead of network hydration, committed poster files under data/posters/ are
 * served when data/posters.json lists the id. Movie metadata comes from the
 * account D1 batch cache (POST /api/movies/batch), then per-id TMDB fallback.
 *
 * When logged in, all TMDB traffic goes through the account-gated Worker proxy
 * at /api/tmdb (Netlify redirect in production, direct Worker URL on localhost).
 */

const TMDB_CACHE_NAME = "moviecollector-tmdb-v1";
const CACHE_KEY_ORIGIN = "https://moviecollector.invalid/tmdb";
const REQUEST_TIMEOUT_MS = 12000;
const HYDRATE_CONCURRENCY = 6;
const BATCH_REQUEST_TIMEOUT_MS = 20000;
const POSTER_LOAD_CONCURRENCY = 6;
const POSTER_LAZY_ROOT_MARGIN = "320px 0px";

function isLocalhostHost() {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

/** Preview loading UI on localhost: ?slow=2500 (ms) or ?slow=1 (2.5s default). Ignored elsewhere. */
function devArtificialDelayMs() {
  if (!isLocalhostHost()) {
    return 0;
  }
  const raw = new URLSearchParams(window.location.search).get("slow");
  if (raw == null || raw === "") {
    return 0;
  }
  if (raw === "1" || raw === "true") {
    return 2500;
  }
  const ms = Number(raw);
  return Number.isFinite(ms) && ms > 0 ? ms : 0;
}

function devArtificialDelay() {
  const ms = devArtificialDelayMs();
  if (ms <= 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const searchMemo = new Map();
const discoverMemo = new Map();
const discoverInflight = new Map();

let cachePromise;
let posterCachePromise;
/** Session map from remote poster URL to blob: object URL. */
const posterBlobUrls = new Map();
const posterUrlInflight = new Map();
const posterLoadQueue = [];
let posterLoadsInFlight = 0;
let posterObserver;
/** Poster filenames from data/posters.json, keyed by TMDB id. */
const localPosterById = new Map();
let localPosterSizes = [];
let localPosterGeneratedAt = null;

function hasTmdbAccess() {
  return accountSyncEnabled();
}

function tmdbUrlToProxyRequest(url) {
  const parsed = new URL(String(url));
  const match = /^\/3(\/.+)$/.exec(parsed.pathname);
  const path = match ? match[1] : parsed.pathname;
  const allowed = new Set([
    "query",
    "language",
    "page",
    "include_adult",
    "append_to_response",
    "region",
    "sort_by",
    "include_video",
    "primary_release_date.gte",
    "primary_release_date.lte",
    "release_date.gte",
    "release_date.lte",
    "with_release_type",
    "with_original_language",
    "vote_count.gte",
  ]);
  const searchParams = {};
  for (const [key, value] of parsed.searchParams.entries()) {
    if (allowed.has(key) && value !== "") {
      searchParams[key] = value;
    }
  }
  return { path, searchParams };
}

function buildProxyUrl(path, searchParams) {
  const base = appAccountSync.resolveTmdbApiBase(window.location.hostname);
  const url = base.startsWith("http")
    ? new URL(base)
    : new URL(base, window.location.origin);
  url.searchParams.set("path", path);
  for (const [key, value] of Object.entries(searchParams || {})) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

/* --- Committed poster files --- */

/**
 * Read once at startup. A repo with no manifest yet 404s here, which is not an
 * error condition: posters simply fall back to TMDB's CDN.
 */
async function loadLocalPosterData() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(appLocalData.LOCAL_POSTERS_URL, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    if (!response.ok) {
      return false;
    }
    const data = appLocalData.normalizePostersManifest(await response.json());
    localPosterById.clear();
    for (const [id, poster] of Object.entries(data.posters)) {
      localPosterById.set(Number(id), poster);
    }
    localPosterSizes = data.posterSizes.length
      ? data.posterSizes
      : appLocalData.LOCAL_POSTER_SIZES;
    localPosterGeneratedAt = data.generatedAt;
    return localPosterById.size > 0;
  } catch (_) {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function hasLocalPosterData() {
  return localPosterById.size > 0;
}

function localPosterCount() {
  return localPosterById.size;
}

/** Legacy hook; metadata no longer lives in data/. */
function localMovieRecord(_movieId) {
  return null;
}

function localPosterStamp() {
  return localPosterGeneratedAt;
}

/** Metadata requires an account session; local posters only speed up images. */
function hasMovieData() {
  return hasTmdbAccess();
}

/** Null whenever the manifest cannot serve this poster, so callers fall back. */
function localPosterUrlFor(record, size) {
  if (!record) {
    return null;
  }
  const posterFile = localPosterById.get(record.id);
  if (!posterFile) {
    return null;
  }
  const fromPath = appLocalData.posterFileFromPath(record.posterPath);
  if (fromPath && fromPath !== posterFile) {
    return null;
  }
  return appLocalData.localPosterUrl(posterFile, size, localPosterSizes);
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
  discoverMemo.clear();
  discoverInflight.clear();
  posterUrlInflight.clear();
  posterLoadQueue.length = 0;
  posterLoadsInFlight = 0;
  revokePosterBlobUrls();
  if (typeof caches === "undefined") {
    return false;
  }
  cachePromise = undefined;
  posterCachePromise = undefined;
  try {
    const results = await Promise.all([
      caches.delete(TMDB_CACHE_NAME),
      caches.delete(appPosterCache.POSTER_CACHE_NAME),
    ]);
    return results.some(Boolean);
  } catch (_) {
    return false;
  }
}

/* --- Poster cache --- */

function openPosterCache() {
  if (posterCachePromise === undefined) {
    posterCachePromise =
      typeof caches === "undefined"
        ? Promise.resolve(null)
        : caches.open(appPosterCache.POSTER_CACHE_NAME).catch(() => null);
  }
  return posterCachePromise;
}

function revokePosterBlobUrls() {
  for (const objectUrl of posterBlobUrls.values()) {
    URL.revokeObjectURL(objectUrl);
  }
  posterBlobUrls.clear();
}

async function fetchPoster(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Poster request failed (${response.status})`);
    }
    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function revalidatePoster(url, cache) {
  try {
    const response = await fetchPoster(url);
    const blob = await response.blob();
    if (cache) {
      await cache.put(
        url,
        appTmdbMovieCache.buildCachedBlobResponse(blob, blob.type || "image/jpeg"),
      );
    }
  } catch (_) {
    /* Cached poster stays on screen. */
  }
}

async function resolvePosterObjectUrl(url) {
  if (!appPosterCache.isPosterUrl(url)) {
    return url;
  }
  const cachedObjectUrl = posterBlobUrls.get(url);
  if (cachedObjectUrl) {
    return cachedObjectUrl;
  }

  const cache = await openPosterCache();
  if (cache) {
    const cached = await cache.match(url);
    if (cached) {
      const blob = await cached.blob();
      const objectUrl = URL.createObjectURL(blob);
      posterBlobUrls.set(url, objectUrl);
      if (appTmdbMovieCache.shouldRevalidateCache(cached)) {
        revalidatePoster(url, cache);
      }
      return objectUrl;
    }
  }

  const response = await fetchPoster(url);
  const blob = await response.blob();
  if (cache) {
    await cache.put(
      url,
      appTmdbMovieCache.buildCachedBlobResponse(blob, blob.type || "image/jpeg"),
    );
  }
  const objectUrl = URL.createObjectURL(blob);
  posterBlobUrls.set(url, objectUrl);
  return objectUrl;
}

async function getPosterObjectUrl(url) {
  if (!appPosterCache.isPosterUrl(url)) {
    return url;
  }
  const cachedObjectUrl = posterBlobUrls.get(url);
  if (cachedObjectUrl) {
    return cachedObjectUrl;
  }
  if (posterUrlInflight.has(url)) {
    return posterUrlInflight.get(url);
  }
  const promise = resolvePosterObjectUrl(url);
  posterUrlInflight.set(url, promise);
  try {
    return await promise;
  } finally {
    posterUrlInflight.delete(url);
  }
}

async function attachPosterImage(img) {
  const url = img.getAttribute("data-poster-src");
  if (!url || img.getAttribute("src")) {
    return;
  }
  img.dataset.posterLoading = "true";
  await devArtificialDelay();
  const frame = img.closest(".movie-detail-poster-frame");
  const gridWrap = img.closest(".poster-wrap");
  const markGridPosterReady = () => {
    img.classList.add("is-poster-ready");
  };
  if (frame) {
    img.addEventListener("load", () => frame.classList.add("is-loaded"), { once: true });
    img.addEventListener("error", () => frame.classList.add("is-loaded"), { once: true });
  } else if (gridWrap) {
    img.addEventListener("load", markGridPosterReady, { once: true });
    img.addEventListener("error", markGridPosterReady, { once: true });
  }
  try {
    const displayUrl = await getPosterObjectUrl(url);
    if (img.isConnected && img.getAttribute("data-poster-src") === url) {
      img.src = displayUrl;
      if (img.complete) {
        if (frame) {
          frame.classList.add("is-loaded");
        } else if (gridWrap) {
          markGridPosterReady();
        }
      }
    }
  } catch (_) {
    if (img.isConnected && img.getAttribute("data-poster-src") === url) {
      img.src = url;
      if (img.complete) {
        if (frame) {
          frame.classList.add("is-loaded");
        } else if (gridWrap) {
          markGridPosterReady();
        }
      }
    }
  } finally {
    delete img.dataset.posterLoading;
  }
}

function shouldEagerLoadPoster(img) {
  return Boolean(
    img.closest(
      ".movie-detail-poster-frame, .add-movie-detail-scroll, .add-movie-picked, .search-suggest, .custom-list-card-covers",
    ),
  );
}

function ensurePosterObserver() {
  if (posterObserver || typeof IntersectionObserver === "undefined") {
    return posterObserver;
  }
  posterObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }
        const img = entry.target;
        posterObserver.unobserve(img);
        img.removeAttribute("data-poster-lazy");
        enqueuePosterLoad(img);
      }
    },
    { root: null, rootMargin: POSTER_LAZY_ROOT_MARGIN, threshold: 0.01 },
  );
  return posterObserver;
}

function enqueuePosterLoad(img) {
  if (!(img instanceof HTMLImageElement)) {
    return;
  }
  if (img.getAttribute("src") || img.dataset.posterLoading === "true") {
    return;
  }
  posterLoadQueue.push(img);
  drainPosterLoadQueue();
}

function drainPosterLoadQueue() {
  while (posterLoadsInFlight < POSTER_LOAD_CONCURRENCY && posterLoadQueue.length) {
    const img = posterLoadQueue.shift();
    if (!(img instanceof HTMLImageElement) || !img.isConnected || img.getAttribute("src")) {
      continue;
    }
    posterLoadsInFlight += 1;
    attachPosterImage(img).finally(() => {
      posterLoadsInFlight -= 1;
      drainPosterLoadQueue();
    });
  }
}

function bindPosterImages(root) {
  if (!root) {
    return;
  }
  const observer = ensurePosterObserver();
  for (const img of root.querySelectorAll("img[data-poster-src]:not([src])")) {
    if (shouldEagerLoadPoster(img) || !observer) {
      enqueuePosterLoad(img);
      continue;
    }
    img.setAttribute("data-poster-lazy", "true");
    observer.observe(img);
  }
}

/* --- Requests --- */

async function fetchTmdb(url, options = {}) {
  if (!hasTmdbAccess()) {
    throw new Error("Sign in to search TMDB");
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
    const { path, searchParams } = tmdbUrlToProxyRequest(url);
    const requestUrl = buildProxyUrl(path, searchParams);
    const response = await fetch(requestUrl, {
      signal: controller.signal,
      headers: {
        accept: "application/json",
        authorization: `Bearer ${accountConfig?.token || ""}`,
      },
    });
    if (!response.ok) {
      if (response.status === 401) {
        saveAccountConfig(null);
      }
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
 * Background refresh when a cache entry is older than the revalidation interval.
 * Failures are intentionally silent: the caller already has a usable record.
 */
async function revalidateMovie(movieId, cacheKey, cache, cachedText, onUpdate) {
  try {
    const response = await fetchTmdb(appTmdb.buildMovieUrl(movieId));
    const text = await response.text();
    if (text === cachedText) {
      if (cache) {
        await cache.put(cacheKey, appTmdbMovieCache.buildCachedMovieResponse(text));
      }
      return;
    }
    const record = parseMovieText(text);
    if (!record) {
      return;
    }
    if (cache) {
      await cache.put(cacheKey, appTmdbMovieCache.buildCachedMovieResponse(text));
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
    await cache.put(cacheKey, appTmdbMovieCache.buildCachedMovieResponse(text));
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
        if (appTmdbMovieCache.shouldRevalidateMovieCache(cached)) {
          revalidateMovie(id, cacheKey, cache, cachedText, options.onUpdate);
        }
        return record;
      }
    }
  }

  return fetchAndCacheMovie(id, cacheKey, cache);
}

async function searchMovies(query, options = {}) {
  const trimmed = String(query || "").trim();
  if (!trimmed) {
    return [];
  }
  const directorMode = options.mode === "director";
  const cacheKey = `${directorMode ? "director" : "movie"}:${trimmed}`;
  if (searchMemo.has(cacheKey)) {
    return searchMemo.get(cacheKey);
  }

  const signal = options.signal;
  let results;

  if (directorMode) {
    const personPayload = await fetchTmdb(appTmdb.buildPersonSearchUrl(trimmed), { signal }).then(
      (response) => response.json(),
    );
    const directorCandidates = appTmdb.pickDirectorSearchCandidates(
      appTmdb.normalizePersonSearchResults(personPayload),
      { allowAnyPerson: true },
    );
    const directorEntries = await Promise.all(
      directorCandidates.map(async (person) => {
        const creditsPayload = await fetchTmdb(appTmdb.buildPersonMovieCreditsUrl(person.id), {
          signal,
        }).then((response) => response.json());
        return {
          personName: person.name,
          movies: appTmdb.directedMoviesFromPersonCredits(creditsPayload),
        };
      }),
    );
    results = appTmdb.flattenDirectorSearchResults(directorEntries);
  } else {
    const moviePayload = await fetchTmdb(appTmdb.buildSearchUrl(trimmed), { signal }).then(
      (response) => response.json(),
    );
    results = appTmdb.normalizeSearchResults(moviePayload);
  }

  searchMemo.set(cacheKey, results);
  return results;
}

async function fetchDiscoverMovies(tab, options = {}) {
  const normalizedTab = appDiscover.normalizeDiscoverTab(tab);
  const page = appDiscover.normalizeDiscoverPage(options.page);
  const memoKey = `${normalizedTab}:p${page}:v${appDiscover.DISCOVER_LIST_CACHE_VERSION}`;
  if (discoverMemo.has(memoKey)) {
    return discoverMemo.get(memoKey);
  }
  if (discoverInflight.has(memoKey)) {
    return discoverInflight.get(memoKey);
  }

  const promise = (async () => {
    const signal = options.signal;
    const buildUrl =
      normalizedTab === "now-playing" ? appTmdb.buildNowPlayingUrl : appTmdb.buildUpcomingUrl;
    const payload = await fetchTmdb(
      buildUrl({ page }),
      { signal },
    ).then((response) => response.json());
    const meta = appDiscover.normalizeDiscoverListMeta(payload);
    const todayIso = appDiscover.todayIsoDate();
    const entries = appDiscover.filterDiscoverPageEntries(
      appTmdb.normalizeSearchResults(payload),
      {
        filterUpcoming: normalizedTab === "upcoming",
        filterNowPlaying: normalizedTab === "now-playing",
        filterNewPremiere: true,
        todayIso,
        nowPlayingWindowDays: appTmdb.DEFAULT_NOW_PLAYING_WINDOW_DAYS,
        maxPremiereLagDays: appDiscover.DISCOVER_MAX_PREMIERE_LAG_DAYS,
        isLastPage: meta.page >= meta.totalPages,
      },
    );
    return { ...meta, entries };
  })();

  discoverInflight.set(memoKey, promise);
  try {
    const entries = await promise;
    discoverMemo.set(memoKey, entries);
    return entries;
  } finally {
    discoverInflight.delete(memoKey);
  }
}

/**
 * Resolve many movies: committed snapshot, then one D1 batch request per chunk,
 * then per-id TMDB fallback for anything still missing.
 */
async function fetchMoviesBatch(ids) {
  const chunks = appMovieCache.chunkIds(ids);
  const merged = {};
  for (const chunk of chunks) {
    if (!chunk.length) {
      continue;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), BATCH_REQUEST_TIMEOUT_MS);
    try {
      const base = appAccountSync.resolveAccountApiBase(window.location.hostname);
      const response = await fetch(`${base}${appAccountSync.MOVIES_BATCH_PATH}`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: `Bearer ${accountConfig?.token || ""}`,
        },
        body: JSON.stringify({ ids: chunk }),
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        if (response.status === 401) {
          saveAccountConfig(null);
        }
        throw new Error(payload?.error || `Movie batch failed (${response.status})`);
      }
      const parsed = appMovieCache.parseBatchResponse(payload);
      Object.assign(merged, parsed.movies);
    } finally {
      clearTimeout(timer);
    }
  }
  return merged;
}

async function hydrateMovies(ids, handlers = {}) {
  const pending = ids.filter((id) => !appTmdb.isDetailedMovieRecord(movieById.get(id)));
  if (!pending.length) {
    return { hydratedFromNetwork: false };
  }

  if (!hasTmdbAccess()) {
    return { hydratedFromNetwork: false };
  }

  let hydratedFromNetwork = false;
  let stillPending = pending;

  try {
    await devArtificialDelay();
    const batchMovies = await fetchMoviesBatch(stillPending);
    for (const id of Object.keys(batchMovies)) {
      const record = batchMovies[id];
      const movieId = Number(id);
      movieById.set(movieId, record);
      movieErrors.delete(movieId);
      handlers.onRecord?.(movieId, record);
      hydratedFromNetwork = true;
    }
    stillPending = stillPending.filter(
      (id) => !appTmdb.isDetailedMovieRecord(movieById.get(id)),
    );
  } catch (_) {
    /* Fall through to per-id TMDB for remaining ids. */
  }

  if (!stillPending.length) {
    return { hydratedFromNetwork };
  }

  async function worker() {
    while (stillPending.length) {
      const id = stillPending.shift();
      try {
        await devArtificialDelay();
        const record = await getMovie(id, { onUpdate: handlers.onUpdate });
        movieById.set(id, record);
        movieErrors.delete(id);
        handlers.onRecord?.(id, record);
        hydratedFromNetwork = true;
      } catch (_) {
        movieErrors.add(id);
        handlers.onRecord?.(id, null);
      }
    }
  }

  const workerCount = Math.min(HYDRATE_CONCURRENCY, stillPending.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return { hydratedFromNetwork };
}
