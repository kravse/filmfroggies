/**
 * TMDB access with a Cache API layer for movie detail responses.
 *
 * Movie records are cached under a synthetic key that omits the credential, so the
 * cache survives a credential change and never stores the secret itself. Search is
 * transient and only memoized for the session.
 *
 * Movie metadata hydrates from the movie cache first, then the account D1 batch
 * cache (POST /api/movies/batch), then per-id TMDB fallback. Every layer that
 * resolves a record writes it back to the cache — including the batch, which is the
 * path list browsing actually uses — so a repeat visit paints with no network at
 * all. A cached record past the revalidation interval (30 days) still renders
 * immediately and is refreshed by folding its id into the batch already going out.
 *
 * The cache stores normalized records, the same shape D1 and the batch return, and
 * is read with appTmdb.parseStoredMovieRecord. Raw TMDB payloads go through
 * normalizeMovie instead; the two are not interchangeable.
 *
 * Poster images come straight from TMDB's image CDN, which takes no credential and
 * never touches the Worker.
 *
 * When logged in, all TMDB traffic goes through the account-gated Worker proxy
 * at /api/tmdb (Netlify redirect in production, direct Worker URL on localhost).
 */

const TMDB_CACHE_NAME = "moviecollector-tmdb-v2";
/** v1 held raw TMDB payloads; v2 holds normalized records. Reading one as the other
 * silently blanks every field, so the old bucket is dropped rather than migrated. */
const LEGACY_TMDB_CACHE_NAMES = ["moviecollector-tmdb-v1"];
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

/** Metadata requires an account session; poster images do not. */
function hasMovieData() {
  return hasTmdbAccess();
}

/* --- Cache --- */

/** The Cache API is unavailable on file:// and in some privacy modes. */
function openTmdbCache() {
  if (cachePromise === undefined) {
    if (typeof caches === "undefined") {
      cachePromise = Promise.resolve(null);
    } else {
      cachePromise = caches.open(TMDB_CACHE_NAME).catch(() => null);
      for (const name of LEGACY_TMDB_CACHE_NAMES) {
        caches.delete(name).catch(() => {});
      }
    }
  }
  return cachePromise;
}

