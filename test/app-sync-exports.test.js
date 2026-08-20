const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const { APP_SYNC_ENTRIES } = require("../scripts/app-sync-config");

/**
 * A storage key left out of an entry's `exports` still compiles: the generated
 * IIFE declares it but never returns it, so `appUserState.THE_KEY` reads as
 * undefined and localStorage silently writes to a key named "undefined". That
 * round-trips well enough to pass a click-through test, so guard it here.
 */
test("every *_KEY constant in a synced lib is exported to the bundle", () => {
  for (const entry of APP_SYNC_ENTRIES) {
    for (const source of entry.sources) {
      const declared = [
        ...fs.readFileSync(source, "utf8").matchAll(/^const\s+([A-Z0-9_]*KEY)\s*=/gm),
      ].map((match) => match[1]);
      for (const name of declared) {
        assert.ok(
          entry.exports.includes(name),
          `${name} is declared in ${source} but missing from the exports list for ${entry.target}`,
        );
      }
    }
  }
});
