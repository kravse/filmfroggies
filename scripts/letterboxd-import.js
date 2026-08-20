#!/usr/bin/env node
/**
 * Opens the local Letterboxd import tool in your browser.
 *
 * The tool is not part of the deployed site. It produces a backup CSV for
 * Settings → Import backup on the main app.
 */
const { exec } = require("child_process");
const express = require("express");
const path = require("path");

const { bundleLetterboxdTool } = require("./bundle-letterboxd-tool");
const { blockInternalStaticPaths } = require("./lib/static-guard");

const ROOT = path.join(__dirname, "..");
const PORT = Number(process.env.LETTERBOXD_TOOL_PORT) || 8744;
const TOOL_URL = `http://127.0.0.1:${PORT}/tools/letterboxd.html`;

function openBrowser(url) {
  const platform = process.platform;
  const command = platform === "darwin"
    ? `open "${url}"`
    : platform === "win32"
      ? `start "" "${url}"`
      : `xdg-open "${url}"`;
  exec(command, (error) => {
    if (error) {
      console.error(`Open this URL in your browser:\n${url}`);
    }
  });
}

function startToolServer() {
  bundleLetterboxdTool();
  const app = express();
  app.use(blockInternalStaticPaths);
  app.use(
    express.static(ROOT, {
      extensions: ["html"],
      setHeaders(res) {
        res.setHeader("X-Robots-Tag", "noindex, nofollow");
        res.setHeader("Cache-Control", "no-store");
      },
    }),
  );
  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, "127.0.0.1", () => {
      resolve(server);
    });
    server.on("error", reject);
  });
}

async function main() {
  const server = await startToolServer();
  console.log(`Letterboxd import tool running at ${TOOL_URL}`);
  console.log("Press Ctrl+C to stop.");
  openBrowser(TOOL_URL);
  const shutdown = () => {
    server.close(() => process.exit(0));
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  if (error && error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Set LETTERBOXD_TOOL_PORT to another port.`);
  } else {
    console.error(error.message || error);
  }
  process.exitCode = 1;
});
