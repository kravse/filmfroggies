const { test } = require("node:test");
const assert = require("node:assert/strict");

const { listCsvRows, buildListCsv, parseListCsv } = require("../scripts/lib/list-csv");
const { defaultUserState } = require("../scripts/lib/user-state");
const { assignMovieToList } = require("../scripts/lib/lists");
const { setMovieStatus, REMOVED_STATUS } = require("../scripts/lib/sync-merge");

function stateWith(entries) {
  let state = defaultUserState();
  for (const [movieId, listId] of entries) {
    state = { ...state, lists: assignMovieToList(state.lists, listId, movieId) };
  }
  return state;
}

function records(map) {
  return (id) => map[id] || {};
}

test("rows are watched first, then watchlist, each in stored order", () => {
  const state = stateWith([
    [603, "watched"],
    [604, "watched"],
    [1891, "watchlist"],
  ]);
  assert.deepEqual(listCsvRows(state, records({ 603: { title: "The Matrix" } })), [
    {
      id: 603,
      title: "The Matrix",
      listId: "watched",
      listName: "Watched",
      myRating: "",
      releaseYear: "",
    },
    {
      id: 604,
      title: "",
      listId: "watched",
      listName: "Watched",
      myRating: "",
      releaseYear: "",
    },
    {
      id: 1891,
      title: "",
      listId: "watchlist",
      listName: "Watchlist",
      myRating: "",
      releaseYear: "",
    },
  ]);
});

test("listCsvRows includes my_rating and release_year when available", () => {
  const state = {
    ...stateWith([[603, "watched"]]),
    ratings: { 603: 8.5, 604: 10 },
  };
  assert.deepEqual(
    listCsvRows(
      state,
      records({
        603: { title: "The Matrix", releaseDate: "1999-03-31" },
        604: { title: "Next", releaseDate: "2000-01-01" },
      }),
    ),
    [
      {
        id: 603,
        title: "The Matrix",
        listId: "watched",
        listName: "Watched",
        myRating: "8.5",
        releaseYear: "1999",
      },
    ],
  );
});

test("removed movies never reach the csv", () => {
  let state = stateWith([
    [603, "watched"],
    [604, "watched"],
  ]);
  state = {
    ...state,
    lists: state.lists.map((list) => ({
      ...list,
      movieIds: list.movieIds.filter((id) => id !== 604),
    })),
    statuses: setMovieStatus(state.statuses, 604, REMOVED_STATUS),
  };
  assert.deepEqual(
    listCsvRows(state, records({})).map((row) => row.id),
    [603],
  );
});

test("listCsvRows tolerates a state with no lists", () => {
  assert.deepEqual(listCsvRows(null, null), []);
  assert.deepEqual(listCsvRows({}, null), []);
});

