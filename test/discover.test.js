const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeDiscoverTab,
  normalizeDiscoverPage,
  buildDiscoverHash,
  parseDiscoverHash,
  normalizeDiscoverListMeta,
  mergeDiscoverMovieIds,
  mergeDiscoverListEntries,
  filterDiscoverPageEntries,
  isUpcomingReleaseEntry,
  isNowPlayingReleaseEntry,
  isProminentDiscoverEntry,
  DISCOVER_MAX_MOVIES,
} = require("../scripts/lib/discover");

test("normalizeDiscoverTab accepts known tabs and defaults to upcoming", () => {
  assert.equal(normalizeDiscoverTab("upcoming"), "upcoming");
  assert.equal(normalizeDiscoverTab("now-playing"), "now-playing");
  assert.equal(normalizeDiscoverTab("bad"), "upcoming");
  assert.equal(normalizeDiscoverTab(null), "upcoming");
});

test("normalizeDiscoverPage clamps invalid and out-of-range values", () => {
  assert.equal(normalizeDiscoverPage(null), 1);
  assert.equal(normalizeDiscoverPage("2"), 2);
  assert.equal(normalizeDiscoverPage(-1), 1);
  assert.equal(normalizeDiscoverPage(99, { maxPages: 5 }), 5);
});

test("buildDiscoverHash omits page one from the URL", () => {
  assert.equal(buildDiscoverHash("upcoming", 1), "#discover/upcoming");
  assert.equal(buildDiscoverHash("now-playing", 3), "#discover/now-playing/3");
});

test("parseDiscoverHash reads tab and page", () => {
  assert.deepEqual(parseDiscoverHash("#discover/upcoming"), { tab: "upcoming", page: 1 });
  assert.deepEqual(parseDiscoverHash("#discover/now-playing/4"), {
    tab: "now-playing",
    page: 4,
  });
  assert.equal(parseDiscoverHash("#discover/bad"), null);
});

test("normalizeDiscoverListMeta reads TMDB pagination fields", () => {
  assert.deepEqual(normalizeDiscoverListMeta({ page: 2, total_pages: 10, total_results: 200 }), {
    page: 2,
    totalPages: 10,
    totalResults: 200,
  });
});

test("mergeDiscoverMovieIds dedupes across pages and caps at fifty", () => {
  const page1 = [{ id: 1, voteCount: 20, popularity: 10, title: "One" }];
  const page2 = [
    { id: 2, voteCount: 20, popularity: 10, title: "Two" },
    { id: 2, voteCount: 20, popularity: 10, title: "Two again" },
  ];
  assert.deepEqual(mergeDiscoverMovieIds([page1, page2]), [1, 2]);

  const many = Array.from({ length: 30 }, (_, index) => ({
    id: index + 1,
    voteCount: 20,
    popularity: 10,
  }));
  const more = Array.from({ length: 30 }, (_, index) => ({
    id: index + 21,
    voteCount: 20,
    popularity: 10,
  }));
  assert.equal(mergeDiscoverMovieIds([many, more]).length, DISCOVER_MAX_MOVIES);
});

test("filterDiscoverPageEntries filters one TMDB page without a multi-page cap", () => {
  const page = Array.from({ length: 25 }, (_, index) => ({
    id: index + 1,
    releaseDate: "2026-10-01",
  }));
  assert.equal(filterDiscoverPageEntries(page, { filterUpcoming: true, todayIso: "2026-08-19" }).length, 25);
});

test("mergeDiscoverListEntries keeps stub records in display order", () => {
  const page = [
    { id: 2, title: "Second", releaseDate: "2026-09-01" },
    { id: 1, title: "First", releaseDate: "2026-08-01" },
    { id: 2, title: "Dup", releaseDate: "2026-09-01" },
  ];
  assert.deepEqual(mergeDiscoverListEntries([page]), [
    { id: 2, title: "Second", releaseDate: "2026-09-01" },
    { id: 1, title: "First", releaseDate: "2026-08-01" },
  ]);
});

test("isUpcomingReleaseEntry keeps TBA and future dates only", () => {
  const today = "2026-08-19";
  assert.equal(isUpcomingReleaseEntry({ releaseDate: "" }, today), true);
  assert.equal(isUpcomingReleaseEntry({ releaseDate: "2026-09-01" }, today), true);
  assert.equal(isUpcomingReleaseEntry({ releaseDate: "2026-08-19" }, today), true);
  assert.equal(isUpcomingReleaseEntry({ releaseDate: "2004-05-14" }, today), false);
});

test("isProminentDiscoverEntry requires votes or TMDB popularity", () => {
  assert.equal(isProminentDiscoverEntry({ voteCount: 12, popularity: 1 }), true);
  assert.equal(isProminentDiscoverEntry({ voteCount: 0, popularity: 12 }), true);
  assert.equal(isProminentDiscoverEntry({ voteCount: 2, popularity: 3 }), false);
});

test("mergeDiscoverMovieIds can drop obscure listings", () => {
  const page = [
    { id: 1, voteCount: 1, popularity: 2 },
    { id: 2, voteCount: 0, popularity: 15 },
    { id: 3, voteCount: 25, popularity: 1 },
  ];
  assert.deepEqual(mergeDiscoverMovieIds([page], { filterProminent: true }), [2, 3]);
});

test("mergeDiscoverMovieIds can drop past upcoming rows", () => {
  const today = "2026-08-19";
  const page = [
    { id: 1, releaseDate: "2004-05-14", voteCount: 20, popularity: 10 },
    { id: 2, releaseDate: "2026-10-01", voteCount: 20, popularity: 10 },
    { id: 3, releaseDate: "", voteCount: 20, popularity: 10 },
  ];
  assert.deepEqual(
    mergeDiscoverMovieIds([page], { filterUpcoming: true, todayIso: today, filterProminent: true }),
    [2, 3],
  );
});

test("mergeDiscoverMovieIds can drop stale now playing rows", () => {
  const today = "2026-08-19";
  const page = [
    { id: 1, releaseDate: "2004-05-14", voteCount: 20, popularity: 10 },
    { id: 2, releaseDate: "2026-08-01", voteCount: 20, popularity: 10 },
    { id: 3, releaseDate: "2026-09-01", voteCount: 20, popularity: 10 },
  ];
  assert.deepEqual(
    mergeDiscoverMovieIds([page], {
      filterNowPlaying: true,
      todayIso: today,
      filterProminent: true,
    }),
    [2],
  );
});

test("isNowPlayingReleaseEntry keeps recent theatrical releases only", () => {
  const today = "2026-08-19";
  assert.equal(isNowPlayingReleaseEntry({ releaseDate: "2026-08-01" }, today), true);
  assert.equal(isNowPlayingReleaseEntry({ releaseDate: "2026-08-19" }, today), true);
  assert.equal(isNowPlayingReleaseEntry({ releaseDate: "2026-09-01" }, today), false);
  assert.equal(isNowPlayingReleaseEntry({ releaseDate: "2004-05-14" }, today), false);
  assert.equal(isNowPlayingReleaseEntry({ releaseDate: "" }, today), false);
});
