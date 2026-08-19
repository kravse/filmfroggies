/**
 * TMDB access with a stale-while-revalidate Cache API layer.
 *
 * Movie detail responses are cached under a synthetic key that omits the
 * credential, so the cache survives a credential change and never stores the
 * secret itself. Search is transient and only memoized for the session.
 *
 * Ahead of all of that sits the snapshot committed under data/. Anything it
 * covers is served from the repo and never requested, so the API is only
 * consulted for ids added since the last `npm run scrape`.
 *
 * On Netlify, an optional hosted session routes API calls through /api/tmdb so
 * the read token stays server-side. Personal tokens in Settings still work.
 */

const TMDB_CACHE_NAME = "moviecollector-tmdb-v1";
const CACHE_KEY_ORIGIN = "https://moviecollector.invalid/tmdb";
const REQUEST_TIMEOUT_MS = 12000;
const HYDRATE_CONCURRENCY = 6;
const POSTER_LOAD_CONCURRENCY = 6;
const POSTER_LAZY_ROOT_MARGIN = "240px 0px";

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
let hostedSessionToken = "";

/** Records from data/movies.json, kept apart so hydrateMovies stays the only
 * path into movieById and its onRecord contract still holds. */
const localMovieById = new Map();
let localPosterSizes = [];
let localDataGeneratedAt = null;

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

/* --- Hosted session (Netlify proxy) --- */

function loadHostedSession() {
  try {
    hostedSessionToken = localStorage.getItem(appUserState.HOSTED_SESSION_KEY) || "";
  } catch (_) {
    hostedSessionToken = "";
  }
  return hostedSessionToken;
}

function saveHostedSession(token) {
  hostedSessionToken = String(token || "").trim();
  try {
    if (hostedSessionToken) {
      localStorage.setItem(appUserState.HOSTED_SESSION_KEY, hostedSessionToken);
    } else {
      localStorage.removeItem(appUserState.HOSTED_SESSION_KEY);
    }
  } catch (_) {
    /* Same private-browsing caveat as the TMDB credential. */
  }
  return hostedSessionToken;
}

function clearHostedSession() {
  return saveHostedSession("");
}

function hasHostedAccess() {
  return Boolean(hostedSessionToken);
}

function hasTmdbAccess() {
  return hasHostedAccess() || hasCredential();
}

function tmdbUrlToProxyRequest(url) {
  const parsed = new URL(String(url));
  const match = /^\/3(\/.+)$/.exec(parsed.pathname);
  const path = match ? match[1] : parsed.pathname;
  const searchParams = {};
  for (const key of ["query", "language", "page", "include_adult", "append_to_response", "region"]) {
    const value = parsed.searchParams.get(key);
    if (value != null && value !== "") {
      searchParams[key] = value;
    }
  }
  return { path, searchParams };
}

function buildProxyUrl(path, searchParams) {
  const url = new URL("/api/tmdb", window.location.origin);
  url.searchParams.set("path", path);
  for (const [key, value] of Object.entries(searchParams || {})) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

async function unlockHostedAccess(password) {
  const response = await fetch("/api/auth", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ password: String(password || "") }),
  });
  if (response.status === 503) {
    throw new Error("Hosted access is not available on this host.");
  }
  if (!response.ok) {
    throw new Error("Incorrect password.");
  }
  const body = await response.json();
  if (!body?.token) {
    throw new Error("Hosted access did not return a session.");
  }
  saveHostedSession(body.token);
  await verifyCredential();
}

function lockHostedAccess() {
  clearHostedSession();
}

/* --- Committed snapshot --- */

/**
 * Read once at startup. A repo with no snapshot yet 404s here, which is not an
 * error condition: the app simply falls back to the API path it always used.
 */