test("listCsvRows includes custom-list movies not on watched or watchlist", () => {
  const state = {
    ...stateWith([[603, "watched"]]),
    customLists: [
      {
        id: "custom-scifi",
        name: "Sci-Fi",
        movieIds: [603, 999],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "custom-horror",
        name: "Horror",
        movieIds: [1000],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ],
  };
  assert.deepEqual(
    listCsvRows(
      state,
      records({
        603: { title: "The Matrix", releaseDate: "1999-03-31" },
        999: { title: "Alien", releaseDate: "1979-05-25" },
      }),
    ),
    [
      {
        id: 603,
        title: "The Matrix",
        listId: "watched",
        listName: "Watched",
        myRating: "",
        releaseYear: "1999",
      },
      {
        id: 999,
        title: "Alien",
        listId: "custom-scifi",
        listName: "Sci-Fi",
        myRating: "",
        releaseYear: "1979",
      },
      {
        id: 1000,
        title: "",
        listId: "custom-horror",
        listName: "Horror",
        myRating: "",
        releaseYear: "",
      },
    ],
  );
});

test("listCsvRows exports custom-only movies once when they appear on multiple lists", () => {
  const state = {
    lists: [],
    customLists: [
      {
        id: "custom-a",
        name: "A",
        movieIds: [42],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "custom-b",
        name: "B",
        movieIds: [42],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ],
  };
  assert.deepEqual(listCsvRows(state, records({})), [
    {
      id: 42,
      title: "",
      listId: "custom-a",
      listName: "A",
      myRating: "",
      releaseYear: "",
    },
  ]);
});

test("buildListCsv writes a header and one row per movie", () => {
  const csv = buildListCsv([
    {
      id: 603,
      title: "The Matrix",
      listId: "watched",
      listName: "Watched",
      myRating: "8.5",
      releaseYear: "1999",
    },
  ]);
  assert.equal(
    csv,
    "tmdb_id,title,list_id,list_name,my_rating,release_year\n603,The Matrix,watched,Watched,8.5,1999\n",
  );
});

test("buildListCsv quotes titles that would otherwise break the row", () => {
  const csv = buildListCsv([
    {
      id: 1,
      title: "Lock, Stock and Two Smoking Barrels",
      listId: "watched",
      listName: "Watched",
      myRating: "",
      releaseYear: "1998",
    },
    {
      id: 2,
      title: 'The "Burbs',
      listId: "watched",
      listName: "Watched",
      myRating: "7.0",
      releaseYear: "",
    },
    {
      id: 3,
      title: "Line\nBreak",
      listId: "watchlist",
      listName: "Watchlist",
      myRating: "",
      releaseYear: "2020",
    },
  ]);
  assert.equal(
    csv,
    "tmdb_id,title,list_id,list_name,my_rating,release_year\n" +
      '1,"Lock, Stock and Two Smoking Barrels",watched,Watched,,1998\n' +
      '2,"The ""Burbs",watched,Watched,7.0,\n' +
      '3,"Line\nBreak",watchlist,Watchlist,,2020\n',
  );
});

test("parseListCsv reads ids and skips the header", () => {
  assert.deepEqual(
    parseListCsv(
      "tmdb_id,title,list_id,list_name,my_rating,release_year\n603,The Matrix,watched,Watched,8.5,1999\n1891,Star Wars,watchlist,Watchlist,,1977\n",
    ),
    [603, 1891],
  );
});

test("parseListCsv ignores blank lines, junk rows, and duplicates", () => {
  const csv = [
    "tmdb_id,title,list_id,list_name,my_rating,release_year",
    "603,The Matrix,watched,Watched,8.5,1999",
    "",
    "   ",
    "not-an-id,whatever,watched,Watched,,",
    "-5,negative,watched,Watched,,",
    "0,zero,watched,Watched,,",
    "603,The Matrix again,watchlist,Watchlist,,",
    "604",
  ].join("\n");
  assert.deepEqual(parseListCsv(csv), [603, 604]);
});

test("parseListCsv handles a quoted id column and crlf endings", () => {
  assert.deepEqual(
    parseListCsv('"603",The Matrix,watched,Watched,8.5,1999\r\n"604",Next,watched,Watched,,\r\n'),
    [603, 604],
  );
});

test("parseListCsv returns nothing for empty input", () => {
  assert.deepEqual(parseListCsv(""), []);
  assert.deepEqual(parseListCsv(null), []);
});

test("parseListCsv still reads legacy three-column exports", () => {
  assert.deepEqual(
    parseListCsv("tmdb_id,title,list\n603,The Matrix,watched\n1891,Star Wars,watchlist\n"),
    [603, 1891],
  );
});

test("a csv built from a state round-trips back to the same ids", () => {
  const state = stateWith([
    [603, "watched"],
    [1891, "watchlist"],
  ]);
  const csv = buildListCsv(
    listCsvRows(state, records({ 603: { title: "Lock, Stock", releaseDate: "1998-08-28" } })),
  );
  assert.deepEqual(parseListCsv(csv), [603, 1891]);
});
