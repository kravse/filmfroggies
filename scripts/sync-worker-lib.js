/**
 * Copy scripts/lib modules into worker/src/lib as ESM for list sorting.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "scripts/lib");
const DEST = path.join(ROOT, "worker/src/lib");

const MODULES = [
  "lists.js",
  "card-html.js",
  "custom-lists.js",
  "sort.js",
  "ratings.js",
  "added-at.js",
  "viewing-history.js",
  "friend-activity.js",
  "list-query.js",
];

const GET_HELPER_MODULES = {
  getLists: "./lists.js",
  getCardHtml: "./card-html.js",
  getRatings: "./ratings.js",
  getAddedAt: "./added-at.js",
  getViewingHistory: "./viewing-history.js",
  getSort: "./sort.js",
  getCustomLists: "./custom-lists.js",
};

function stripGeneratedHeader(code) {
  return code.replace(/^\/\* Generated[^\n]*\n \*\/\n\n?/m, "");
}

function transformGetHelpers(code) {
  let out = code;
  for (const [helper, modPath] of Object.entries(GET_HELPER_MODULES)) {
    const importName = `__${helper}`;
    const pattern = new RegExp(
      `function ${helper}\\(\\)\\s*\\{[\\s\\S]*?\\n\\}`,
      "m",
    );
    if (!pattern.test(out)) {
      continue;
    }
    out = out.replace(pattern, `function ${helper}() {\n  return ${importName};\n}`);
    if (!out.includes(`import * as ${importName}`)) {
      out = `import * as ${importName} from "${modPath}";\n${out}`;
    }
  }
  return out;
}

function transformRequires(code) {
  const imports = [];
  let out = code.replace(/const (\w+) = require\("\.\/([^"]+)"\);/g, (_, name, mod) => {
    const importPath = `./${mod}.js`;
    imports.push(`import * as ${name} from "${importPath}";`);
    return "";
  });
  if (imports.length) {
    out = `${imports.join("\n")}\n${out}`;
  }
  return out;
}

function transformExports(code) {
  const match = code.match(/module\.exports\s*=\s*\{([\s\S]*?)\};?\s*$/);
  if (!match) {
    throw new Error("Expected module.exports block");
  }
  const names = match[1]
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.split(":")[0].trim());
  return code.replace(/module\.exports\s*=\s*\{[\s\S]*?\};?\s*$/, `export { ${names.join(", ")} };`);
}

function toEsm(filename, source) {
  let code = stripGeneratedHeader(source);
  code = transformGetHelpers(code);
  code = transformRequires(code);
  code = transformExports(code);
  return `/* Generated from scripts/lib/${filename} — run npm run sync-worker-lib */\n\n${code.trim()}\n`;
}

function syncWorkerLib() {
  fs.mkdirSync(DEST, { recursive: true });
  for (const filename of MODULES) {
    const source = fs.readFileSync(path.join(SRC, filename), "utf8");
    const output = toEsm(filename, source);
    fs.writeFileSync(path.join(DEST, filename), output);
  }
  console.log(`Synced ${MODULES.length} modules to worker/src/lib/`);
}

if (require.main === module) {
  syncWorkerLib();
}

module.exports = { syncWorkerLib, toEsm };
