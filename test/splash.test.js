const { test } = require("node:test");
const assert = require("node:assert/strict");

const fs = require("node:fs");
const path = require("node:path");

const {
  SPLASH_MOVIES,
  SPLASH_GROUPS,
  SPLASH_GROUP_NAMES,
  splashMovie,
  splashGroupEntries,
  splashTiles,
  splashTileHtml,
  splashTilesHtml,
} = require("../scripts/lib/splash");
const { buildImageUrl, isValidImagePath } = require("../scripts/lib/tmdb");

const posterUrl = (id) => `https://image.tmdb.org/t/p/w342/${id}.jpg`;

test("every curated movie has an id, title, year, and poster path", () => {
  assert.ok(SPLASH_MOVIES.length > 0);
  for (const movie of SPLASH_MOVIES) {
    assert.ok(Number.isInteger(movie.id) && movie.id > 0, `bad id: ${movie.id}`);
    assert.ok(movie.title.length > 0, `missing title for ${movie.id}`);
    assert.ok(Number.isInteger(movie.year), `missing year for ${movie.id}`);
    assert.ok(isValidImagePath(movie.posterPath), `bad poster path for ${movie.id}`);
  }
});

test("curated ids are unique", () => {
  const ids = SPLASH_MOVIES.map((movie) => movie.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("every group entry resolves to a curated movie", () => {
  for (const name of SPLASH_GROUP_NAMES) {
    const entries = splashGroupEntries(name);
    assert.ok(entries.length > 0, `empty group: ${name}`);
    for (const entry of entries) {
      assert.ok(splashMovie(entry.id), `group ${name} references unknown id ${entry.id}`);
    }
  }
});

/** A curated id with no usable poster path would be silently dropped from its group. */
test("every group id resolves to a TMDB poster url", () => {
  for (const name of SPLASH_GROUP_NAMES) {
    for (const entry of splashGroupEntries(name)) {
      const url = buildImageUrl(splashMovie(entry.id)?.posterPath, "w342");
      assert.ok(url, `no poster url for ${entry.id} in ${name}`);
    }
  }
});

/** A renamed group would leave a silently empty section on the page. */
/** Mounts use one fluid tile grid; column count is optional via data-splash-cols. */
test("index.html mounts use splash-tiles", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const mounts = [...html.matchAll(/class="[^"]*\bsplash-tiles\b[^"]*"/g)];
  assert.equal(mounts.length, 7, "expected seven section tile mounts");
  assert.ok(!html.includes("splash-tiles--sm"), "remove fixed small tile tier");
  assert.ok(!html.includes("splash-tiles--lg"), "remove fixed large tile tier");
});

test("index.html mounts reference known groups and variants", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const mounts = [...html.matchAll(/data-splash-group="([^"]+)"\s+data-splash-variant="([^"]+)"/g)];
  assert.ok(mounts.length >= SPLASH_GROUP_NAMES.length, `found only ${mounts.length} mounts`);
  const mounted = new Set();
  for (const [, group, variant] of mounts) {
    assert.ok(SPLASH_GROUPS[group], `unknown splash group in index.html: ${group}`);
    assert.ok(["poster", "titled", "rated"].includes(variant), `unknown variant: ${variant}`);
    mounted.add(group);
  }
  for (const name of SPLASH_GROUP_NAMES) {
    assert.ok(mounted.has(name), `curated group is never rendered: ${name}`);
  }
});

test("splashGroupEntries normalizes plain ids and rating entries", () => {
  assert.deepEqual(splashGroupEntries("watchlist")[0], { id: SPLASH_GROUPS.watchlist[0], rating: null });
  const rated = splashGroupEntries("rated");
  assert.equal(rated[0].id, SPLASH_GROUPS.rated[0].id);
  assert.equal(rated[0].rating, SPLASH_GROUPS.rated[0].rating);
});

test("splashGroupEntries ignores unknown groups and junk entries", () => {
  assert.deepEqual(splashGroupEntries("nope"), []);
  assert.deepEqual(splashGroupEntries(undefined), []);
});

test("splashTiles keeps curated order and carries ratings", () => {
  const tiles = splashTiles("rated", { posterUrl });
  assert.deepEqual(
    tiles.map((tile) => tile.id),
    SPLASH_GROUPS.rated.map((entry) => entry.id),
  );
  assert.equal(tiles[0].rating, SPLASH_GROUPS.rated[0].rating);
  assert.equal(tiles[0].posterUrl, posterUrl(tiles[0].id));
  assert.ok(tiles[0].title.length > 0);
});

test("splashTiles drops entries with no resolvable poster", () => {
  const only = SPLASH_GROUPS.watchlist[0];
  const tiles = splashTiles("watchlist", {
    posterUrl: (id) => (id === only ? posterUrl(id) : null),
  });
  assert.deepEqual(
    tiles.map((tile) => tile.id),
    [only],
  );
});

test("splashTiles is empty without a poster resolver", () => {
  assert.deepEqual(splashTiles("hero"), []);
  assert.deepEqual(splashTiles("hero", { posterUrl: () => null }), []);
});

const tile = { id: 1, title: 'Kiss & "Tell"', year: 1999, rating: 8.5, posterUrl: posterUrl(1) };

test("poster tiles carry no text body", () => {
  const html = splashTileHtml(tile, "poster");
  assert.match(html, /splash-tile--poster/);
  assert.match(html, /splash-tile-poster/);
  assert.ok(!html.includes("splash-tile-body"));
});

test("titled tiles show the year in a fixed text block", () => {
  const html = splashTileHtml(tile, "titled");
  assert.match(html, /splash-tile--titled/);
  assert.match(html, /splash-tile-text/);
  assert.match(html, /card-meta-row/);
  assert.match(html, /card-meta-year">1999</);
  assert.match(html, /Kiss &amp; &quot;Tell&quot;/);
  assert.ok(!html.includes('Kiss & "Tell"'));
  assert.ok(!html.includes("rating-chit"));
});

test("rated tiles show year left and a mine rating chit right", () => {
  const html = splashTileHtml(tile, "rated");
  assert.match(html, /splash-tile--rated/);
  assert.match(html, /card-meta-row/);
  assert.match(html, /card-meta-year">1999</);
  assert.match(html, /rating-chit card-body-ratings/);
  assert.match(html, /rating-segment rating-segment--mine[^>]*>8\.5</);
  assert.ok(!html.includes("splash-tile-rating"));
});

test("rated tiles fall back to an empty mine segment when there is no rating", () => {
  const html = splashTileHtml({ ...tile, rating: null }, "rated");
  assert.match(html, /card-meta-year">1999</);
  assert.match(html, /rating-segment--mine is-empty/);
});

test("splashTilesHtml repeats a run for the marquee", () => {
  const one = splashTilesHtml([tile], "poster");
  assert.equal(splashTilesHtml([tile], "poster", 2), one + one);
  assert.equal(splashTilesHtml([tile], "poster", 0), one);
  assert.equal(splashTilesHtml([], "poster", 2), "");
});
