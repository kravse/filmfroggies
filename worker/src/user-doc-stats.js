/**
 * Read-only stats derived from synced user_data docs.
 */

function addMovieIds(ids, movieIds) {
  if (!Array.isArray(movieIds)) {
    return;
  }
  for (const id of movieIds) {
    const n = Number(id);
    if (Number.isInteger(n) && n > 0) {
      ids.add(n);
    }
  }
}

/** Unique TMDB ids across preset and custom lists (membership only). */
export function countCollectionMovies(doc) {
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) {
    return 0;
  }
  const ids = new Set();
  for (const list of doc.lists || []) {
    addMovieIds(ids, list?.movieIds);
  }
  for (const list of doc.customLists || []) {
    addMovieIds(ids, list?.movieIds);
  }
  return ids.size;
}

export function countCollectionMoviesFromJson(jsonText) {
  if (jsonText == null || jsonText === "") {
    return 0;
  }
  try {
    const parsed = JSON.parse(jsonText);
    return countCollectionMovies(parsed);
  } catch (_) {
    return 0;
  }
}
