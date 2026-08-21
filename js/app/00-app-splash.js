/* Generated from scripts/lib/splash.js — run npm run bundle */

const appSplash = (function () {
  /**
   * Content for the logged-out splash page.
   *
   * Titles and years are a small committed snapshot, restored from the retired
   * data/movies.json, covering only ids whose posters ship in data/posters/. That
   * lets the marketing page render real tiles with no session and no TMDB call.
   * It is not a metadata source for collections — hydrateMovies still resolves
   * those from D1/TMDB, and nothing here reaches user state.
   */

  const SPLASH_MOVIES = [
    { id: 38, title: "Eternal Sunshine of the Spotless Mind", year: 2004 },
    { id: 73, title: "American History X", year: 1998 },
    { id: 129, title: "Spirited Away", year: 2001 },
    { id: 141, title: "Donnie Darko", year: 2001 },
    { id: 238, title: "The Godfather", year: 1972 },
    { id: 278, title: "The Shawshank Redemption", year: 1994 },
    { id: 387, title: "Das Boot", year: 1981 },
    { id: 389, title: "12 Angry Men", year: 1957 },
    { id: 401, title: "Garden State", year: 2004 },
    { id: 550, title: "Fight Club", year: 1999 },
    { id: 603, title: "The Matrix", year: 1999 },
    { id: 670, title: "Oldboy", year: 2003 },
    { id: 680, title: "Pulp Fiction", year: 1994 },
    { id: 694, title: "The Shining", year: 1980 },
    { id: 837, title: "Videodrome", year: 1983 },
    { id: 1091, title: "The Thing", year: 1982 },
    { id: 1398, title: "Stalker", year: 1979 },
    { id: 1548, title: "Ghost World", year: 2001 },
    { id: 1946, title: "eXistenZ", year: 1999 },
    { id: 4538, title: "The Darjeeling Limited", year: 2007 },
    { id: 8337, title: "They Live", year: 1988 },
    { id: 9426, title: "The Fly", year: 1986 },
    { id: 9538, title: "Scanners", year: 1981 },
    { id: 10774, title: "Network", year: 1976 },
    { id: 110415, title: "Snowpiercer", year: 2013 },
    { id: 11305, title: "Mystery Train", year: 1989 },
    { id: 11423, title: "Memories of Murder", year: 2003 },
    { id: 1255, title: "The Host", year: 2006 },
    { id: 30018, title: "Mother", year: 2009 },
    { id: 76341, title: "Mad Max: Fury Road", year: 2015 },
    { id: 120467, title: "The Grand Budapest Hotel", year: 2014 },
    { id: 246741, title: "What We Do in the Shadows", year: 2014 },
    { id: 329865, title: "Arrival", year: 2016 },
    { id: 387426, title: "Okja", year: 2017 },
    { id: 496243, title: "Parasite", year: 2019 },
    { id: 1154538, title: "Nirvanna the Band the Show the Movie", year: 2026 },
    { id: 1272837, title: "28 Years Later: The Bone Temple", year: 2026 },
    { id: 1339713, title: "Obsession", year: 2026 },
    { id: 1368337, title: "The Odyssey", year: 2026 },
  ];

  /**
   * Each group is one illustration on the page. Entries are ids, or an id with a
   * demo rating where the section is showing off ratings.
   */
  const SPLASH_GROUPS = {
    hero: [
      278, 680, 129, 496243, 1091, 550, 694, 603, 120467, 38, 670, 76341, 389, 238,
      329865, 8337, 141, 246741,
    ],
    watchedList: [278, 496243, 120467],
    watchlist: [1398, 387, 10774],
    rated: [
      { id: 38, rating: 9.5 },
      { id: 129, rating: 9 },
      { id: 120467, rating: 8.5 },
      { id: 670, rating: 8 },
      { id: 496243, rating: 9 },
      { id: 278, rating: 8.5 },
    ],
    listSunday: [4538, 1548, 401, 11305],
    listBodyHorror: [837, 9426, 9538, 1946],
    friends: [496243, 11423, 30018, 387426, 110415, 1255],
    discover: [1368337, 1272837, 1339713, 1154538, 329865, 76341],
  };

  const SPLASH_GROUP_NAMES = Object.keys(SPLASH_GROUPS);

  const moviesById = new Map(SPLASH_MOVIES.map((movie) => [movie.id, movie]));

  function getCardHtml() {
    if (typeof appCardHtml !== "undefined") {
      return appCardHtml;
    }
    if (typeof require === "function") {
      return require("./card-html");
    }
    throw new Error("appCardHtml is not available");
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

  function splashMovie(id) {
    return moviesById.get(Number(id)) || null;
  }

  /** Ids and `{ id, rating }` entries both normalize to the same shape. */
  function splashGroupEntries(name) {
    const raw = SPLASH_GROUPS[name];
    if (!Array.isArray(raw)) {
      return [];
    }
    const entries = [];
    for (const item of raw) {
      const id = Number(item && typeof item === "object" ? item.id : item);
      if (!Number.isInteger(id) || id <= 0) {
        continue;
      }
      const rating = item && typeof item === "object" ? Number(item.rating) : NaN;
      entries.push({ id, rating: Number.isFinite(rating) ? rating : null });
    }
    return entries;
  }

  /**
   * Tiles for one group, in the order they are curated. An entry is dropped when
   * its poster is not on disk, so a trimmed data/posters/ degrades to fewer tiles
   * instead of broken images.
   */
  function splashTiles(name, options = {}) {
    const posterUrl = typeof options.posterUrl === "function" ? options.posterUrl : () => null;
    const tiles = [];
    for (const entry of splashGroupEntries(name)) {
      const movie = splashMovie(entry.id);
      if (!movie) {
        continue;
      }
      const url = posterUrl(entry.id);
      if (!url) {
        continue;
      }
      tiles.push({
        id: movie.id,
        title: movie.title,
        year: movie.year,
        rating: entry.rating,
        posterUrl: String(url),
      });
    }
    return tiles;
  }

  /**
   * `poster` is a bare poster for the decorative marquee. `rated` shows the demo
   * rating the way the real cards do, and `titled` falls back to the year.
   */
  function splashMetaRowHtml(tile, variant) {
    const escapeHtml = getCardHtml().escapeHtml;
    const year = escapeHtml(tile.year);
    const yearHtml = `<span class="card-meta-year">${year}</span>`;
    if (variant !== "rated") {
      return `<div class="splash-tile-meta-row card-meta-row">
    <div class="card-meta">${yearHtml}</div>
  </div>`;
    }
    const ratingLabel = getRatings().formatUserRating(tile.rating);
    const safeRating = escapeHtml(ratingLabel || "—");
    const ratingSegment = ratingLabel
      ? `<span class="rating-segment rating-segment--mine" aria-label="Your rating ${safeRating}" title="Your rating">${safeRating}</span>`
      : `<span class="rating-segment rating-segment--mine is-empty" aria-label="Your rating —" title="Your rating">—</span>`;
    return `<div class="splash-tile-meta-row card-meta-row">
    <div class="card-meta">${yearHtml}</div>
    <div class="rating-chit card-body-ratings" aria-label="Your rating ${safeRating}">${ratingSegment}</div>
  </div>`;
  }

  function splashTileHtml(tile, variant) {
    const escapeHtml = getCardHtml().escapeHtml;
    const title = escapeHtml(tile.title);
    const poster = `<div class="splash-tile-poster"><img src="${escapeHtml(tile.posterUrl)}" alt="${title} poster" loading="lazy" decoding="async" /></div>`;
    if (variant === "poster") {
      return `<div class="splash-tile splash-tile--poster">${poster}</div>`;
    }
    const tileClass = variant === "rated" ? "splash-tile--rated" : "splash-tile--titled";
    return `<div class="splash-tile ${tileClass}">
    ${poster}
    <div class="splash-tile-body">
      <div class="splash-tile-text">
        <div class="splash-tile-title">${title}</div>
        ${splashMetaRowHtml(tile, variant)}
      </div>
    </div>
  </div>`;
  }

  /** `repeat` is for the marquee, which needs two identical runs to loop. */
  function splashTilesHtml(tiles, variant, repeat = 1) {
    const run = tiles.map((tile) => splashTileHtml(tile, variant)).join("");
    return run.repeat(Math.max(1, Number(repeat) || 1));
  }

  return {
    SPLASH_MOVIES,
    SPLASH_GROUPS,
    SPLASH_GROUP_NAMES,
    splashMovie,
    splashGroupEntries,
    splashTiles,
    splashTileHtml,
    splashTilesHtml,
  };
})();
