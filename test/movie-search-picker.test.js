const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createMovieSearchPicker,
  movieSearchResultsHtml,
} = require("../scripts/lib/movie-search-picker");

test("movie search picker publishes results and selection", async () => {
  let selected = null;
  const picker = createMovieSearchPicker({
    search: async () => [{ id: 1, title: "One" }],
    onSelect: (result) => { selected = result; },
  });
  await picker.run("one");
  assert.equal(picker.select(0).id, 1);
  assert.equal(selected.title, "One");
});

test("movie search picker ignores a stale response", async () => {
  const pending = [];
  const seen = [];
  const picker = createMovieSearchPicker({
    search: (query) => new Promise((resolve) => pending.push({ query, resolve })),
    onResults: (_results, query) => seen.push(query),
  });
  const first = picker.run("first");
  const second = picker.run("second");
  pending[0].resolve([{ id: 1 }]);
  pending[1].resolve([{ id: 2 }]);
  await Promise.all([first, second]);
  assert.deepEqual(seen, ["second"]);
});

test("shared result renderer includes poster, title, metadata, and badge", () => {
  const html = movieSearchResultsHtml([{ id: 7, title: "Seven" }], {
    escapeHtml: String,
    posterUrl: () => "https://image.test/poster.jpg",
    meta: () => "1995",
    badge: () => '<span class="search-suggest-added">In Watched</span>',
  });
  assert.match(html, /search-suggest-poster/);
  assert.match(html, /Seven/);
  assert.match(html, /1995/);
  assert.match(html, /In Watched/);
});
