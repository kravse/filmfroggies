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
  return {
    id: Number(entry.id),
    title: cleanText(entry.title) || cleanText(entry.original_title) || "Untitled",
    releaseDate: cleanText(entry.release_date),
    posterPath: cleanImagePath(entry.poster_path),
    overview: cleanText(entry.overview),
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

module.exports = {
  API_BASE,
  IMAGE_BASE,
  POSTER_SIZES,
  isReadAccessToken,
  looksLikeV3ApiKey,
  describeCredentialProblem,
  buildRequestInit,
  buildSearchUrl,
  buildPersonSearchUrl,
  buildPersonMovieCreditsUrl,
  buildMovieUrl,
  buildConfigurationUrl,
  isValidImagePath,
  buildImageUrl,
  normalizeSearchResults,
  normalizePersonSearchResults,
  pickDirectorSearchCandidates,
  directedMoviesFromPersonCredits,
  mergeMovieSearchResults,
  flattenDirectorSearchResults,
  normalizeMovie,
};
