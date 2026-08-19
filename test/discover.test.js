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
  trimDiscoverPageToGrid,
  discoverCompleteCount,
  isUpcomingReleaseEntry,
  isNowPlayingReleaseEntry,
  isNewPremiereEntry,
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

test("filterDiscoverPageEntries keeps a full TMDB page for upcoming without client filters", () => {
  const page = Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    releaseDate: index < 4 ? "2026-01-01" : "2026-10-01",
  }));
  assert.equal(filterDiscoverPageEntries(page, { isLastPage: false }).length, 20);
  assert.equal(
    filterDiscoverPageEntries(page, {
      filterUpcoming: true,
      todayIso: "2026-08-19",
      isLastPage: false,
    }).length,
    16,
  );
});

test("filterDiscoverPageEntries filters one TMDB page without a multi-page cap", () => {
  const page = Array.from({ length: 25 }, (_, index) => ({
    id: index + 1,
    releaseDate: "2026-10-01",
  }));
  assert.equal(
    filterDiscoverPageEntries(page, { filterUpcoming: true, todayIso: "2026-08-19", isLastPage: true })
      .length,
    25,
  );
});

test("discoverCompleteCount aligns to 4 for both two- and four-column grids", () => {
  assert.equal(discoverCompleteCount(20), 20);
  assert.equal(discoverCompleteCount(17), 16);
  assert.equal(discoverCompleteCount(13), 12);
  assert.equal(discoverCompleteCount(10), 8);
  assert.equal(discoverCompleteCount(5), 4);
});

test("trimDiscoverPageToGrid drops a trailing orphan on non-final pages only", () => {
  const entries = Array.from({ length: 17 }, (_, index) => ({ id: index + 1 }));
  assert.equal(trimDiscoverPageToGrid(entries, { isLastPage: false }).length, 16);
  assert.equal(trimDiscoverPageToGrid(entries, { isLastPage: true }).length, 17);
  assert.equal(trimDiscoverPageToGrid(entries.slice(0, 5), { isLastPage: false }).length, 4);
  assert.equal(trimDiscoverPageToGrid(entries.slice(0, 3), { isLastPage: false }).length, 3);
});

test("filterDiscoverPageEntries trims incomplete rows before the last page", () => {
  const page = Array.from({ length: 17 }, (_, index) => ({
    id: index + 1,
    releaseDate: "2026-10-01",
    voteCount: 20,
    popularity: 10,
  }));
  assert.equal(
    filterDiscoverPageEntries(page, {
      filterUpcoming: true,
      todayIso: "2026-08-19",
      filterProminent: true,
      isLastPage: false,
    }).length,
    16,
  );
  assert.equal(
    filterDiscoverPageEntries(page, {
      filterUpcoming: true,
      todayIso: "2026-08-19",
      filterProminent: true,
      isLastPage: true,
    }).length,
    17,
  );
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

test("isUpcomingReleaseEntry keeps future dates only", () => {
  const today = "2026-08-19";
  assert.equal(isUpcomingReleaseEntry({ releaseDate: "" }, today), false);
  assert.equal(isUpcomingReleaseEntry({ releaseDate: "2026-09-01" }, today), true);
  assert.equal(isUpcomingReleaseEntry({ releaseDate: "2026-08-19" }, today), true);
  assert.equal(isUpcomingReleaseEntry({ releaseDate: "2004-05-14" }, today), false);
});

test("isNowPlayingReleaseEntry keeps rows in the theatrical window", () => {
  const today = "2026-08-19";
  assert.equal(isNowPlayingReleaseEntry({ releaseDate: "2026-06-01" }, today, 84), true);
  assert.equal(isNowPlayingReleaseEntry({ releaseDate: "2026-05-26" }, today, 84), false);
  assert.equal(isNowPlayingReleaseEntry({ releaseDate: "" }, today, 84), false);
});

test("isNewPremiereEntry rejects classic re-releases when primary is known", () => {
  const today = "2026-08-19";
  assert.equal(
    isNewPremiereEntry(
      {
        primaryReleaseDate: "2006-10-11",
        releaseDate: "2026-09-01",
      },
      { todayIso: today, upcomingOnly: true },
    ),
    false,
  );
  assert.equal(
    isNewPremiereEntry(
      {
        primaryReleaseDate: "2026-09-01",
        releaseDate: "2026-10-01",
      },
      { todayIso: today, upcomingOnly: true },
    ),
    true,
  );
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
    [2],
  );
});
