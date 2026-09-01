/* Generated from scripts/lib/card-html.js — run npm run bundle:letterboxd */

const appCardHtml = (function () {
  /** Formatting helpers shared by cards, suggestions, and the detail overlay. */

  const HTML_ESCAPES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  function escapeHtml(value) {
    if (value == null) {
      return "";
    }
    return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
  }

  /** TMDB release dates are `YYYY-MM-DD`; anything else yields no year. */
  function formatYear(releaseDate) {
    const match = /^(\d{4})/.exec(String(releaseDate || "").trim());
    return match ? match[1] : "";
  }

  /** Full calendar date for discover cards, e.g. `August 26, 2026`. */
  function formatReleaseDate(releaseDate) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(releaseDate || "").trim());
    if (!match) {
      return "";
    }
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const date = new Date(year, month, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return "";
    }
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }

  function formatRuntime(minutes) {
    const total = Number(minutes);
    if (!Number.isFinite(total) || total <= 0) {
      return "";
    }
    const hours = Math.floor(total / 60);
    const rest = total % 60;
    if (!hours) {
      return `${rest}m`;
    }
    if (!rest) {
      return `${hours}h`;
    }
    return `${hours}h ${rest}m`;
  }

  /** One decimal for ratings; 10 alone drops the fraction (0 → "0.0"). */
  function formatRatingLabel(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) {
      return null;
    }
    const rounded = Math.round(num * 10) / 10;
    if (rounded === 10) {
      return "10";
    }
    return rounded.toFixed(1);
  }

  function formatRating(voteAverage) {
    if (voteAverage == null || voteAverage === "") {
      return "";
    }
    const value = Number(voteAverage);
    if (!Number.isFinite(value) || value < 0) {
      return "";
    }
    const label = formatRatingLabel(value);
    return label == null ? "" : label;
  }

  function joinNames(names, limit) {
    if (!Array.isArray(names)) {
      return "";
    }
    const cleaned = names
      .map((name) => String(name || "").trim())
      .filter(Boolean);
    const capped =
      typeof limit === "number" && limit > 0 ? cleaned.slice(0, limit) : cleaned;
    return capped.join(", ");
  }

  const WATCHLIST_PRESET_ICON_SVG =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>';

  const VIEWING_DATE_ICON_SVG =
    '<svg class="viewing-date-icon" viewBox="0 0 20 20" aria-hidden="true" fill="none"><path d="M7.5 8 5.5 3M12.5 8 14.5 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><rect x="3.5" y="8" width="13" height="8.5" rx="1.25" stroke="currentColor" stroke-width="1.5"/><rect x="5.25" y="9.75" width="9.5" height="5" rx="0.5" stroke="currentColor" stroke-width="1.25"/><path d="M6.25 16.5v1.25M13.75 16.5v1.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

  function viewingDateIconHtml() {
    return VIEWING_DATE_ICON_SVG;
  }

  function viewingDatePickerHtml(options = {}) {
    const toggleId = String(options.toggleId || "viewing-date-toggle");
    const fieldId = String(options.fieldId || "viewing-date-field");
    const inputId = String(options.inputId || "viewing-date-input");
    const clearId = String(options.clearId || "viewing-date-clear");
    const toggleClass = escapeHtml(
      String(options.toggleClass || "ghost-btn viewing-date-picker-toggle"),
    );
    const fieldClass = escapeHtml(String(options.fieldClass || "viewing-date-picker-field"));
    const icon = viewingDateIconHtml();
    return `<button type="button" class="${toggleClass}" id="${escapeHtml(toggleId)}">${icon}Add viewing date</button>
  <div class="${fieldClass}" id="${escapeHtml(fieldId)}" hidden>
    <div class="viewing-date-input-row">${icon}<input type="date" id="${escapeHtml(inputId)}" aria-label="Date watched" /></div>
    <button type="button" class="user-rating-clear-btn" id="${escapeHtml(clearId)}">Clear viewing date</button>
  </div>`;
  }

  const UNLISTED_PRESET_ICON_SVG =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.75"/><path d="M8.5 12h7" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>';

  /** Detail footer preset status icons (`watched` | `watchlist` | `none`). */
  function detailPresetStatusIconHtml(state) {
    if (state === "watchlist") {
      return `<span class="add-list-icon add-list-icon-watchlist" aria-hidden="true">${WATCHLIST_PRESET_ICON_SVG}</span>`;
    }
    if (state === "watched") {
      return `<span class="add-list-icon" aria-hidden="true">✓</span>`;
    }
    return `<span class="add-list-icon add-list-icon-unlisted" aria-hidden="true">${UNLISTED_PRESET_ICON_SVG}</span>`;
  }

  /** Same square icons as the add-movie list picker (`watched` | `watchlist`). */
  function addListPresetIconHtml(preset) {
    if (preset === "watchlist") {
      return `<span class="add-list-icon add-list-icon-watchlist" aria-hidden="true">${WATCHLIST_PRESET_ICON_SVG}</span>`;
    }
    return `<span class="add-list-icon" aria-hidden="true">✓</span>`;
  }

  function discoverPresetButtonInnerHtml(preset, label) {
    return `${addListPresetIconHtml(preset)}<span class="discover-preset-btn-label">${escapeHtml(label)}</span>`;
  }

  return {
    escapeHtml,
    formatRatingLabel,
  };
})();

/* Generated from scripts/lib/tmdb.js — run npm run bundle:letterboxd */

