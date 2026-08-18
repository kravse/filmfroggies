/**
 * Poster URL validation for the browser Cache API layer.
 *
 * Only https://image.tmdb.org paths built by buildImageUrl are cacheable.
 */

const POSTER_CACHE_NAME = "moviecollector-posters-v1";
const POSTER_HOST = "image.tmdb.org";

function isPosterUrl(url) {
  if (!url || typeof url !== "string") {
    return false;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === POSTER_HOST;
  } catch (_) {
    return false;
  }
}

module.exports = {
  POSTER_CACHE_NAME,
  POSTER_HOST,
  isPosterUrl,
};
