/**
 * TMDB movie normalization for the Worker movie cache.
 * Mirrors scripts/lib/tmdb.js normalizeMovie output shape.
 */

const IMAGE_PATH_PATTERN = /^\/[A-Za-z0-9._-]+\.(jpg|jpeg|png|webp)$/i;
const CAST_LIMIT = 8;

function cleanText(value) {
  const text = String(value == null ? "" : value).trim();
  return text || null;
}

function cleanImagePath(value) {
  if (typeof value !== "string" || !IMAGE_PATH_PATTERN.test(value)) {
    return null;
  }
  return value;
}

function directorsFromCredits(credits) {
  if (!credits || !Array.isArray(credits.crew)) {
    return [];
  }
  return credits.crew
    .filter((member) => member?.job === "Director")
    .map((member) => cleanText(member.name))
    .filter(Boolean);
}

function castFromCredits(credits) {
  if (!credits || !Array.isArray(credits.cast)) {
    return [];
  }
  return credits.cast
    .slice(0, CAST_LIMIT)
    .map((member) => cleanText(member.name))
    .filter(Boolean);
}

export function normalizeMovie(payload) {
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

export function isDetailedMovieRecord(record) {
  return Boolean(record && Array.isArray(record.genres));
}

/** Stored docs are normalized app records (camelCase), not raw TMDB payloads. */
export function parseStoredMovieDoc(json) {
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