const appTmdb = (function () {
  /**
   * TMDB URL building, credential handling, and response normalization.
   *
   * Hosts are constants: only query values are ever user-derived. Image paths
   * from the API are validated before being interpolated into a URL.
   */

  const API_BASE = "https://api.themoviedb.org/3";
  const IMAGE_BASE = "https://image.tmdb.org/t/p";

  const POSTER_SIZES = {
    suggest: "w92",
    card: "w185",
    detailGrid: "w342",
    detail: "w500",
  };

  const ALLOWED_IMAGE_SIZES = new Set([
    "w92",
    "w154",
    "w185",
    "w342",
    "w500",
    "w780",
    "original",
  ]);

  const IMAGE_PATH_PATTERN = /^\/[A-Za-z0-9._-]+\.(jpg|jpeg|png|webp)$/i;

  const CAST_LIMIT = 8;
  const DEFAULT_NOW_PLAYING_WINDOW_DAYS = 84;
  /** World premiere must fall in the same window as the US theatrical run (new only). */
  const DEFAULT_NOW_PLAYING_PRIMARY_WINDOW_DAYS = DEFAULT_NOW_PLAYING_WINDOW_DAYS;
  /** Match TMDB’s /movie/upcoming window (~4 weeks of US theatrical dates). */
  const DEFAULT_UPCOMING_WINDOW_DAYS = 28;
  /** Minimum TMDB vote count for discover browse queries (drops zero-interest listings). */
  const DEFAULT_DISCOVER_MIN_VOTE_COUNT = 10;

  /**
   * Only the v4 API Read Access Token is accepted. It is a JWT: three
   * dot-separated base64url segments whose header begins with `eyJ`. Matching on
   * that structure beats a length threshold — it is exact and self-describing.
   */
  const READ_TOKEN_PATTERN =
    /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

  /** A v3 API key is 32 hex characters, which is worth naming in the error. */
  const V3_API_KEY_PATTERN = /^[0-9a-f]{32}$/i;

  function isReadAccessToken(credential) {
    return READ_TOKEN_PATTERN.test(String(credential || "").trim());
  }

  function looksLikeV3ApiKey(credential) {
    return V3_API_KEY_PATTERN.test(String(credential || "").trim());
  }

  /** Null when the credential is usable, otherwise a message for the user. */
  function describeCredentialProblem(credential) {
    const value = String(credential || "").trim();
    if (!value) {
      return "Paste your TMDB API Read Access Token.";
    }
    if (isReadAccessToken(value)) {
      return null;
    }
    if (looksLikeV3ApiKey(value)) {
      return "That is the v3 API Key. This app needs the API Read Access Token — the much longer value further down the same TMDB API settings page.";
    }
    return 'That does not look like a TMDB API Read Access Token. It should be three dot-separated sections starting with "eyJ".';
  }

  function buildRequestInit(credential, options = {}) {
    const headers = { accept: "application/json" };
    if (isReadAccessToken(credential)) {
      headers.Authorization = `Bearer ${String(credential).trim()}`;
    }
    const init = { headers };
    if (options.signal) {
      init.signal = options.signal;
    }
    return init;
  }

  /** The credential travels in the Authorization header, never in the URL. */
  function buildUrl(pathname, params) {
    const url = new URL(`${API_BASE}${pathname}`);
    for (const [key, value] of Object.entries(params || {})) {
      if (value != null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  function buildSearchUrl(query) {
    return buildUrl("/search/movie", {
      query: String(query || "").trim(),
      include_adult: "false",
      language: "en-US",
      page: "1",
    });
  }

  function buildPersonSearchUrl(query) {
    return buildUrl("/search/person", {
      query: String(query || "").trim(),
      include_adult: "false",
      language: "en-US",
      page: "1",
    });
  }

  function buildPersonMovieCreditsUrl(personId) {
    const id = Number(personId);
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error(`Invalid person id: ${personId}`);
    }
    return buildUrl(`/person/${id}/movie_credits`, {
      language: "en-US",
    });
  }

  function buildMovieUrl(movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error(`Invalid movie id: ${movieId}`);
    }
    return buildUrl(`/movie/${id}`, {
      append_to_response: "credits",
      language: "en-US",
    });
  }

  function buildConfigurationUrl() {
    return buildUrl("/configuration", {});
  }

  function formatIsoDate(date) {
    const value = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(value.getTime())) {
      throw new Error("Invalid date");
    }
    return value.toISOString().slice(0, 10);
  }

  function offsetIsoDate(base, dayOffset) {
    const value =
      base instanceof Date
        ? new Date(base.getTime())
        : new Date(`${formatIsoDate(base)}T00:00:00.000Z`);
    if (Number.isNaN(value.getTime())) {
      throw new Error("Invalid date");
    }
    value.setUTCDate(value.getUTCDate() + dayOffset);
    return formatIsoDate(value);
  }

  function buildDiscoverMovieUrl(options = {}) {
    const page = Number(options.page);
    const params = {
      include_adult: "false",
      include_video: "false",
      language: options.language || "en-US",
      page: Number.isInteger(page) && page > 0 ? String(page) : "1",
      region: options.region || "US",
      with_release_type: "2|3",
      sort_by: options.sortBy || "popularity.desc",
    };
    if (options.releaseDateGte) {
      params["release_date.gte"] = options.releaseDateGte;
    }
    if (options.releaseDateLte) {
      params["release_date.lte"] = options.releaseDateLte;
    }
    if (options.primaryReleaseDateGte) {
      params["primary_release_date.gte"] = options.primaryReleaseDateGte;
    }
    if (options.primaryReleaseDateLte) {
      params["primary_release_date.lte"] = options.primaryReleaseDateLte;
    }
    if (options.voteCountGte != null) {
      params["vote_count.gte"] = String(options.voteCountGte);
    }
    return buildUrl("/discover/movie", params);
  }

  function buildUpcomingUrl(options = {}) {
    const today = options.today || formatIsoDate(new Date());
    const windowDays = Number(options.windowDays) || DEFAULT_UPCOMING_WINDOW_DAYS;
    const windowEnd = offsetIsoDate(today, windowDays);
    return buildDiscoverMovieUrl({
      language: options.language,
      page: options.page,
      region: options.region,
      releaseDateGte: today,
      releaseDateLte: windowEnd,
      primaryReleaseDateGte: today,
      primaryReleaseDateLte: windowEnd,
      sortBy: "popularity.desc",
    });
  }

  function buildNowPlayingUrl(options = {}) {
    const today = options.today || formatIsoDate(new Date());
    const windowDays = Number(options.windowDays) || DEFAULT_NOW_PLAYING_WINDOW_DAYS;
    const primaryWindowDays =
      Number(options.primaryWindowDays) || DEFAULT_NOW_PLAYING_PRIMARY_WINDOW_DAYS;
    const minVotes = Number(options.minVoteCount) || DEFAULT_DISCOVER_MIN_VOTE_COUNT;
    return buildDiscoverMovieUrl({
      language: options.language,
      page: options.page,
      region: options.region,
      releaseDateGte: offsetIsoDate(today, -windowDays),
      releaseDateLte: today,
      primaryReleaseDateGte: offsetIsoDate(today, -primaryWindowDays),
      primaryReleaseDateLte: today,
      voteCountGte: minVotes,
      sortBy: "popularity.desc",
    });
  }

  function isValidImagePath(imagePath) {
    return IMAGE_PATH_PATTERN.test(String(imagePath || ""));
  }

  function buildImageUrl(imagePath, size = POSTER_SIZES.card) {
    if (!isValidImagePath(imagePath) || !ALLOWED_IMAGE_SIZES.has(size)) {
      return null;
    }
    return `${IMAGE_BASE}/${size}${imagePath}`;
  }

  function cleanText(value) {
    const text = String(value == null ? "" : value).trim();
    return text || null;
  }

  function cleanImagePath(value) {
    return isValidImagePath(value) ? String(value) : null;
  }

  function normalizeSearchResults(payload) {
    const results = Array.isArray(payload?.results) ? payload.results : [];
    return results
      .filter((entry) => Number.isInteger(Number(entry?.id)))
      .map((entry) => normalizeSearchMovieEntry(entry));
  }

  function normalizeSearchMovieEntry(entry) {
    const voteAverage = Number(entry.vote_average);
    return {
      id: Number(entry.id),
      title: cleanText(entry.title) || cleanText(entry.original_title) || "Untitled",
      releaseDate: cleanText(entry.release_date),
      primaryReleaseDate: cleanText(entry.primary_release_date),
      posterPath: cleanImagePath(entry.poster_path),
      overview: cleanText(entry.overview),
      voteCount: Number(entry.vote_count) || 0,
      popularity: Number(entry.popularity) || 0,
      voteAverage: Number.isFinite(voteAverage) && voteAverage > 0 ? voteAverage : null,
    };
  }

  function normalizePersonSearchResults(payload) {
    const results = Array.isArray(payload?.results) ? payload.results : [];
    return results
      .filter((entry) => Number.isInteger(Number(entry?.id)))
      .map((entry) => ({
        id: Number(entry.id),
        name: cleanText(entry.name) || "Unknown",
        knownForDepartment: cleanText(entry.known_for_department),
      }));
  }

  const DIRECTOR_SEARCH_CANDIDATE_LIMIT = 2;
  const DIRECTOR_SEARCH_MOVIE_LIMIT = 15;

  function pickDirectorSearchCandidates(persons, options = {}) {
    const directors = persons.filter((person) => person.knownForDepartment === "Directing");
    if (directors.length) {
      return directors.slice(0, DIRECTOR_SEARCH_CANDIDATE_LIMIT);
    }
    if (options.allowAnyPerson) {
      return persons.slice(0, DIRECTOR_SEARCH_CANDIDATE_LIMIT);
    }
    return [];
  }

  function flattenDirectorSearchResults(directorEntries) {
    return mergeMovieSearchResults([], directorEntries);
  }

  function directedMoviesFromPersonCredits(payload) {
    const crew = Array.isArray(payload?.crew) ? payload.crew : [];
    const seen = new Set();
    const movies = [];
    for (const entry of crew) {
      if (entry?.job !== "Director") {
        continue;
      }
      const id = Number(entry?.id);
      if (!Number.isInteger(id) || id <= 0 || seen.has(id)) {
        continue;
      }
      seen.add(id);
      movies.push(normalizeSearchMovieEntry(entry));
    }
    movies.sort((left, right) => {
      const leftTime = Date.parse(left.releaseDate || "") || 0;
      const rightTime = Date.parse(right.releaseDate || "") || 0;
      return rightTime - leftTime;
    });
    return movies.slice(0, DIRECTOR_SEARCH_MOVIE_LIMIT);
  }

  /** Title hits first; director filmography fills in movies not already listed. */
  function mergeMovieSearchResults(movieResults, directorEntries) {
    const seen = new Set(movieResults.map((movie) => movie.id));
    const merged = movieResults.map((movie) => ({ ...movie }));
    for (const entry of directorEntries) {
      const personName = entry?.personName;
      const movies = Array.isArray(entry?.movies) ? entry.movies : [];
      for (const movie of movies) {
        if (seen.has(movie.id)) {
          continue;
        }
        seen.add(movie.id);
        merged.push({
          ...movie,
          directorHint: personName || null,
        });
      }
    }
    return merged;
  }

  function directorsFromCredits(credits) {
    const crew = Array.isArray(credits?.crew) ? credits.crew : [];
    return crew
      .filter((member) => member?.job === "Director")
      .map((member) => cleanText(member.name))
      .filter(Boolean);
  }

  function castFromCredits(credits) {
    const cast = Array.isArray(credits?.cast) ? credits.cast : [];
    return cast
      .slice(0, CAST_LIMIT)
      .map((member) => cleanText(member.name))
      .filter(Boolean);
  }

  /** Full movie/detail records always carry a genres array; search stubs do not. */
  function isDetailedMovieRecord(record) {
    return Boolean(record && Array.isArray(record.genres));
  }

  function normalizeMovie(payload) {
    const id = Number(payload?.id);
    if (!Number.isInteger(id) || id <= 0) {
      return null;
    }
    const runtime = Number(payload.runtime);
    const voteAverage = Number(payload.vote_average);
    return {
      id,
      title: cleanText(payload.title) || cleanText(payload.original_title) || "Untitled",
      releaseDate: cleanText(payload.release_date),
      overview: cleanText(payload.overview),
      tagline: cleanText(payload.tagline),
      posterPath: cleanImagePath(payload.poster_path),
      backdropPath: cleanImagePath(payload.backdrop_path),
      runtime: Number.isFinite(runtime) && runtime > 0 ? runtime : null,
      voteAverage: Number.isFinite(voteAverage) && voteAverage > 0 ? voteAverage : null,
      genres: Array.isArray(payload.genres)
        ? payload.genres.map((genre) => cleanText(genre?.name)).filter(Boolean)
        : [],
      directors: directorsFromCredits(payload.credits),
      cast: castFromCredits(payload.credits),
    };
  }

  /**
   * Read a record already in the normalized shape above — what D1, the movies batch
   * response, and the browser movie cache all store.
   *
   * This exists because normalizeMovie is not idempotent: it reads raw TMDB fields
   * (release_date, poster_path, genres as objects), so running it on its own output
   * blanks every field while leaving genres an array, which still satisfies
   * isDetailedMovieRecord. The corruption would validate as healthy. Pick the reader
   * that matches the shape rather than trying to make one handle both.
   */
  function parseStoredMovieRecord(json) {
    if (json == null || json === "") {
      return null;
    }
    try {
      const parsed = typeof json === "string" ? JSON.parse(json) : json;
      if (!isDetailedMovieRecord(parsed)) {
        return null;
      }
      const id = Number(parsed.id);
      if (!Number.isInteger(id) || id <= 0) {
        return null;
      }
      const runtime = Number(parsed.runtime);
      const voteAverage = Number(parsed.voteAverage);
      return {
        id,
        title: cleanText(parsed.title) || "Untitled",
        releaseDate: cleanText(parsed.releaseDate),
        overview: cleanText(parsed.overview),
        tagline: cleanText(parsed.tagline),
        posterPath: cleanImagePath(parsed.posterPath),
        backdropPath: cleanImagePath(parsed.backdropPath),
        runtime: Number.isFinite(runtime) && runtime > 0 ? runtime : null,
        voteAverage: Number.isFinite(voteAverage) && voteAverage > 0 ? voteAverage : null,
        genres: Array.isArray(parsed.genres)
          ? parsed.genres.map((genre) => cleanText(genre)).filter(Boolean)
          : [],
        directors: Array.isArray(parsed.directors)
          ? parsed.directors.map((name) => cleanText(name)).filter(Boolean)
          : [],
        cast: Array.isArray(parsed.cast)
          ? parsed.cast.map((name) => cleanText(name)).filter(Boolean)
          : [],
      };
    } catch (_) {
      return null;
    }
  }

  return {
    isReadAccessToken,
    buildRequestInit,
    buildSearchUrl,
    normalizeSearchResults,
  };
})();

