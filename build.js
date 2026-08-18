#!/usr/bin/env node
/**
 * Writes the deployable static site to build/.
 *
 * Routing is hash-only, so there is nothing to configure on the host: no
 * rewrite rules, no SPA fallback, no 404 page. The output is index.html, one
 * concatenated stylesheet, the JS bundle, and a noindex robots.txt.
 */
const fs = require("fs");
const path = require("path");

const { bundleAppJs } = require("./scripts/bundle-app-js");
const { VIEWER_CSS_FILES } = require("./scripts/css-manifest");

const ROOT = __dirname;
const BUILD_DIR = path.join(ROOT, "build");
const CSS_BUNDLE_NAME = "app.css";

function resetBuildDir() {
  fs.rmSync(BUILD_DIR, { recursive: true, force: true });
  fs.mkdirSync(path.join(BUILD_DIR, "css"), { recursive: true });
  fs.mkdirSync(path.join(BUILD_DIR, "js"), { recursive: true });
}

function writeCssBundle() {
  const css = VIEWER_CSS_FILES.map((file) => {
    const source = path.join(ROOT, "css", file);
    if (!fs.existsSync(source)) {
      throw new Error(`Missing stylesheet: ${file}`);
    }
    return `/* ${file} */\n${fs.readFileSync(source, "utf8").trim()}`;
  }).join("\n\n");
  fs.writeFileSync(path.join(BUILD_DIR, "css", CSS_BUNDLE_NAME), `${css}\n`);
}

/** Collapses the per-file <link> tags into the single built stylesheet. */
function rewriteHtml() {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const linkPattern = /[ \t]*<link rel="stylesheet" href="css\/[^"]+" \/>\n/g;
  const links = html.match(linkPattern) || [];
  if (links.length !== VIEWER_CSS_FILES.length) {
    throw new Error(
      `index.html links ${links.length} stylesheets but the manifest lists ${VIEWER_CSS_FILES.length}`,
    );
  }

  let seen = 0;
  const rewritten = html.replace(linkPattern, () => {
    seen += 1;
    return seen === 1
      ? `    <link rel="stylesheet" href="css/${CSS_BUNDLE_NAME}" />\n`
      : "";
  });
  fs.writeFileSync(path.join(BUILD_DIR, "index.html"), rewritten);
}

function copyImages() {
  const src = path.join(ROOT, "images");
  if (!fs.existsSync(src)) {
    return;
  }
  const dest = path.join(BUILD_DIR, "images");
  fs.mkdirSync(dest, { recursive: true });
  for (const file of fs.readdirSync(src)) {
    const from = path.join(src, file);
    if (fs.statSync(from).isFile()) {
      fs.copyFileSync(from, path.join(dest, file));
    }
  }
}

function copyBundle() {
  fs.copyFileSync(
    path.join(ROOT, "js", "app-bundle.js"),
    path.join(BUILD_DIR, "js", "app-bundle.js"),
  );
}

/** A personal collection has no business in search results. */
function writeRobots() {
  fs.writeFileSync(
    path.join(BUILD_DIR, "robots.txt"),
    "User-agent: *\nDisallow: /\n",
  );
}

function build() {
  bundleAppJs();
  resetBuildDir();
  writeCssBundle();
  rewriteHtml();
  copyImages();
  copyBundle();
  writeRobots();
}

if (require.main === module) {
  build();
  console.log(
    `Wrote build/ (index.html, css/${CSS_BUNDLE_NAME}, js/app-bundle.js, images/, robots.txt)`,
  );
}

module.exports = { build };
