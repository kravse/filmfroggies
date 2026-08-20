#!/usr/bin/env node
/**
 * Read-only static file server for local viewing.
 *
 * There is no API here by design: the browser is the only writer in this
 * project, into localStorage and optionally a GitHub Gist. Routing is
 * hash-only, so no rewrite rules are needed either.
 */
const path = require("path");
const express = require("express");
const { blockInternalStaticPaths } = require("./scripts/lib/static-guard");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 8743;

const app = express();

app.use(blockInternalStaticPaths);

app.use(
  express.static(ROOT, {
    extensions: ["html"],
    setHeaders(res, filePath) {
      if (!filePath.endsWith("robots.txt")) {
        res.setHeader("X-Robots-Tag", "noindex, nofollow");
      }
      if (filePath.endsWith("app-bundle.js") || filePath.endsWith(".css")) {
        res.setHeader("Cache-Control", "no-store");
      }
    },
  }),
);

app.listen(PORT, () => {
  console.log(`CineQueue running at http://localhost:${PORT}`);
});