/* Generated from scripts/lib/lists.js — run npm run bundle:letterboxd */

const appLists = (function () {
  /**
   * Two fixed lists, in tab order. There is deliberately no way to create,
   * rename, or delete one: these are statuses, not user-defined collections.
   *
   * One invariant defines how they relate, enforced on read as well as on write:
   *
   *   Watchlist is disjoint from Watched. A movie is either unseen (watchlist)
   *   or seen (watched), never both.
   *
   * `movieIds` carries membership and order in one array. Every function is pure
   * and returns new arrays.
   */

  const WATCHED_ID = "watched";
  const WATCHLIST_ID = "watchlist";

  const PRESET_LISTS = [
    { id: WATCHED_ID, name: "Watched" },
    { id: WATCHLIST_ID, name: "Watchlist" },
  ];

  const LIST_IDS = PRESET_LISTS.map((preset) => preset.id);
  const DEFAULT_LIST_ID = WATCHED_ID;
  const STATUS_PRIORITY = [WATCHED_ID, WATCHLIST_ID];

  function isListId(listId) {
    return LIST_IDS.includes(listId);
  }

  function isListReorderable(listId) {
    return isListId(listId);
  }

  function normalizeMovieIds(raw) {
    if (!Array.isArray(raw)) {
      return [];
    }
    const seen = new Set();
    const ids = [];
    for (const entry of raw) {
      const id = Number(entry);
      if (!Number.isInteger(id) || id <= 0 || seen.has(id)) {
        continue;
      }
      seen.add(id);
      ids.push(id);
    }
    return ids;
  }

  function defaultLists() {
    return PRESET_LISTS.map((preset) => ({ ...preset, movieIds: [] }));
  }

  /**
   * Rebuilds the two lists from stored data: preset order and names always win,
   * unknown list ids are dropped, and the watchlist/watched invariant is repaired.
   */
  function normalizeLists(raw) {
    const stored = Array.isArray(raw) ? raw : [];
    const storedIds = (listId) => {
      const match = stored.find((entry) => entry && entry.id === listId);
      return normalizeMovieIds(match?.movieIds);
    };

    const watched = storedIds(WATCHED_ID);
    const seen = new Set(watched);
    const watchlist = storedIds(WATCHLIST_ID).filter((id) => !seen.has(id));

    const byId = {
      [WATCHED_ID]: watched,
      [WATCHLIST_ID]: watchlist,
    };
    return PRESET_LISTS.map((preset) => ({ ...preset, movieIds: byId[preset.id] }));
  }

  function findList(lists, listId) {
    if (!Array.isArray(lists)) {
      return null;
    }
    return lists.find((list) => list.id === listId) || null;
  }

  function findListIdsForMovie(lists, movieId) {
    const id = Number(movieId);
    if (!Array.isArray(lists) || !Number.isInteger(id)) {
      return [];
    }
    return lists.filter((list) => list.movieIds.includes(id)).map((list) => list.id);
  }

  function primaryListIdForMovie(lists, movieId) {
    const holding = new Set(findListIdsForMovie(lists, movieId));
    for (const listId of STATUS_PRIORITY) {
      if (holding.has(listId)) {
        return listId;
      }
    }
    return null;
  }

  function applyMembership(lists, movieId, addTo, removeFrom) {
    let changed = false;
    const next = lists.map((list) => {
      const has = list.movieIds.includes(movieId);
      if (addTo.includes(list.id) && !has) {
        changed = true;
        return { ...list, movieIds: [...list.movieIds, movieId] };
      }
      if (removeFrom.includes(list.id) && has) {
        changed = true;
        return {
          ...list,
          movieIds: list.movieIds.filter((entry) => entry !== movieId),
        };
      }
      return list;
    });
    return changed ? next : lists;
  }

  /**
   * Sets a movie's status. Each target clears the other list so callers never
   * have to reason about the invariant themselves.
   */
  function assignMovieToList(lists, listId, movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id) || id <= 0 || !isListId(listId)) {
      return lists;
    }

    if (listId === WATCHED_ID) {
      return applyMembership(lists, id, [WATCHED_ID], [WATCHLIST_ID]);
    }
    return applyMembership(lists, id, [WATCHLIST_ID], [WATCHED_ID]);
  }

  function removeMovieFromList(lists, listId, movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id) || !isListId(listId)) {
      return lists;
    }
    return applyMembership(lists, id, [], [listId]);
  }

  function isWatched(lists, movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id)) {
      return false;
    }
    return findList(lists, WATCHED_ID)?.movieIds.includes(id) ?? false;
  }

  function isOnWatchlist(lists, movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id)) {
      return false;
    }
    return findList(lists, WATCHLIST_ID)?.movieIds.includes(id) ?? false;
  }

  /** Drops a movie from every list. */
  function removeMovie(lists, movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id)) {
      return lists;
    }
    return applyMembership(lists, id, [], LIST_IDS);
  }

  function replaceMovieIds(lists, listId, movieIds) {
    if (!isListReorderable(listId)) {
      return lists;
    }
    const target = findList(lists, listId);
    if (!target || movieIds === target.movieIds) {
      return lists;
    }
    return lists.map((list) =>
      list.id === listId ? { ...list, movieIds: [...movieIds] } : list,
    );
  }

  return {
    WATCHED_ID,
    WATCHLIST_ID,
    PRESET_LISTS,
  };
})();

/* Generated from scripts/lib/ratings.js — run npm run bundle:letterboxd */

