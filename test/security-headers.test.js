/**
 * netlify.toml is the only place the deployed site's response headers are
 * declared, and nothing else exercises it, so these tests guard against a
 * directive being dropped or quietly loosened.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const toml = fs.readFileSync(path.join(__dirname, "..", "netlify.toml"), "utf8");

function headerValue(name) {
  const match = toml.match(new RegExp(`^\\s*${name}\\s*=\\s*"([^"]*)"`, "m"));
  return match ? match[1] : null;
}

function cspDirectives() {
  const value = headerValue("Content-Security-Policy-Report-Only") || headerValue("Content-Security-Policy");
  assert.ok(value, "no Content-Security-Policy header declared");
  const map = new Map();
  for (const part of value.split(";")) {
    const tokens = part.trim().split(/\s+/).filter(Boolean);
    if (tokens.length) {
      map.set(tokens[0], tokens.slice(1));
    }
  }
  return map;
}

test("security headers are declared for every served path", () => {
  assert.equal(headerValue("X-Content-Type-Options"), "nosniff");
  assert.equal(headerValue("Referrer-Policy"), "strict-origin-when-cross-origin");
  assert.equal(headerValue("X-Frame-Options"), "DENY");
  assert.equal(headerValue("Cross-Origin-Opener-Policy"), "same-origin");
  assert.match(headerValue("Permissions-Policy") || "", /geolocation=\(\)/);
});

test("CSP locks down script execution and framing", () => {
  const csp = cspDirectives();
  assert.deepEqual(csp.get("default-src"), ["'self'"]);
  assert.deepEqual(csp.get("script-src"), ["'self'"]);
  assert.deepEqual(csp.get("object-src"), ["'none'"]);
  assert.deepEqual(csp.get("base-uri"), ["'self'"]);
  assert.deepEqual(csp.get("form-action"), ["'self'"]);
  assert.deepEqual(csp.get("frame-ancestors"), ["'none'"]);
});

test("CSP carries no unsafe escape hatches", () => {
  const csp = cspDirectives();
  for (const [directive, sources] of csp) {
    for (const source of sources) {
      assert.ok(
        source !== "'unsafe-inline'" && source !== "'unsafe-eval'",
        `${directive} allows ${source}`,
      );
    }
  }
});

test("CSP allows the origins the app actually loads from", () => {
  const csp = cspDirectives();
  // css/fonts.css @imports Google Fonts, so the stylesheet host counts as a
  // style source and the woff2 files as a font source.
  assert.ok(csp.get("style-src").includes("https://fonts.googleapis.com"));
  assert.ok(csp.get("font-src").includes("https://fonts.gstatic.com"));
  // Posters render from the TMDB CDN and from blobs built out of fetched bytes.
  for (const source of ["'self'", "data:", "blob:", "https://image.tmdb.org"]) {
    assert.ok(csp.get("img-src").includes(source), `img-src missing ${source}`);
  }
  // Same-origin covers /api/tmdb and /api/backend behind the Netlify proxy.
  assert.ok(csp.get("connect-src").includes("'self'"));
  assert.ok(csp.get("connect-src").includes("https://image.tmdb.org"));
});

test("both API proxy redirects are signed", () => {
  const signed = toml.match(/^\s*signed\s*=\s*"NETLIFY_PROXY_SIGNING_SECRET"/gm) || [];
  assert.equal(signed.length, 2);
});
