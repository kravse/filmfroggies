const fs = require("fs");
const path = require("path");

const { APP_SYNC_ENTRIES } = require("./app-sync-config");

const ROOT = path.join(__dirname, "..");
const APP_DIR = path.join(ROOT, "js", "app");

function stripModuleExports(source) {
  return source.replace(/\nmodule\.exports = \{[\s\S]*$/, "");
}

function indentBody(source) {
  return source
    .trimEnd()
    .split("\n")
    .map((line) => (line.trim() ? `  ${line}` : line))
    .join("\n");
}

function readCombinedBody(entry) {
  const bodies = entry.sources.map((sourcePath) => {
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Missing app sync source: ${sourcePath}`);
    }
    const body = stripModuleExports(fs.readFileSync(sourcePath, "utf8"));
    return body.trimEnd();
  });
  return bodies.join("\n\n");
}

function formatExports(exports) {
  return exports.map((name) => `    ${name},`).join("\n");
}

function syncAppModule(entry, outputDir = APP_DIR) {
  const body = readCombinedBody(entry);
  const output = `/* ${entry.header} */

const ${entry.globalName} = (function () {
${indentBody(body)}

  return {
${formatExports(entry.exports)}
  };
})();
`;
  fs.mkdirSync(outputDir, { recursive: true });
  const targetPath = path.join(outputDir, path.basename(entry.target));
  fs.writeFileSync(targetPath, output);
  return targetPath;
}

function syncAllAppModules() {
  for (const entry of APP_SYNC_ENTRIES) {
    syncAppModule(entry);
  }
}

module.exports = {
  APP_SYNC_ENTRIES,
  stripModuleExports,
  indentBody,
  readCombinedBody,
  syncAppModule,
  syncAllAppModules,
};