const appRatings = (function () {
  /**
   * User-assigned movie ratings (1–10, one decimal). Stored beside list ids in
   * user state, never in TMDB records.
   */

  const MIN_RATING = 1;
  const MAX_RATING = 10;
  const SLIDER_MIN = 0;
  const SLIDER_MAX = 90;
  const DEFAULT_SLIDER_VALUE = 60; // 7.0

  function getCardHtml() {
    if (typeof appCardHtml !== "undefined") {
      return appCardHtml;
    }
    if (typeof require === "function") {
      return require("./card-html");
    }
    throw new Error("appCardHtml is not available");
  }

  function normalizeRating(value) {
    if (value == null || value === "") {
      return null;
    }
    const num = Number(value);
    if (!Number.isFinite(num)) {
      return null;
    }
    const clamped = Math.min(MAX_RATING, Math.max(MIN_RATING, num));
    return Math.round(clamped * 10) / 10;
  }

  function formatUserRating(value) {
    const normalized = normalizeRating(value);
    if (normalized == null) {
      return "";
    }
    return getCardHtml().formatRatingLabel(normalized) || "";
  }

  function ratingFromSliderValue(sliderValue) {
    const step = Number(sliderValue);
    if (!Number.isInteger(step)) {
      return null;
    }
    return normalizeRating(MIN_RATING + step / 10);
  }

  function sliderValueFromRating(rating) {
    const normalized = normalizeRating(rating);
    if (normalized == null) {
      return DEFAULT_SLIDER_VALUE;
    }
    return Math.round((normalized - MIN_RATING) * 10);
  }

  /** Value shown in mobile rating dropdowns; unrated uses the slider default (7). */
  function ratingSelectDisplayValue(rating) {
    const normalized = normalizeRating(rating);
    if (normalized != null) {
      return formatUserRating(normalized);
    }
    return formatUserRating(ratingFromSliderValue(DEFAULT_SLIDER_VALUE));
  }

  /** `<option>` markup for mobile rating dropdowns (10–1 in 0.1 steps, high to low). */
  function ratingSelectInnerHtml(selectedRating, options) {
    const includeUnrated = options?.includeUnrated === true;
    const selected = normalizeRating(selectedRating);
    let html = "";
    if (includeUnrated) {
      html += `<option value=""${selected == null ? " selected" : ""}>—</option>`;
    }
    const displayValue =
      selected != null ? formatUserRating(selected) : ratingSelectDisplayValue(null);
    for (let step = SLIDER_MAX; step >= SLIDER_MIN; step--) {
      const rating = MIN_RATING + step / 10;
      const label = formatUserRating(rating);
      const isSelected = selected != null ? label === formatUserRating(selected) : !includeUnrated && label === displayValue;
      html += `<option value="${label}"${isSelected ? " selected" : ""}>${label}</option>`;
    }
    return html;
  }

  function collectMovieIds(lists) {
    const ids = new Set();
    if (!Array.isArray(lists)) {
      return ids;
    }
    for (const list of lists) {
      if (!list || !Array.isArray(list.movieIds)) {
        continue;
      }
      for (const id of list.movieIds) {
        const movieId = Number(id);
        if (Number.isInteger(movieId) && movieId > 0) {
          ids.add(movieId);
        }
      }
    }
    return ids;
  }

  function getLists() {
    if (typeof appLists !== "undefined") {
      return appLists;
    }
    if (typeof require === "function") {
      return require("./lists");
    }
    throw new Error("appLists is not available");
  }

  function collectWatchedMovieIds(lists) {
    const { WATCHED_ID, findList } = getLists();
    const ids = new Set();
    const watched = findList(lists, WATCHED_ID);
    if (!watched || !Array.isArray(watched.movieIds)) {
      return ids;
    }
    for (const id of watched.movieIds) {
      const movieId = Number(id);
      if (Number.isInteger(movieId) && movieId > 0) {
        ids.add(movieId);
      }
    }
    return ids;
  }

  function collectRateableMovieIds(lists, customLists) {
    void customLists;
    return collectWatchedMovieIds(lists);
  }

  function isRatingAllowed(lists, movieId, customLists) {
    const id = Number(movieId);
    if (!Number.isInteger(id) || id <= 0) {
      return false;
    }
    return collectRateableMovieIds(lists, customLists).has(id);
  }

  function normalizeRatings(raw, lists, customLists) {
    const allowed = collectRateableMovieIds(lists, customLists);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return {};
    }

    const next = {};
    for (const [key, value] of Object.entries(raw)) {
      const movieId = Number(key);
      const rating = normalizeRating(value);
      if (!Number.isInteger(movieId) || movieId <= 0 || rating == null) {
        continue;
      }
      if (!allowed.has(movieId)) {
        continue;
      }
      next[String(movieId)] = rating;
    }
    return next;
  }

  function getRating(ratings, movieId) {
    const id = Number(movieId);
    if (!ratings || typeof ratings !== "object" || !Number.isInteger(id) || id <= 0) {
      return null;
    }
    return normalizeRating(ratings[String(id)]);
  }

  function setRating(ratings, movieId, rating) {
    const id = Number(movieId);
    if (!Number.isInteger(id) || id <= 0) {
      return ratings || {};
    }

    const base = ratings && typeof ratings === "object" && !Array.isArray(ratings)
      ? ratings
      : {};
    const key = String(id);
    const normalized = rating == null ? null : normalizeRating(rating);
    const current = getRating(base, id);

    if (normalized === current) {
      return base;
    }

    if (normalized == null) {
      if (!(key in base)) {
        return base;
      }
      const next = { ...base };
      delete next[key];
      return next;
    }

    return { ...base, [key]: normalized };
  }

  function removeRating(ratings, movieId) {
    return setRating(ratings, movieId, null);
  }

  return {
    formatUserRating,
  };
})();

/* Generated from scripts/lib/list-csv.js — run npm run bundle:letterboxd */

