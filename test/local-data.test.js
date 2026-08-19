const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  LOCAL_DATA_VERSION,
  LOCAL_POSTER_SIZES,
  posterFileFromPath,
  isPosterFile,
  pickPosterSize,
  localPosterUrl,
  normalizeLocalRecord,
  normalizeLocalData,
  serializeLocalData,
} = require("../scripts/lib/local-data");

const POSTER = "f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg";

function record(id, extra = {}) {
  return {
    id,
    title: `Movie ${id}`,
    releaseDate: "1999-03-31",
    overview: "Overview",
    tagline: null,
    posterPath: `/${POSTER}`,
    backdropPath: null,
    runtime: 136,
    voteAverage: 8.2,
    genres: ["Action"],
    directors: ["Lana Wachowski"],
    cast: ["Keanu Reeves"],
    poster: POSTER,
    ...extra,
  };
}

function payload(movies, extra = {}) {
  return {
    version: LOCAL_DATA_VERSION,
    generatedAt: "2026-08-18T00:00:00.000Z",
    posterSizes: LOCAL_POSTER_SIZES,
    movies,
    ...extra,
  };
}

test("a card request is served the smallest stored size above it", () => {
  assert.equal(pickPosterSize("w185", ["w342", "w500"]), "w342");
  assert.equal(pickPosterSize("w92", ["w342", "w500"]), "w342");
  assert.equal(pickPosterSize("w342", ["w342", "w500"]), "w342");
  assert.equal(pickPosterSize("w500", ["w342", "w500"]), "w500");
});

test("a request wider than anything stored falls back to the largest", () => {
  assert.equal(pickPosterSize("original", ["w342", "w500"]), "w500");
  assert.equal(pickPosterSize("w780", ["w342", "w500"]), "w500");
});

test("pickPosterSize sorts stored sizes by width, not by array order", () => {
  assert.equal(pickPosterSize("w185", ["w500", "w342"]), "w342");
});

test("pickPosterSize returns null without usable sizes", () => {
  assert.equal(pickPosterSize("w185", []), null);
  assert.equal(pickPosterSize("w185", ["huge", "small"]), null);
  assert.equal(pickPosterSize("nonsense", ["w342"]), null);
});

test("localPosterUrl builds a path under the poster directory", () => {
  assert.equal(
    localPosterUrl(POSTER, "w185", ["w342", "w500"]),
    `data/posters/w342/${POSTER}`,
  );
});

test("localPosterUrl rejects filenames that are not plain poster basenames", () => {
  for (const bad of ["", null, `/${POSTER}`, `../${POSTER}`, "a/b.jpg", "poster.svg", "poster"]) {
    assert.equal(localPosterUrl(bad, "w342", ["w342"]), null, `expected null for ${bad}`);
  }
});

test("localPosterUrl returns null when no poster is stored", () => {
  assert.equal(localPosterUrl(POSTER, "w342", []), null);
});

test("isPosterFile accepts basenames and rejects paths", () => {
  assert.equal(isPosterFile(POSTER), true);
  assert.equal(isPosterFile("a.webp"), true);
  assert.equal(isPosterFile(`/${POSTER}`), false);
  assert.equal(isPosterFile("dir/a.jpg"), false);
});

test("posterFileFromPath strips the leading slash and validates", () => {
  assert.equal(posterFileFromPath(`/${POSTER}`), POSTER);
  assert.equal(posterFileFromPath(POSTER), null);
  assert.equal(posterFileFromPath("/../escape.jpg"), null);
  assert.equal(posterFileFromPath(null), null);
});

test("normalizeLocalRecord keeps the movie shape the app renders", () => {
  assert.deepEqual(normalizeLocalRecord(record(603)), record(603));
});

test("normalizeLocalRecord drops entries without a usable id", () => {
  assert.equal(normalizeLocalRecord(null), null);
  assert.equal(normalizeLocalRecord({ id: 0 }), null);
  assert.equal(normalizeLocalRecord({ id: -1 }), null);
  assert.equal(normalizeLocalRecord({ id: "abc" }), null);
});

test("normalizeLocalRecord repairs junk fields rather than trusting them", () => {
  const normalized = normalizeLocalRecord({
    id: "603",
    title: "   ",
    releaseDate: "",
    runtime: 0,
    voteAverage: "nope",
    genres: "Action",
    directors: [null, "  Lana  ", ""],
    cast: null,
    posterPath: "/evil.svg",
    poster: "../escape.jpg",
  });
  assert.deepEqual(normalized, {
    id: 603,
    title: "Untitled",
    releaseDate: null,
    overview: null,
    tagline: null,
    posterPath: null,
    backdropPath: null,
    runtime: null,
    voteAverage: null,
    genres: [],
    directors: ["Lana"],
    cast: [],
    poster: null,
  });
});

test("normalizeLocalData reads a well formed snapshot", () => {
  const data = normalizeLocalData(payload({ 603: record(603), 604: record(604) }));
  assert.equal(data.generatedAt, "2026-08-18T00:00:00.000Z");
  assert.deepEqual(data.posterSizes, ["w342", "w500"]);
  assert.deepEqual(
    data.records.map((entry) => entry.id),
    [603, 604],
  );
});

test("normalizeLocalData treats an unreadable snapshot as absent", () => {
  const empty = { generatedAt: null, posterSizes: [], records: [] };
  assert.deepEqual(normalizeLocalData(null), empty);
  assert.deepEqual(normalizeLocalData("nope"), empty);
  assert.deepEqual(normalizeLocalData(payload({}, { version: 99 })), empty);
  assert.deepEqual(normalizeLocalData({ version: LOCAL_DATA_VERSION }), empty);
  assert.deepEqual(
    normalizeLocalData(payload("not an object")),
    empty,
  );
});

test("normalizeLocalData skips unusable records instead of failing the file", () => {
  const data = normalizeLocalData(payload({ 603: record(603), bad: { id: null } }));
  assert.deepEqual(
    data.records.map((entry) => entry.id),
    [603],
  );
});

test("serializeLocalData writes ids in ascending order for clean diffs", () => {
  const file = serializeLocalData([record(604), record(603)], {
    generatedAt: "2026-08-18T00:00:00.000Z",
  });
  assert.equal(file.version, LOCAL_DATA_VERSION);
  assert.deepEqual(Object.keys(file.movies), ["603", "604"]);
  assert.deepEqual(file.posterSizes, ["w342", "w500"]);
});

test("serializeLocalData round-trips through normalizeLocalData", () => {
  const file = serializeLocalData([record(603)], { generatedAt: "2026-08-18T00:00:00.000Z" });
  const data = normalizeLocalData(JSON.parse(JSON.stringify(file)));
  assert.deepEqual(data.records, [record(603)]);
});