/** Best effort: a full or blocked cache must never fail hydration. */
async function putMovieInCache(cache, movieId, record) {
  if (!cache || !record) {
    return;
  }
  try {
    await cache.put(
      movieCacheKey(movieId),
      appTmdbMovieCache.buildCachedMovieResponse(JSON.stringify(record)),
    );
  } catch (_) {
    /* Nothing to do; the record is already in memory. */
  }
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
      ...LEGACY_TMDB_CACHE_NAMES.map((name) => caches.delete(name)),
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

/** Raw TMDB payloads only. Cached and batched records are already normalized — read
 * those with appTmdb.parseStoredMovieRecord, which is not the same transform. */
function parseMovieText(text) {
  try {
    return appTmdb.normalizeMovie(JSON.parse(text));
  } catch (_) {
    return null;
  }
}

/**
 * Populate movieById from the movie cache for ids not already in memory.
 *
 * Returns `pending` (no usable cached record) and `stale` (rendered from a cache
 * entry past the revalidation interval). Stale ids are refreshed by the batch that
 * was going out anyway rather than one request each — a collection cached in one
 * import also expires in one go, so per-id refresh turned that into a burst.
 */
async function warmMoviesFromCache(ids, handlers = {}) {
  const cache = await openTmdbCache();
  if (!cache || !ids.length) {
    return { pending: ids.slice(), stale: [] };
  }
  const outcomes = await Promise.all(
    ids.map(async (id) => {
      const movieId = Number(id);
      try {
        const cached = await cache.match(movieCacheKey(movieId));
        if (!cached) {
          return { movieId, record: null, stale: false };
        }
        const record = appTmdb.parseStoredMovieRecord(await cached.text());
        if (!record || !appTmdb.isDetailedMovieRecord(record)) {
          return { movieId, record: null, stale: false };
        }
        return {
          movieId,
          record,
          stale: appTmdbMovieCache.shouldRevalidateMovieCache(cached),
        };
      } catch (_) {
        return { movieId, record: null, stale: false };
      }
    }),
  );
  const pending = [];
  const stale = [];
  for (const outcome of outcomes) {
    if (!outcome.record) {
      pending.push(outcome.movieId);
      continue;
    }
    movieById.set(outcome.movieId, outcome.record);
    movieErrors.delete(outcome.movieId);
    handlers.onRecord?.(outcome.movieId, outcome.record);
    if (outcome.stale) {
      stale.push(outcome.movieId);
    }
  }
  return { pending, stale };
}

async function fetchAndCacheMovie(movieId, cache) {
  const response = await fetchTmdb(appTmdb.buildMovieUrl(movieId));
  const record = parseMovieText(await response.text());
  if (!record) {
    throw new Error(`Unexpected TMDB payload for movie ${movieId}`);
  }
  await putMovieInCache(cache, movieId, record);
  return record;
}

/**
 * Single-movie read for the per-id fallback. A stale entry is refetched here rather
 * than served and refreshed behind the caller: this path only runs when the batch
 * could not resolve the id, so there is no batch left to fold the refresh into.
 */
async function getMovie(movieId) {
  const id = Number(movieId);
  const cache = await openTmdbCache();

  if (cache) {
    try {
      const cached = await cache.match(movieCacheKey(id));
      if (cached && !appTmdbMovieCache.shouldRevalidateMovieCache(cached)) {
        const record = appTmdb.parseStoredMovieRecord(await cached.text());
        if (record) {
          return record;
        }
      }
    } catch (_) {
      /* Fall through to the network. */
    }
  }

  return fetchAndCacheMovie(id, cache);
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
 * Resolve many movies: Cache API warm, then D1 batch per chunk,
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
        const error = new Error(payload?.error || `Movie batch failed (${response.status})`);
        error.batchStatus = response.status;
        throw error;
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

  const warmed = await warmMoviesFromCache(pending, handlers);
  let stillPending = warmed.pending;
  // Stale ids already rendered from cache; refreshing them is free because they
  // ride along with a batch that was going out for the pending ids anyway.
  const batchIds = [...stillPending, ...warmed.stale];
  if (!batchIds.length) {
    return { hydratedFromNetwork };
  }

  try {
    await devArtificialDelay();
    const batchMovies = await fetchMoviesBatch(batchIds);
    const cache = await openTmdbCache();
    const writes = [];
    for (const id of Object.keys(batchMovies)) {
      const record = batchMovies[id];
      const movieId = Number(id);
      const wasRendered = appTmdb.isDetailedMovieRecord(movieById.get(movieId));
      movieById.set(movieId, record);
      movieErrors.delete(movieId);
      writes.push(putMovieInCache(cache, movieId, record));
      if (wasRendered) {
        handlers.onUpdate?.(movieId, record);
      } else {
        handlers.onRecord?.(movieId, record);
      }
      hydratedFromNetwork = true;
    }
    await Promise.all(writes);
    stillPending = stillPending.filter(
      (id) => !appTmdb.isDetailedMovieRecord(movieById.get(id)),
    );
  } catch (error) {
    if (error?.batchStatus === 429) {
      // Per-id TMDB would hit the same limiter. Report it so the caller can
      // back off and retry instead of leaving the ids as permanent skeletons.
      return { hydratedFromNetwork, rateLimited: true };
    }
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
        const record = await getMovie(id);
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

const LIST_IDS_TIMEOUT_MS = 20000;

function parseSortedListIdsPayload(payload) {
  if (!payload || !Array.isArray(payload.ids)) {
    throw new Error("Invalid list sort response");
  }
  return payload.ids.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0);
}

async function fetchSortedListIds(listId, sort) {
  const base = appAccountSync.resolveAccountApiBase(window.location.hostname);
  const path = appAccountSync.buildListIdsPath(listId);
  const url = new URL(`${base}${path}`, window.location.origin);
  if (sort) {
    url.searchParams.set("sort", sort);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LIST_IDS_TIMEOUT_MS);
  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${accountConfig?.token || ""}`,
      },
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 401) {
        saveAccountConfig(null);
      }
      throw new Error(payload?.error || `List sort failed (${response.status})`);
    }
    return parseSortedListIdsPayload(payload);
  } finally {
    clearTimeout(timer);
  }
}

async function fetchFriendSortedListIds(friendUserId, listId, sort) {
  const base = appAccountSync.resolveAccountApiBase(window.location.hostname);
  const path = appAccountSync.buildFriendListIdsPath(friendUserId, listId);
  const url = new URL(`${base}${path}`, window.location.origin);
  if (sort) {
    url.searchParams.set("sort", sort);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LIST_IDS_TIMEOUT_MS);
  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${accountConfig?.token || ""}`,
      },
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 401) {
        saveAccountConfig(null);
      }
      throw new Error(payload?.error || `Friend list sort failed (${response.status})`);
    }
    return parseSortedListIdsPayload(payload);
  } finally {
    clearTimeout(timer);
  }
}