const appListCsv = (function () {
  /**
   * Collection backup CSV: export from the browser, import to restore.
   *
   * The browser is the only place that knows the collection, so Settings exports
   * this file and reads it back on import. Export and import share these
   * functions so the format has exactly one definition.
   *
   * Only `tmdb_id` identifies a movie. The other columns carry list membership,
   * ratings, viewing dates, and added-at stamps for backup/restore.
   */

  function parseCsv(text) {
    const source = String(text == null ? "" : text).replace(/^\uFEFF/, "");
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;

    for (let index = 0; index < source.length; index += 1) {
      const char = source[index];
      if (quoted) {
        if (char === '"' && source[index + 1] === '"') {
          field += '"';
          index += 1;
        } else if (char === '"') {
          quoted = false;
        } else {
          field += char;
        }
        continue;
      }
      if (char === '"' && field === "") {
        quoted = true;
      } else if (char === ",") {
        row.push(field);
        field = "";
      } else if (char === "\n" || char === "\r") {
        if (char === "\r" && source[index + 1] === "\n") index += 1;
        row.push(field);
        if (row.some((value) => value !== "")) rows.push(row);
        row = [];
        field = "";
      } else {
        field += char;
      }
    }
    if (quoted) throw new Error("CSV contains an unterminated quoted field.");
    row.push(field);
    if (row.some((value) => value !== "")) rows.push(row);
    return rows;
  }

  const CSV_HEADER = [
    "tmdb_id",
    "title",
    "list_id",
    "list_name",
    "my_rating",
    "release_year",
    "watch_dates",
    "added_at",
  ];
  const CSV_FILENAME = "my_list.csv";

  function getLists() {
    if (typeof appLists !== "undefined") {
      return appLists;
    }
    if (typeof require === "function") {
      return require("./lists");
    }
    throw new Error("appLists is not available");
  }

  function getCustomLists() {
    if (typeof appCustomLists !== "undefined") {
      return appCustomLists;
    }
    if (typeof require === "function") {
      return require("./custom-lists");
    }
    throw new Error("appCustomLists is not available");
  }

  function getRatings() {
    if (typeof appRatings !== "undefined") {
      return appRatings;
    }
    if (typeof require === "function") {
      return require("./ratings");
    }
    throw new Error("appRatings is not available");
  }

  function getViewingHistory() {
    if (typeof appViewingHistory !== "undefined") return appViewingHistory;
    if (typeof require === "function") return require("./viewing-history");
    throw new Error("appViewingHistory is not available");
  }

  function getAddedAt() {
    if (typeof appAddedAt !== "undefined") return appAddedAt;
    if (typeof require === "function") return require("./added-at");
    throw new Error("appAddedAt is not available");
  }

  function getSyncMerge() {
    if (typeof appSyncMerge !== "undefined") return appSyncMerge;
    if (typeof require === "function") return require("./sync-merge");
    throw new Error("appSyncMerge is not available");
  }

  function releaseYearFrom(releaseDate) {
    const match = /^(\d{4})/.exec(String(releaseDate || "").trim());
    return match ? match[1] : "";
  }

  function rowMeta(state, id, recordFor) {
    const record = typeof recordFor === "function" ? recordFor(id) : null;
    const title = String(record?.title || "");
    const releaseYear = releaseYearFrom(record?.releaseDate);
    const myRating = getRatings().formatUserRating(
      getRatings().getRating(state?.ratings, id),
    );
    const watchDates = getViewingHistory()
      .viewingEntries(state?.viewingHistory, id)
      .map((entry) => entry.watchedOn)
      .sort()
      .join(";");
    const addedAt = getAddedAt().getAddedAt(state?.addedAt, id) || "";
    return { title, releaseYear, myRating, watchDates: watchDates || "", addedAt };
  }

  function listNameFor(state, listId) {
    const preset = getLists().PRESET_LISTS.find((entry) => entry.id === listId);
    if (preset) {
      return preset.name;
    }
    const custom = getCustomLists().findCustomList(state?.customLists, listId);
    return custom?.name || "";
  }

  /** Quote whenever a field could otherwise change the shape of the row. */
  function csvField(value) {
    const text = String(value == null ? "" : value);
    if (!/[",\r\n]/.test(text)) {
      return text;
    }
    return `"${text.replace(/"/g, '""')}"`;
  }

  function csvRow(values) {
    return values.map(csvField).join(",");
  }

  function rowFromMembership(state, id, listId, listName, recordFor) {
    return {
      id,
      listId,
      listName,
      ...rowMeta(state, id, recordFor),
    };
  }

  /**
   * One row per list membership. Watched and watchlist rows first (stored order),
   * then each custom list in stored order.
   */
  function listCsvRows(state, recordFor) {
    const lists = Array.isArray(state?.lists) ? state.lists : [];
    const customLists = Array.isArray(state?.customLists) ? state.customLists : [];
    const rows = [];

    for (const listId of getLists().LIST_IDS) {
      const list = lists.find((entry) => entry && entry.id === listId);
      for (const movieId of list?.movieIds || []) {
        const id = Number(movieId);
        if (!Number.isInteger(id) || id <= 0) {
          continue;
        }
        rows.push(rowFromMembership(state, id, listId, listNameFor(state, listId), recordFor));
      }
    }

    for (const list of customLists) {
      if (!list || !getCustomLists().isCustomListId(list.id)) {
        continue;
      }
      for (const movieId of list.movieIds || []) {
        const id = Number(movieId);
        if (!Number.isInteger(id) || id <= 0) {
          continue;
        }
        rows.push(rowFromMembership(state, id, list.id, list.name, recordFor));
      }
    }

    return rows;
  }

  function buildListCsv(rows) {
    const lines = [csvRow(CSV_HEADER)];
    for (const row of rows || []) {
      lines.push(
        csvRow([
          row.id,
          row.title,
          row.listId,
          row.listName,
          row.myRating,
          row.releaseYear,
          row.watchDates,
          row.addedAt,
        ]),
      );
    }
    return `${lines.join("\n")}\n`;
  }

  function canonicalHeader(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, "");
  }

  function parseRatingField(value) {
    const text = String(value || "").trim();
    if (!text) {
      return null;
    }
    return getRatings().normalizeRating(Number(text));
  }

  function parseAddedAtField(value) {
    const text = String(value || "").trim();
    if (!text) {
      return null;
    }
    return getAddedAt().normalizeStamp(text);
  }

  function parseWatchDatesField(value) {
    const viewingLib = getViewingHistory();
    const dates = [];
    const seen = new Set();
    for (const part of String(value || "").split(";")) {
      const normalized = viewingLib.normalizeDate(part.trim());
      if (normalized && !seen.has(normalized)) {
        seen.add(normalized);
        dates.push(normalized);
      }
    }
    dates.sort();
    return dates;
  }

  /** Parse a collection backup CSV into normalized row objects. */
  function parseCollectionCsv(text) {
    const grid = parseCsv(text);
    if (!grid.length) {
      return [];
    }
    const headers = grid[0].map(canonicalHeader);
    const index = {};
    headers.forEach((header, position) => {
      if (header) {
        index[header] = position;
      }
    });
    const idCol = index.tmdbid ?? index.id ?? 0;
    const rows = [];
    for (const values of grid.slice(1)) {
      const rawId = String(values[idCol] || "").trim();
      if (!/^\d+$/.test(rawId)) {
        continue;
      }
      const tmdbId = Number(rawId);
      if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
        continue;
      }
      const read = (key) => String(values[index[key]] || "").trim();
      rows.push({
        tmdbId,
        title: read("title"),
        listId: read("listid"),
        listName: read("listname"),
        myRating: parseRatingField(read("myrating")),
        releaseYear: read("releaseyear"),
        watchDates: parseWatchDatesField(read("watchdates")),
        addedAt: parseAddedAtField(read("addedat")),
      });
    }
    return rows;
  }

  function summarizeCollectionImport(rows) {
    const movieIds = new Set();
    let watched = 0;
    let watchlist = 0;
    let customRows = 0;
    let ratings = 0;
    let viewings = 0;
    const ratingMovies = new Set();
    const viewingMovies = new Set();

    for (const row of rows || []) {
      movieIds.add(row.tmdbId);
      if (row.listId === getLists().WATCHED_ID) {
        watched += 1;
      } else if (row.listId === getLists().WATCHLIST_ID) {
        watchlist += 1;
      } else if (getCustomLists().isCustomListId(row.listId)) {
        customRows += 1;
      }
      if (row.myRating != null && !ratingMovies.has(row.tmdbId)) {
        ratingMovies.add(row.tmdbId);
        ratings += 1;
      }
      if (row.watchDates.length && !viewingMovies.has(row.tmdbId)) {
        viewingMovies.add(row.tmdbId);
        viewings += row.watchDates.length;
      }
    }

    return {
      movies: movieIds.size,
      rows: rows?.length || 0,
      watched,
      watchlist,
      customRows,
      ratings,
      viewings,
    };
  }


  function mergeMovieFields(rowsForMovie) {
    let myRating = null;
    let addedAt = null;
    const watchDates = new Set();
    const addedAtLib = getAddedAt();
    for (const row of rowsForMovie) {
      if (row.myRating != null) {
        myRating = row.myRating;
      }
      if (row.addedAt != null) {
        const stamp = addedAtLib.normalizeStamp(row.addedAt);
        if (stamp && (addedAt == null || stamp < addedAt)) {
          addedAt = stamp;
        }
      }
      for (const date of row.watchDates) {
        watchDates.add(date);
      }
    }
    return {
      myRating,
      addedAt,
      watchDates: [...watchDates].sort(),
    };
  }

  /**
   * Replace lists, ratings, and viewing history from a collection backup CSV.
   * Custom lists in the file are created when missing; empty custom lists with no
   * rows are kept from the current state only.
   */
  function applyCollectionImport(state, rows, options = {}) {
    if (options.mode && options.mode !== "replace") {
      throw new Error(`Unsupported import mode: ${options.mode}`);
    }

    const now = options.now instanceof Date ? options.now : new Date();
    const listsLib = getLists();
    const customListsLib = getCustomLists();
    const ratingsLib = getRatings();
    const viewingLib = getViewingHistory();
    const addedAtLib = getAddedAt();
    const syncLib = getSyncMerge();

    const parsedRows = Array.isArray(rows) ? rows : [];
    const byMovie = new Map();
    for (const row of parsedRows) {
      if (!byMovie.has(row.tmdbId)) {
        byMovie.set(row.tmdbId, []);
      }
      byMovie.get(row.tmdbId).push(row);
    }
    const mergedByMovie = new Map();
    for (const [movieId, movieRows] of byMovie) {
      mergedByMovie.set(movieId, mergeMovieFields(movieRows));
    }

    let lists = listsLib.defaultLists();
    let customLists = (state?.customLists || []).map((list) => ({ ...list, movieIds: [] }));
    let customListTombstones =
      state?.customListTombstones && typeof state.customListTombstones === "object"
        ? { ...state.customListTombstones }
        : {};
    const ensured = customListsLib.ensureCustomListsFromImport(
      customLists,
      customListTombstones,
      parsedRows,
      now,
    );
    customLists = ensured.customLists.map((list) => ({ ...list, movieIds: [] }));
    customListTombstones = ensured.customListTombstones;
    let ratings = {};
    let viewingHistory = {};
    let statuses = {};
    let addedAt = {};

    const watchedOrder = [];
    const watchlistOrder = [];
    const watchedSeen = new Set();
    const watchlistSeen = new Set();
    const customOrder = new Map();

    for (const row of parsedRows) {
      const id = row.tmdbId;
      if (row.listId === listsLib.WATCHED_ID && !watchedSeen.has(id)) {
        watchedSeen.add(id);
        watchedOrder.push(id);
      } else if (row.listId === listsLib.WATCHLIST_ID && !watchlistSeen.has(id)) {
        watchlistSeen.add(id);
        watchlistOrder.push(id);
      } else if (customListsLib.isCustomListId(row.listId)) {
        if (!customListsLib.findCustomList(customLists, row.listId)) {
          continue;
        }
        if (!customOrder.has(row.listId)) {
          customOrder.set(row.listId, []);
        }
        const order = customOrder.get(row.listId);
        if (!order.includes(id)) {
          order.push(id);
        }
      }
    }

    for (const id of watchedOrder) {
      lists = listsLib.assignMovieToList(lists, listsLib.WATCHED_ID, id);
      statuses = syncLib.setMovieStatus(statuses, id, listsLib.WATCHED_ID, now);
      const stamp = mergedByMovie.get(id)?.addedAt || now;
      addedAt = addedAtLib.setAddedAt(addedAt, id, stamp);
    }

    for (const id of watchlistOrder) {
      if (listsLib.isWatched(lists, id)) {
        continue;
      }
      lists = listsLib.assignMovieToList(lists, listsLib.WATCHLIST_ID, id);
      statuses = syncLib.setMovieStatus(statuses, id, listsLib.WATCHLIST_ID, now);
      const stamp = mergedByMovie.get(id)?.addedAt || now;
      addedAt = addedAtLib.setAddedAt(addedAt, id, stamp);
    }

    for (const [listId, order] of customOrder) {
      for (const id of order) {
        customLists = customListsLib.addMovieToCustomList(customLists, listId, id, now);
      }
    }

    for (const [movieId] of byMovie) {
      const { myRating, watchDates } = mergedByMovie.get(movieId) || {};
      if (myRating != null) {
        ratings = ratingsLib.setRating(ratings, movieId, myRating);
      }
      for (const watchedOn of watchDates) {
        viewingHistory = viewingLib.addViewing(viewingHistory, movieId, watchedOn, now);
      }
    }

    const summary = {
      movies: byMovie.size,
      rows: parsedRows.length,
      watched: watchedOrder.length,
      watchlist: watchlistOrder.filter((id) => !listsLib.isWatched(lists, id)).length,
      customRows: [...customOrder.values()].reduce((sum, ids) => sum + ids.length, 0),
      ratings: Object.keys(ratings).length,
      viewings: Object.values(viewingHistory).reduce(
        (sum, entries) => sum + (Array.isArray(entries) ? entries.length : 0),
        0,
      ),
    };

    return {
      state: {
        ...state,
        lists,
        customLists,
        customListTombstones,
        ratings,
        viewingHistory,
        statuses,
        addedAt,
      },
      summary,
    };
  }

  /**
   * Reads the first column of every line as an id. The header, blank lines, and
   * anything hand-edited into an unparseable state are skipped rather than
   * refused: a typo in a comment column should not stop an import.
   */
  function parseListCsv(text) {
    const seen = new Set();
    const ids = [];
    for (const line of String(text || "").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }
      const field = trimmed.split(",")[0].replace(/^"|"$/g, "").trim();
      if (!/^\d+$/.test(field)) {
        continue;
      }
      const id = Number(field);
      if (!Number.isInteger(id) || id <= 0 || seen.has(id)) {
        continue;
      }
      seen.add(id);
      ids.push(id);
    }
    return ids;
  }

  return {
    CSV_FILENAME,
    buildListCsv,
    parseCsv,
  };
})();

