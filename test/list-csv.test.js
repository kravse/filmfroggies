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

function titles(map) {
  return (id) => map[id] || "";
}

test("rows are watched first, then watchlist, each in stored order", () => {
  const state = stateWith([
    [603, "watched"],
    [604, "watched"],
    [1891, "watchlist"],
  ]);
  assert.deepEqual(listCsvRows(state, titles({ 603: "The Matrix" })), [
    { id: 603, title: "The Matrix", listId: "watched" },
    { id: 604, title: "", listId: "watched" },
    { id: 1891, title: "", listId: "watchlist" },
  ]);
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
    listCsvRows(state, titles({})).map((row) => row.id),
    [603],
  );
});

test("listCsvRows tolerates a state with no lists", () => {
  assert.deepEqual(listCsvRows(null, null), []);
  assert.deepEqual(listCsvRows({}, null), []);
});

test("buildListCsv writes a header and one row per movie", () => {
  const csv = buildListCsv([{ id: 603, title: "The Matrix", listId: "watched" }]);
  assert.equal(csv, "tmdb_id,title,list\n603,The Matrix,watched\n");
});

test("buildListCsv quotes titles that would otherwise break the row", () => {
  const csv = buildListCsv([
    { id: 1, title: "Lock, Stock and Two Smoking Barrels", listId: "watched" },
    { id: 2, title: 'The "Burbs', listId: "watched" },
    { id: 3, title: "Line\nBreak", listId: "watchlist" },
  ]);
  assert.equal(
    csv,
    'tmdb_id,title,list\n' +
      '1,"Lock, Stock and Two Smoking Barrels",watched\n' +
      '2,"The ""Burbs",watched\n' +
      '3,"Line\nBreak",watchlist\n',
  );
});

test("parseListCsv reads ids and skips the header", () => {
  assert.deepEqual(
    parseListCsv("tmdb_id,title,list\n603,The Matrix,watched\n1891,Star Wars,watchlist\n"),
    [603, 1891],
  );
});

test("parseListCsv ignores blank lines, junk rows, and duplicates", () => {
  const csv = [
    "tmdb_id,title,list",
    "603,The Matrix,watched",
    "",
    "   ",
    "not-an-id,whatever,watched",
    "-5,negative,watched",
    "0,zero,watched",
    "603,The Matrix again,watchlist",
    "604",
  ].join("\n");
  assert.deepEqual(parseListCsv(csv), [603, 604]);
});

test("parseListCsv handles a quoted id column and crlf endings", () => {
  assert.deepEqual(parseListCsv('"603",The Matrix,watched\r\n"604",Next,watched\r\n'), [603, 604]);
});

test("parseListCsv returns nothing for empty input", () => {
  assert.deepEqual(parseListCsv(""), []);
  assert.deepEqual(parseListCsv(null), []);
});

test("a csv built from a state round-trips back to the same ids", () => {
  const state = stateWith([
    [603, "watched"],
    [1891, "watchlist"],
  ]);
  const csv = buildListCsv(listCsvRows(state, titles({ 603: "Lock, Stock" })));
  assert.deepEqual(parseListCsv(csv), [603, 1891]);
});
