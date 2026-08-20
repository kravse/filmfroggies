#!/usr/bin/env node
/**
 * Generate one-time signup invite codes and insert hashes into D1.
 *
 * Plaintext codes are printed once — store them somewhere safe before closing
 * the terminal. Only SHA-256 hashes are written to the database.
 *
 * Usage:
 *   node scripts/generate-invite-codes.js --count 3
 *   node scripts/generate-invite-codes.js --count 1 --local
 *   node scripts/generate-invite-codes.js --count 5 --dry-run
 *
 * Requires wrangler logged in for --remote (default). Run from repo root.
 */
const crypto = require("crypto");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const WORKER_DIR = path.join(ROOT, "worker");
const D1_NAME = "cinequeue";

function usage() {
  console.error(`Usage: node scripts/generate-invite-codes.js [--count N] [--local] [--dry-run]

  --count N    Number of codes to generate (default: 1)
  --local      Insert into local D1 (wrangler dev) instead of remote
  --dry-run    Print codes and SQL only; do not execute wrangler`);
}

function parseArgs(argv) {
  let count = 1;
  let remote = true;
  let dryRun = false;

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
    if (arg === "--count") {
      count = Number(argv[i + 1]);
      i += 1;
      continue;
    }
    if (arg === "--local") {
      remote = false;
      continue;
    }
    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }
    console.error(`Unknown argument: ${arg}`);
    usage();
    process.exit(1);
  }

  if (!Number.isInteger(count) || count < 1 || count > 100) {
    console.error("--count must be an integer from 1 to 100");
    process.exit(1);
  }

  return { count, remote, dryRun };
}

function hashInviteCode(code) {
  return crypto.createHash("sha256").update(String(code).trim(), "utf8").digest("hex");
}

function generateInviteCode() {
  return crypto.randomBytes(12).toString("base64url");
}

function sqlLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function buildInsertSql(entries) {
  const values = entries
    .map(({ hash, createdAt }) => `(${sqlLiteral(hash)}, ${createdAt})`)
    .join(",\n  ");
  return `INSERT INTO invite_codes (code_hash, created_at) VALUES\n  ${values};`;
}

function main() {
  const { count, remote, dryRun } = parseArgs(process.argv);
  const createdAt = Date.now();
  const codes = [];
  const entries = [];

  for (let i = 0; i < count; i += 1) {
    const code = generateInviteCode();
    codes.push(code);
    entries.push({ hash: hashInviteCode(code), createdAt });
  }

  const sql = buildInsertSql(entries);
  const target = remote ? "remote" : "local";

  console.log(`Generated ${count} one-time signup invite code${count === 1 ? "" : "s"}:\n`);
  for (const code of codes) {
    console.log(`  ${code}`);
  }
  console.log("");

  if (dryRun) {
    console.log("--dry-run: SQL that would be executed:\n");
    console.log(sql);
    return;
  }

  const tmpFile = path.join(WORKER_DIR, `.invite-codes-${process.pid}.sql`);
  fs.writeFileSync(tmpFile, `${sql}\n`, "utf8");

  const args = ["d1", "execute", D1_NAME, remote ? "--remote" : "--local", `--file=${tmpFile}`];
  console.log(`Inserting hashes into D1 (${target})…`);

  const result = spawnSync("wrangler", args, {
    cwd: WORKER_DIR,
    stdio: "inherit",
    env: process.env,
  });

  fs.unlinkSync(tmpFile);

  if (result.status !== 0) {
    console.error("wrangler d1 execute failed");
    process.exit(result.status || 1);
  }

  console.log("Done. Each code above works once for signup.");
}

main();