/* Generated from scripts/lib/letterboxd-import.js — run npm run bundle:letterboxd */

const appLetterboxdImport = (function () {
  /**
   * Parse the useful parts of a Letterboxd account export into a small,
   * source-oriented model. ZIP extraction and TMDB matching run in the local
   * browser tool; CSV handling here keeps the risky data conversion testable.
   */

  function getParseCsv() {
    if (typeof appListCsv !== "undefined" && typeof appListCsv.parseCsv === "function") {
      return appListCsv.parseCsv;
    }
    if (typeof require === "function") {
      return require("./list-csv").parseCsv;
    }
    throw new Error("parseCsv is not available");
  }

  const SUPPORTED_FILES = new Set([
    "watched.csv",
    "watchlist.csv",
    "ratings.csv",
    "diary.csv",
  ]);

  function canonicalHeader(value) {
    return String(value || "").trim().toLowerCase().replace(/[\s_-]+/g, "");
  }

  function parseCsv(text) {
    return getParseCsv()(text);
  }

  function csvRecords(text) {
    const rows = getParseCsv()(text);
    if (!rows.length) return [];
    const headers = rows[0].map(canonicalHeader);
    return rows.slice(1).map((values) => {
      const record = {};
      headers.forEach((header, index) => {
        if (header) record[header] = String(values[index] || "").trim();
      });
      return record;
    });
  }

  function baseName(pathname) {
    return String(pathname || "").replace(/\\/g, "/").split("/").pop().toLowerCase();
  }

  function isSupportedPath(pathname) {
    const parts = String(pathname || "").replace(/\\/g, "/").toLowerCase().split("/").filter(Boolean);
    if (["deleted", "orphaned", "likes"].some((part) => parts.includes(part))) return false;
    return SUPPORTED_FILES.has(parts.at(-1));
  }

  function normalizeYear(value) {
    const year = Number(value);
    return Number.isInteger(year) && year >= 1870 && year <= 2200 ? year : null;
  }

  function normalizeDate(value) {
    const text = String(value || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
    const date = new Date(`${text}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === text
      ? text
      : null;
  }

  function normalizeRating(value) {
    const rating = Number(value);
    return Number.isFinite(rating) && rating >= 0.5 && rating <= 5
      ? Math.round(rating * 20) / 10
      : null;
  }

  function filmSourceKey(record) {
    const uri = record.letterboxduri || record.url;
    if (uri) return `uri:${uri.toLowerCase()}`;
    const title = record.name || record.title;
    const year = normalizeYear(record.year);
    return title ? `title:${title.toLowerCase()}|${year || ""}` : null;
  }

  function emptyFilm(record, sourceKey) {
    return {
      sourceKey,
      letterboxdUri: record.letterboxduri || record.url || null,
      title: record.name || record.title || "Untitled",
      year: normalizeYear(record.year),
      watched: false,
      watchlist: false,
      rating: null,
      viewings: [],
    };
  }

  function parseLetterboxdFiles(files) {
    const films = new Map();
    const seenFiles = [];
    const ignoredFiles = [];
    const warnings = [];

    const priority = { "diary.csv": 0, "watched.csv": 1, "watchlist.csv": 2, "ratings.csv": 3 };
    const entries = Object.entries(files || {}).sort((left, right) => {
      return (priority[baseName(left[0])] ?? 99) - (priority[baseName(right[0])] ?? 99);
    });
    for (const [pathname, text] of entries) {
      const filename = baseName(pathname);
      if (!isSupportedPath(pathname)) {
        if (filename.endsWith(".csv")) ignoredFiles.push(pathname);
        continue;
      }
      seenFiles.push(filename);
      let records;
      try {
        records = csvRecords(text);
      } catch (error) {
        throw new Error(`${filename}: ${error.message}`);
      }
      for (const record of records) {
        const sourceKey = filmSourceKey(record);
        if (!sourceKey) {
          warnings.push(`${filename}: skipped a row without a film URI or title.`);
          continue;
        }
        const film = films.get(sourceKey) || emptyFilm(record, sourceKey);
        if (filename === "watched.csv" || filename === "diary.csv" || filename === "ratings.csv") {
          film.watched = true;
        }
        if (filename === "watchlist.csv") film.watchlist = true;
        if (filename === "ratings.csv" || filename === "diary.csv") {
          const rating = normalizeRating(record.rating);
          if (rating != null) film.rating = rating;
        }
        if (filename === "diary.csv") {
          const watchedOn = normalizeDate(record.watcheddate);
          if (watchedOn && !film.viewings.includes(watchedOn)) film.viewings.push(watchedOn);
        }
        films.set(sourceKey, film);
      }
    }

    if (!seenFiles.length) {
      throw new Error("No supported Letterboxd files were found. Expected watched.csv, watchlist.csv, ratings.csv, or diary.csv.");
    }
    for (const film of films.values()) {
      film.viewings.sort();
      if (film.watched) film.watchlist = false;
    }
    return { films: [...films.values()], seenFiles: [...new Set(seenFiles)].sort(), ignoredFiles, warnings };
  }

  function stableViewingId(sourceKey, watchedOn) {
    const input = `letterboxd:${sourceKey}:${watchedOn}`;
    let hash = 2166136261;
    for (let index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `letterboxd-${(hash >>> 0).toString(36)}`;
  }

  function normalizeMatchTitle(value) {
    return String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }

  function candidateReleaseYear(candidate) {
    return Number(String(candidate?.releaseDate || "").slice(0, 4)) || null;
  }

  /**
   * Letterboxd and TMDB can differ by one year when one uses a festival premiere
   * and the other a wider release. Exact titles are required; where several
   * candidates remain, TMDB's relevance ordering supplies the tie-break.
   */
  function pickTmdbMatch(film, candidates) {
    const title = normalizeMatchTitle(film?.title);
    const seenIds = new Set();
    const exactTitle = (Array.isArray(candidates) ? candidates : []).filter((candidate) => {
      const id = Number(candidate?.id);
      if (!Number.isInteger(id) || id <= 0 || seenIds.has(id)) return false;
      seenIds.add(id);
      return normalizeMatchTitle(candidate?.title) === title;
    });
    if (!film?.year) return exactTitle.length === 1 ? exactTitle[0].id : null;
    const exactYear = exactTitle.filter((candidate) => candidateReleaseYear(candidate) === film.year);
    // TMDB orders search results by relevance. If several films have the exact
    // same title and release year, its first result is the best available signal.
    if (exactYear.length) return exactYear[0].id;
    const adjacentYear = exactTitle.filter((candidate) => {
      const year = candidateReleaseYear(candidate);
      return year != null && Math.abs(year - film.year) === 1;
    });
    return adjacentYear.length ? adjacentYear[0].id : null;
  }

  /** Rank TMDB search hits for manual review (year proximity, then TMDB order). */
  function sortedTmdbCandidates(film, candidates, limit = 10) {
    const seenIds = new Set();
    const unique = (Array.isArray(candidates) ? candidates : []).filter((candidate) => {
      const id = Number(candidate?.id);
      if (!Number.isInteger(id) || id <= 0 || seenIds.has(id)) {
        return false;
      }
      seenIds.add(id);
      return true;
    });
    return unique
      .map((candidate, index) => ({ candidate, index }))
      .sort((left, right) => {
        const yearRank = (candidate) => {
          const year = candidateReleaseYear(candidate);
          if (!film?.year || year == null) {
            return 2;
          }
          if (year === film.year) {
            return 0;
          }
          if (Math.abs(year - film.year) === 1) {
            return 1;
          }
          return 2;
        };
        return yearRank(left.candidate) - yearRank(right.candidate) || left.index - right.index;
      })
      .map((entry) => entry.candidate)
      .slice(0, limit);
  }

  function matchReviewRank(film, matches, lookupFailed) {
    if (lookupFailed.has(film.sourceKey)) {
      return 0;
    }
    if (!matches[film.sourceKey]) {
      return 1;
    }
    return 2;
  }

  /** Films to step through in an interactive review (lookup failures and ambiguous first). */
  function filmsForMatchReview(films, matches, lookupFailed, options = {}) {
    const reviewAll = options.reviewAll === true;
    return (films || [])
      .filter((film) => {
        if (reviewAll) {
          return true;
        }
        return lookupFailed.has(film.sourceKey) || !matches[film.sourceKey];
      })
      .sort((left, right) => {
        return (
          matchReviewRank(left, matches, lookupFailed)
          - matchReviewRank(right, matches, lookupFailed)
          || String(left.title).localeCompare(String(right.title))
        );
      });
  }

  /**
   * Parse a review prompt answer.
   * Menu picks are 1…n; 0 skips; a positive integer outside the menu is a manual TMDB id.
   */
  function parseMatchChoice(answer, candidates, currentId = null) {
    const text = String(answer ?? "").trim().toLowerCase();
    if (!text) {
      return currentId ? { action: "keep", id: currentId } : { action: "skip" };
    }
    if (text === "q" || text === "quit") {
      return { action: "quit" };
    }
    if (text === "s" || text === "skip") {
      return { action: "skip" };
    }
    const num = Number(text);
    if (!Number.isInteger(num)) {
      return { action: "invalid" };
    }
    if (num === 0) {
      return { action: "skip" };
    }
    const menuSize = Array.isArray(candidates) ? candidates.length : 0;
    if (num >= 1 && num <= menuSize) {
      return { action: "pick", id: Number(candidates[num - 1].id) };
    }
    if (num > 0) {
      return { action: "pick", id: num };
    }
    return { action: "invalid" };
  }

  function getImportLibraries() {
    if (typeof appLists !== "undefined") {
      return {
        lists: appLists,
        ratings: appRatings,
        addedAt: appAddedAt,
        viewingHistory: appViewingHistory,
        syncMerge: appSyncMerge,
      };
    }
    if (typeof require === "function") {
      const load = require;
      return {
        lists: load("./lists"),
        ratings: load("./ratings"),
        addedAt: load("./added-at"),
        viewingHistory: load("./viewing-history"),
        syncMerge: load("./sync-merge"),
      };
    }
    throw new Error("Import libraries are not available.");
  }

  function getListCsvLibraries() {
    if (typeof appLists !== "undefined" && typeof appRatings !== "undefined") {
      return { lists: appLists, ratings: appRatings };
    }
    if (typeof require === "function") {
      return {
        lists: require("./lists"),
        ratings: require("./ratings"),
      };
    }
    throw new Error("List CSV libraries are not available.");
  }

  /** Turn matched Letterboxd films into collection backup CSV row objects. */
  function letterboxdFilmsToImportRows(films, matches) {
    const { lists, ratings } = getListCsvLibraries();
    const watchedPreset = lists.PRESET_LISTS.find((entry) => entry.id === lists.WATCHED_ID);
    const watchlistPreset = lists.PRESET_LISTS.find((entry) => entry.id === lists.WATCHLIST_ID);
    const rows = [];

    for (const film of films || []) {
      const movieId = Number(matches?.[film.sourceKey]);
      if (!Number.isInteger(movieId) || movieId <= 0) {
        continue;
      }
      const base = {
        id: movieId,
        title: film.title,
        myRating: film.rating != null ? ratings.formatUserRating(film.rating) : "",
        releaseYear: film.year != null ? String(film.year) : "",
        watchDates: (film.viewings || []).join(";"),
      };
      if (film.watched) {
        rows.push({
          ...base,
          listId: lists.WATCHED_ID,
          listName: watchedPreset?.name || "Watched",
        });
      } else if (film.watchlist) {
        rows.push({
          ...base,
          listId: lists.WATCHLIST_ID,
          listName: watchlistPreset?.name || "Watchlist",
        });
      }
    }

    return rows;
  }

  /** Build one new state object. Callers decide when to persist and sync it. */
  function applyLetterboxdImport(state, films, matches, options = {}) {
    const lib = getImportLibraries();
    const now = options.now instanceof Date ? options.now : new Date();
    const overwriteRatings = options.overwriteRatings === true;
    let lists = state.lists;
    let ratings = state.ratings;
    let addedAt = state.addedAt;
    let viewingHistory = state.viewingHistory;
    let statuses = state.statuses;
    const summary = { matched: 0, skipped: 0, watched: 0, watchlist: 0, ratings: 0, viewings: 0 };

    for (const film of films || []) {
      const movieId = Number(matches?.[film.sourceKey]);
      if (!Number.isInteger(movieId) || movieId <= 0) {
        summary.skipped += 1;
        continue;
      }
      summary.matched += 1;
      const wasWatched = lib.lists.isWatched(lists, movieId);
      const wasWatchlisted = lib.lists.isOnWatchlist(lists, movieId);
      let targetStatus = null;
      if (film.watched && !wasWatched) targetStatus = lib.lists.WATCHED_ID;
      else if (film.watchlist && !wasWatched && !wasWatchlisted) targetStatus = lib.lists.WATCHLIST_ID;

      if (targetStatus) {
        lists = lib.lists.assignMovieToList(lists, targetStatus, movieId);
        statuses = lib.syncMerge.setMovieStatus(statuses, movieId, targetStatus, now);
        addedAt = lib.addedAt.recordAddedAt(addedAt, movieId, now, {
          readded: lib.syncMerge.isRemoved(state.statuses, movieId),
        });
        summary[targetStatus] += 1;
      }

      if (film.rating != null && (overwriteRatings || lib.ratings.getRating(ratings, movieId) == null)) {
        const nextRatings = lib.ratings.setRating(ratings, movieId, film.rating);
        if (nextRatings !== ratings) {
          ratings = nextRatings;
          summary.ratings += 1;
        }
      }

      for (const watchedOn of film.viewings || []) {
        const id = stableViewingId(film.sourceKey, watchedOn);
        const known = lib.viewingHistory
          .viewingEntries(viewingHistory, movieId, { includeDeleted: true })
          .some((entry) => entry.id === id);
        if (known) continue;
        const nextHistory = lib.viewingHistory.addViewing(viewingHistory, movieId, watchedOn, now, id);
        if (nextHistory !== viewingHistory) {
          viewingHistory = nextHistory;
          summary.viewings += 1;
        }
      }
    }

    return {
      state: { ...state, lists, ratings, addedAt, viewingHistory, statuses },
      summary,
    };
  }

  return {
    SUPPORTED_FILES,
    isSupportedPath,
    parseLetterboxdFiles,
    pickTmdbMatch,
    sortedTmdbCandidates,
    candidateReleaseYear,
    letterboxdFilmsToImportRows,
  };
})();

/* --- Local Letterboxd tool UI (CSV export only) --- */

(function () {
  const TOKEN_KEY = "moviecollector-letterboxd-tool-token";
  const MATCH_CACHE_KEY = "moviecollector-letterboxd-tool-matches-v1";
  const MAX_ZIP_BYTES = 25 * 1024 * 1024;
  const MAX_CSV_BYTES = 10 * 1024 * 1024;
  const MAX_TOTAL_BYTES = 50 * 1024 * 1024;
  const MAX_CSV_FILES = 20;
  const MATCH_CONCURRENCY = 2;
  const MATCH_DELAY_MS = 140;
  const MATCH_RETRIES = 4;

  const tokenInput = document.getElementById("tmdb-token");
  const zipInput = document.getElementById("zip-file");
  const startBtn = document.getElementById("start-btn");
  const downloadBtn = document.getElementById("download-btn");
  const statusEl = document.getElementById("status");
  const summaryEl = document.getElementById("summary");
  const matchesEl = document.getElementById("matches");

  let parsed = null;
  let candidates = new Map();
  let selections = {};
  let lookupErrors = new Set();
  let runId = 0;
  let csvText = "";

  tokenInput.value = sessionStorage.getItem(TOKEN_KEY) || "";
  tokenInput.addEventListener("change", () => {
    sessionStorage.setItem(TOKEN_KEY, tokenInput.value.trim());
  });

  function setStatus(text, kind) {
    statusEl.textContent = text || "";
    statusEl.classList.toggle("is-error", kind === "error");
    statusEl.classList.toggle("is-ok", kind === "ok");
  }

  function readMatchCache() {
    try {
      const value = JSON.parse(sessionStorage.getItem(MATCH_CACHE_KEY) || "{}");
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch (_) {
      return {};
    }
  }

  function writeMatchCache(next) {
    sessionStorage.setItem(MATCH_CACHE_KEY, JSON.stringify(next));
  }

  function baseName(pathname) {
    return String(pathname || "").replace(/\\/g, "/").split("/").pop().toLowerCase();
  }

  async function extractZip(file) {
    if (!file || !/\.zip$/i.test(file.name)) {
      throw new Error("Choose the ZIP downloaded from Letterboxd.");
    }
    if (file.size > MAX_ZIP_BYTES) {
      throw new Error("That ZIP is larger than the 25 MB import limit.");
    }
    if (typeof fflate === "undefined") {
      throw new Error("The ZIP reader did not load. Refresh and try again.");
    }
    const supported = appLetterboxdImport.SUPPORTED_FILES;
    let selectedBytes = 0;
    let selectedFiles = 0;
    const archive = fflate.unzipSync(new Uint8Array(await file.arrayBuffer()), {
      filter(entry) {
        if (!appLetterboxdImport.isSupportedPath(entry.name)
          || !supported.has(baseName(entry.name))) {
          return false;
        }
        if (entry.originalSize > MAX_CSV_BYTES) {
          throw new Error(`${baseName(entry.name)} exceeds the 10 MB file limit.`);
        }
        selectedBytes += entry.originalSize;
        selectedFiles += 1;
        if (selectedBytes > MAX_TOTAL_BYTES || selectedFiles > MAX_CSV_FILES) {
          throw new Error("The Letterboxd export contains too much data to import safely.");
        }
        return true;
      },
    });
    const files = {};
    let total = 0;
    for (const [pathname, bytes] of Object.entries(archive)) {
      total += bytes.length;
      if (total > MAX_TOTAL_BYTES) {
        throw new Error("The extracted Letterboxd files exceed the 50 MB import limit.");
      }
      files[pathname] = fflate.strFromU8(bytes);
    }
    return files;
  }

  function token() {
    return String(tokenInput.value || "").trim();
  }

  function requireToken() {
    const value = token();
    if (!appTmdb.isReadAccessToken(value)) {
      throw new Error("Paste your TMDB API Read Access Token first.");
    }
    return value;
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function searchFilm(film) {
    const readToken = token();
    let lastError = null;
    for (let attempt = 0; attempt <= MATCH_RETRIES; attempt += 1) {
      try {
        const response = await fetch(
          appTmdb.buildSearchUrl(film.title),
          appTmdb.buildRequestInit(readToken),
        );
        if (!response.ok) {
          throw new Error(`TMDB search failed (${response.status})`);
        }
        const results = appTmdb.normalizeSearchResults(await response.json());
        await delay(MATCH_DELAY_MS);
        return results;
      } catch (error) {
        lastError = error;
        const transient = /\b429\b|\b5\d\d\b|network|failed to fetch|abort/i.test(String(error?.message || error));
        if (!transient || attempt === MATCH_RETRIES) {
          break;
        }
        await delay(600 * (2 ** attempt) + Math.floor(Math.random() * 250));
      }
    }
    throw lastError || new Error("TMDB lookup failed");
  }

  async function mapWithConcurrency(items, worker, concurrency = MATCH_CONCURRENCY) {
    let cursor = 0;
    async function run() {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        await worker(items[index], index);
      }
    }
    await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run));
  }

  function rebuildCsv() {
    const rows = appLetterboxdImport.letterboxdFilmsToImportRows(
      parsed.films.filter((film) => selections[film.sourceKey]),
      selections,
    );
    csvText = appListCsv.buildListCsv(rows);
    downloadBtn.disabled = rows.length === 0;
    return rows.length;
  }

  function renderMatches() {
    if (!parsed) {
      matchesEl.innerHTML = "";
      summaryEl.textContent = "";
      downloadBtn.disabled = true;
      return;
    }
    const matched = Object.values(selections).filter(Boolean).length;
    const rowCount = rebuildCsv();
    summaryEl.textContent = `${parsed.films.length} films · ${matched} matched · ${rowCount} CSV row${rowCount === 1 ? "" : "s"}. Import the downloaded file via Settings → Import backup on the main site.`;
    const rows = parsed.films.map((film, index) => {
      const filmCandidates = candidates.get(film.sourceKey) || [];
      const selected = Number(selections[film.sourceKey]) || 0;
      const status = selected
        ? "is-matched"
        : lookupErrors.has(film.sourceKey)
          ? "lookup-failed"
          : filmCandidates.length ? "needs-review" : "is-unmatched";
      return { film, filmCandidates, selected, status, index };
    }).sort((left, right) => {
      const rank = { "lookup-failed": 0, "is-unmatched": 1, "needs-review": 2, "is-matched": 3 };
      return rank[left.status] - rank[right.status] || left.index - right.index;
    });

    matchesEl.innerHTML = rows.map(({ film, filmCandidates, selected, status }) => {
      const menu = appLetterboxdImport.sortedTmdbCandidates(film, filmCandidates);
      const listed = menu.some((candidate) => candidate.id === selected);
      const savedOption = selected && !listed
        ? `<option value="${selected}" selected>Saved match (TMDB #${selected})</option>`
        : "";
      const options = [
        '<option value="">Skip this film</option>',
        savedOption,
        ...menu.map((candidate) => {
          const year = appLetterboxdImport.candidateReleaseYear(candidate);
          const label = appCardHtml.escapeHtml(candidate.title);
          return `<option value="${candidate.id}"${candidate.id === selected ? " selected" : ""}>${label}${year ? ` (${year})` : ""}</option>`;
        }),
      ].join("");
      const title = appCardHtml.escapeHtml(film.title);
      const state = status === "is-matched"
        ? "Matched"
        : status === "needs-review"
          ? "Choose a TMDB match"
          : status === "lookup-failed" ? "Lookup failed" : "No TMDB results";
      return `<label class="match-row ${status}"><span class="match-title"><strong>${title}${film.year ? ` (${film.year})` : ""}</strong><span class="match-state">${state}</span></span><select data-source-key="${appCardHtml.escapeHtml(film.sourceKey)}" aria-label="TMDB match for ${title}">${options}</select></label>`;
    }).join("");
  }

  async function onStart() {
    const file = zipInput.files?.[0];
    if (!file) {
      setStatus("Choose a Letterboxd export ZIP first.", "error");
      return;
    }
    try {
      requireToken();
    } catch (error) {
      setStatus(error.message, "error");
      tokenInput.focus();
      return;
    }

    sessionStorage.setItem(TOKEN_KEY, token());
    const activeRun = ++runId;
    startBtn.disabled = true;
    downloadBtn.disabled = true;
    csvText = "";
    setStatus("Reading export and matching with TMDB…", null);
    try {
      const files = await extractZip(file);
      parsed = appLetterboxdImport.parseLetterboxdFiles(files);
      candidates = new Map();
      selections = {};
      lookupErrors = new Set();
      const cache = readMatchCache();
      let finished = 0;
      await mapWithConcurrency(parsed.films, async (film) => {
        if (activeRun !== runId) return;
        if (cache[film.sourceKey]) {
          selections[film.sourceKey] = cache[film.sourceKey];
        } else {
          try {
            const results = await searchFilm(film);
            candidates.set(film.sourceKey, results.slice(0, 10));
            const picked = appLetterboxdImport.pickTmdbMatch(film, results);
            if (picked) selections[film.sourceKey] = picked;
          } catch (_) {
            candidates.set(film.sourceKey, []);
            lookupErrors.add(film.sourceKey);
          }
        }
        if (activeRun !== runId) return;
        finished += 1;
        summaryEl.textContent = `Matching films with TMDB… ${finished}/${parsed.films.length}`;
      });
      if (activeRun !== runId) return;
      writeMatchCache({ ...readMatchCache(), ...selections });
      renderMatches();
      setStatus("Review matches, then download the backup CSV.", "ok");
    } catch (error) {
      if (activeRun !== runId) return;
      parsed = null;
      renderMatches();
      setStatus(error.message || "Could not read that export.", "error");
    } finally {
      startBtn.disabled = false;
    }
  }

  function onMatchChange(event) {
    const select = event.target.closest("[data-source-key]");
    if (!select) return;
    const id = Number(select.value);
    if (Number.isInteger(id) && id > 0) {
      selections[select.dataset.sourceKey] = id;
    } else {
      delete selections[select.dataset.sourceKey];
    }
    writeMatchCache({ ...readMatchCache(), ...selections });
    renderMatches();
  }

  function onDownload() {
    if (!csvText) return;
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = appListCsv.CSV_FILENAME;
    link.click();
    URL.revokeObjectURL(url);
    setStatus(`Downloaded ${appListCsv.CSV_FILENAME}. Import it on the main site under Settings → Import backup.`, "ok");
  }

  startBtn.addEventListener("click", onStart);
  downloadBtn.addEventListener("click", onDownload);
  matchesEl.addEventListener("change", onMatchChange);
})();
