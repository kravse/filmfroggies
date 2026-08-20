const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  BATCH_MAX_IDS,
  normalizeBatchIds,
  chunkIds,
  parseBatchResponse,
  mergeBatchIntoMap,
} = require("../scripts/lib/movie-cache");

test("normalizeBatchIds dedupes and caps", () => {
  assert.deepEqual(normalizeBatchIds([1, 1, 2, 0, -3]), [1, 2]);
  assert.equal(normalizeBatchIds(Array.from({ length: 120 }, (_, i) => i + 1)).length, BATCH_MAX_IDS);
});

test("chunkIds splits long lists", () => {
  const ids = Array.from({ length: 150 }, (_, i) => i + 1);
  const chunks = chunkIds(ids);
  assert.equal(chunks.length, 2);
  assert.equal(chunks[0].length, 100);
  assert.equal(chunks[1].length, 50);
});

test("parseBatchResponse keeps detailed server records", () => {
  const { movies, missing } = parseBatchResponse({
    movies: {
      550: {
        id: 550,
        title: "Fight Club",
        genres: ["Drama"],
        directors: [],
        cast: [],
      },
    },
    missing: [999],
  });
  assert.equal(movies[550].title, "Fight Club");
  assert.deepEqual(missing, [999]);
});

test("mergeBatchIntoMap merges into a Map", () => {
  const map = new Map();
  mergeBatchIntoMap(map, { 1: { id: 1, title: "A", genres: [] } });
  assert.equal(map.get(1).title, "A");
});
