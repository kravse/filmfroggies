/**
 * Generated app partials run in the browser, which has no `require`. Lib modules
 * may call require only inside `if (typeof require === "function")` helpers.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BUNDLE_PATH = path.join(ROOT, "js", "app-bundle.js");
const APP_DIR = path.join(ROOT, "js", "app");

function isGuardedRequire(lines, index) {
  const window = lines.slice(Math.max(0, index - 4), index + 1).join("\n");
  return /typeof require === ["']function["']/.test(window);
}

function findUnsafeRequires(source, label) {
  const lines = source.split("\n");
  const hits = [];
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (!/\brequire\s*\(/.test(line)) {
      continue;
    }
    if (!isGuardedRequire(lines, index)) {
      hits.push({ label, line: index + 1, text: line.trim() });
    }
  }
  return hits;
}

function assertBrowserSafeSource(source, label) {
  const hits = findUnsafeRequires(source, label);
  if (!hits.length) {
    return;
  }
  const detail = hits
    .map((hit) => `${hit.label}:${hit.line} ${hit.text}`)
    .join("\n");
  throw new Error(
    `Unsafe require() in browser bundle source — use runtime app* globals instead:\n${detail}`,
  );
}

function assertBrowserSafeBundle(bundlePath = BUNDLE_PATH) {
  if (!fs.existsSync(bundlePath)) {
    throw new Error(`Missing app bundle: ${bundlePath}`);
  }
  assertBrowserSafeSource(fs.readFileSync(bundlePath, "utf8"), path.basename(bundlePath));
}

function assertBrowserSafeAppPartials(appDir = APP_DIR) {
  if (!fs.existsSync(appDir)) {
    throw new Error(`Missing app partials directory: ${appDir}`);
  }
  for (const file of fs.readdirSync(appDir)) {
    if (!file.startsWith("00-app-") || !file.endsWith(".js")) {
      continue;
    }
    const filePath = path.join(appDir, file);
    assertBrowserSafeSource(fs.readFileSync(filePath, "utf8"), file);
  }
}

/** Evaluate the bundle in a browser-like scope with no require. */
function assertBundleStarts(appDir = APP_DIR, bundlePath = BUNDLE_PATH) {
  const vm = require("vm");

  const elementHandler = {
    get(target, prop) {
      if (prop in target) {
        return target[prop];
      }
      if (prop === Symbol.toPrimitive || typeof prop === "symbol") {
        return undefined;
      }
      if (["classList", "dataset", "style"].includes(prop)) {
        target[prop] = makeElement();
        return target[prop];
      }
      return (...args) => {
        if (prop === "querySelectorAll" || prop === "getElementsByTagName") {
          return [];
        }
        if (prop === "closest" || prop === "querySelector") {
          return null;
        }
        if (prop === "toggle" || prop === "contains") {
          return false;
        }
        if (prop === "getAttribute") {
          return null;
        }
        return args.length ? undefined : undefined;
      };
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    },
  };

  function makeElement() {
    return new Proxy({ hidden: false, textContent: "", innerHTML: "", value: "", children: [] }, elementHandler);
  }

  const context = {
    console,
    setTimeout,
    clearTimeout,
    URL,
    Blob: class {},
    AbortController,
    Promise,
    JSON,
    Math,
    Date,
    Number,
    String,
    Object,
    Array,
    Set,
    Map,
    Error,
    document: new Proxy(
      {
        getElementById: () => makeElement(),
        createElement: () => makeElement(),
        querySelector: () => makeElement(),
        querySelectorAll: () => [],
        addEventListener: () => {},
        removeEventListener: () => {},
        body: makeElement(),
        documentElement: makeElement(),
        hidden: false,
        visibilityState: "visible",
      },
      elementHandler,
    ),
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
    history: { pushState: () => {}, replaceState: () => {}, back: () => {} },
    location: { hash: "", origin: "https://example.test", href: "https://example.test/" },
    navigator: { userAgent: "bundle-check" },
    fetch: async () => ({ ok: false, status: 404, json: async () => ({}), text: async () => "" }),
    requestAnimationFrame: (fn) => setTimeout(fn, 0),
    matchMedia: () => ({ matches: false, addEventListener: () => {} }),
    caches: undefined,
  };
  context.addEventListener = () => {};
  context.removeEventListener = () => {};
  context.window = context;
  context.globalThis = context;

  vm.createContext(context);
  try {
    vm.runInContext(fs.readFileSync(bundlePath, "utf8"), context, { filename: "app-bundle.js" });
  } catch (error) {
    throw new Error(`app-bundle.js failed to start in a browser-like scope: ${error.message}`);
  }
}

function checkBrowserBundle(options = {}) {
  assertBrowserSafeAppPartials(options.appDir);
  assertBrowserSafeBundle(options.bundlePath);
  assertBundleStarts(options.appDir, options.bundlePath);
}

module.exports = {
  findUnsafeRequires,
  assertBrowserSafeSource,
  assertBrowserSafeBundle,
  assertBrowserSafeAppPartials,
  assertBundleStarts,
  checkBrowserBundle,
};

if (require.main === module) {
  try {
    checkBrowserBundle();
    console.log("Browser bundle check passed.");
  } catch (error) {
    console.error(error.message || error);
    process.exitCode = 1;
  }
}
