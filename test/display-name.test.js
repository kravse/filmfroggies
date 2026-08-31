const test = require("node:test");
const assert = require("node:assert/strict");
const {
  DISPLAY_NAME_MAX,
  storedDisplayName,
  normalizeDisplayName,
  displayNameError,
  resolveDisplayName,
  hasCustomDisplayName,
} = require("../scripts/lib/display-name");

test("normalizeDisplayName accepts handles and trims", () => {
  assert.equal(normalizeDisplayName("badmoviehomie"), "badmoviehomie");
  assert.equal(normalizeDisplayName("  BadMovie.Homie_1  "), "BadMovie.Homie_1");
  assert.equal(normalizeDisplayName("a1b"), "a1b");
});

test("normalizeDisplayName rejects spaces, symbols, bad starts, and bad lengths", () => {
  assert.equal(normalizeDisplayName("bad movie homie"), null);
  assert.equal(normalizeDisplayName("bad-movie"), null);
  assert.equal(normalizeDisplayName("jared+test"), null);
  assert.equal(normalizeDisplayName("_leading"), null);
  assert.equal(normalizeDisplayName(".leading"), null);
  assert.equal(normalizeDisplayName("ab"), null);
  assert.equal(normalizeDisplayName("x".repeat(DISPLAY_NAME_MAX + 1)), null);
  assert.equal(normalizeDisplayName(""), null);
  assert.equal(normalizeDisplayName(null), null);
});

test("displayNameError explains the rule that failed", () => {
  assert.equal(displayNameError("badmoviehomie"), null);
  assert.match(displayNameError(""), /Enter a display name/);
  assert.match(displayNameError("ab"), /at least 3/);
  assert.match(displayNameError("x".repeat(DISPLAY_NAME_MAX + 1)), /20 characters or fewer/);
  assert.match(displayNameError("bad movie"), /Letters, numbers/);
});

test("resolveDisplayName prefers the stored name and never returns blank", () => {
  assert.equal(
    resolveDisplayName({ displayName: "badmoviehomie", email: "jared987@gmail.com" }),
    "badmoviehomie",
  );
  assert.equal(resolveDisplayName({ displayName: "", email: "jared987@gmail.com" }), "jared987");
  assert.equal(resolveDisplayName({ display_name: null, email: "jared987@gmail.com" }), "jared987");
  assert.equal(resolveDisplayName({ display_name: "sam", email: null }), "sam");
  assert.equal(resolveDisplayName({}), "Someone");
  assert.equal(resolveDisplayName(null), "Someone");
});

test("resolveDisplayName is lenient about stored values the write path would reject", () => {
  assert.equal(resolveDisplayName({ display_name: "Bad Movie Homie", email: "a@b.co" }), "Bad Movie Homie");
});

test("storedDisplayName and hasCustomDisplayName separate set from unset", () => {
  assert.equal(storedDisplayName({ displayName: "  sam  " }), "sam");
  assert.equal(storedDisplayName({ display_name: null, email: "jared987@gmail.com" }), "");
  assert.equal(hasCustomDisplayName({ displayName: "sam", email: "a@b.co" }), true);
  assert.equal(hasCustomDisplayName({ displayName: "", email: "jared987@gmail.com" }), false);
  assert.equal(hasCustomDisplayName({ display_name: null, email: "jared987@gmail.com" }), false);
});
