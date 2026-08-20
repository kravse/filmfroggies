const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  ROW_HYDRATE_ROOT_MARGIN,
  movieIdFromRowElement,
} = require("../scripts/lib/viewport-hydration");

test("movieIdFromRowElement reads data-movie-id", () => {
  assert.equal(movieIdFromRowElement({ dataset: { movieId: "603" } }), 603);
  assert.equal(
    movieIdFromRowElement({ getAttribute: (name) => (name === "data-movie-id" ? "550" : null) }),
    550,
  );
  assert.equal(movieIdFromRowElement({ dataset: { movieId: "0" } }), null);
  assert.equal(movieIdFromRowElement(null), null);
});

test("ROW_HYDRATE_ROOT_MARGIN matches poster lazy margin", () => {
  assert.equal(ROW_HYDRATE_ROOT_MARGIN, "240px 0px");
});