async function loadLocalMovieData() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(appLocalData.LOCAL_DATA_URL, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    if (!response.ok) {
      return false;
    }
    const data = appLocalData.normalizeLocalData(await response.json());
    localMovieById.clear();
    for (const record of data.records) {
      localMovieById.set(record.id, record);
    }
    localPosterSizes = data.posterSizes;
    localDataGeneratedAt = data.generatedAt;
    return localMovieById.size > 0;
  } catch (_) {
    /* No snapshot, or an unreadable one. Either way, use the API. */
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function hasLocalMovieData() {
  return localMovieById.size > 0;
}

function localMovieCount() {
  return localMovieById.size;
}

function localMovieRecord(movieId) {
  return localMovieById.get(Number(movieId)) || null;
}

function localDataStamp() {
  return localDataGeneratedAt;
}

/** True when something can render this collection, with or without a credential. */
function hasMovieData() {
  return hasTmdbAccess() || hasLocalMovieData();
}

/** Null whenever the snapshot cannot serve this poster, so callers fall back. */
function localPosterUrlFor(record, size) {
  const local = record ? localMovieById.get(record.id) : null;
  if (!local) {
    return null;
  }
  return appLocalData.localPosterUrl(local.poster, size, localPosterSizes);
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
        new Response(blob, {
          headers: { "content-type": blob.type || "image/jpeg" },
        }),
      );
    }
    // Keep the in-memory blob URL alive — imgs already display it and revoking
    // here breaks posters on every refresh after a cache hit.
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
      revalidatePoster(url, cache);
      return objectUrl;
    }
  }

  const response = await fetchPoster(url);
  const blob = await response.blob();
  if (cache) {
    await cache.put(
      url,
      new Response(blob, {
        headers: { "content-type": blob.type || "image/jpeg" },
      }),
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
      ".movie-detail-poster-frame, .add-movie-detail-scroll, .add-movie-picked, .search-suggest",
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
    let requestUrl = url;
    let init = { signal: controller.signal, headers: { accept: "application/json" } };

    if (hasHostedAccess()) {
      const { path, searchParams } = tmdbUrlToProxyRequest(url);
      requestUrl = buildProxyUrl(path, searchParams);
      init.headers.authorization = `Bearer ${hostedSessionToken}`;
    } else {
      init = appTmdb.buildRequestInit(tmdbCredential, { signal: controller.signal });
    }

    const response = await fetch(requestUrl, init);
    if (!response.ok) {
      if (hasHostedAccess() && response.status === 401) {
        clearHostedSession();
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
  const memoKey = `${normalizedTab}:v${appDiscover.DISCOVER_LIST_CACHE_VERSION}`;
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
    const pages = [];
    const todayIso = appDiscover.todayIsoDate();
    for (let page = 1; page <= appDiscover.DISCOVER_PAGES; page++) {
      const payload = await fetchTmdb(
        buildUrl({
          page,
          today: todayIso,
        }),
        { signal },
      ).then((response) => response.json());
      pages.push(appTmdb.normalizeSearchResults(payload));
    }
    return appDiscover.mergeDiscoverListEntries(pages, {
      filterUpcoming: normalizedTab === "upcoming",
      todayIso,
    });
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
 * Resolve many movies, snapshot first, then a bounded number of in-flight
 * requests for the rest. TMDB has no batch endpoint for arbitrary ids, so a
 * long list is many small requests — which is exactly what the snapshot avoids.
 */
async function hydrateMovies(ids, handlers = {}) {
  const queue = ids.filter((id) => !appTmdb.isDetailedMovieRecord(movieById.get(id)));
  if (!queue.length) {
    return { hydratedFromNetwork: false };
  }

  // The snapshot resolves synchronously, so anything it covers is on screen
  // before a single request is considered.
  const pending = [];
  for (const id of queue) {
    const local = localMovieById.get(id);
    if (!local) {
      pending.push(id);
      continue;
    }
    movieById.set(id, local);
    movieErrors.delete(id);
    handlers.onRecord?.(id, local);
  }

  // Without access every remaining request would fail, turning those cards into
  // error cards. Leaving the skeletons up reads better and stays accurate.
  if (!pending.length || !hasTmdbAccess()) {
    return { hydratedFromNetwork: false };
  }

  async function worker() {
    while (pending.length) {
      const id = pending.shift();
      try {
        await devArtificialDelay();
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
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return { hydratedFromNetwork: true };
}
