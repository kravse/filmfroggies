/* --- Local Letterboxd tool UI (CSV export only) --- */

(function () {
  const TOKEN_KEY = "moviecollector-letterboxd-tool-token";
  const MATCH_CACHE_KEY = "moviecollector-letterboxd-tool-matches-v1";
  const MAX_ZIP_BYTES = 25 * 1024 * 1024;
  const MAX_CSV_BYTES = 10 * 1024 * 1024;
  const MAX_TOTAL_BYTES = 50 * 1024 * 1024;
  const MAX_CSV_FILES = 20;
  const MATCH_CONCURRENCY = 2;
  const MATCH_DELAY_MS = 140;
  const MATCH_RETRIES = 4;

  const tokenInput = document.getElementById("tmdb-token");
  const zipInput = document.getElementById("zip-file");
  const startBtn = document.getElementById("start-btn");
  const downloadBtn = document.getElementById("download-btn");
  const statusEl = document.getElementById("status");
  const summaryEl = document.getElementById("summary");
  const matchesEl = document.getElementById("matches");

  let parsed = null;
  let candidates = new Map();
  let selections = {};
  let lookupErrors = new Set();
  let runId = 0;
  let csvText = "";

  tokenInput.value = sessionStorage.getItem(TOKEN_KEY) || "";
  tokenInput.addEventListener("change", () => {
    sessionStorage.setItem(TOKEN_KEY, tokenInput.value.trim());
  });

  function setStatus(text, kind) {
    statusEl.textContent = text || "";
    statusEl.classList.toggle("is-error", kind === "error");
    statusEl.classList.toggle("is-ok", kind === "ok");
  }

  function readMatchCache() {
    try {
      const value = JSON.parse(sessionStorage.getItem(MATCH_CACHE_KEY) || "{}");
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch (_) {
      return {};
    }
  }

  function writeMatchCache(next) {
    sessionStorage.setItem(MATCH_CACHE_KEY, JSON.stringify(next));
  }

  function baseName(pathname) {
    return String(pathname || "").replace(/\\/g, "/").split("/").pop().toLowerCase();
  }

  async function extractZip(file) {
    if (!file || !/\.zip$/i.test(file.name)) {
      throw new Error("Choose the ZIP downloaded from Letterboxd.");
    }
    if (file.size > MAX_ZIP_BYTES) {
      throw new Error("That ZIP is larger than the 25 MB import limit.");
    }
    if (typeof fflate === "undefined") {
      throw new Error("The ZIP reader did not load. Refresh and try again.");
    }
    const supported = appLetterboxdImport.SUPPORTED_FILES;
    let selectedBytes = 0;
    let selectedFiles = 0;
    const archive = fflate.unzipSync(new Uint8Array(await file.arrayBuffer()), {
      filter(entry) {
        if (!appLetterboxdImport.isSupportedPath(entry.name)
          || !supported.has(baseName(entry.name))) {
          return false;
        }
        if (entry.originalSize > MAX_CSV_BYTES) {
          throw new Error(`${baseName(entry.name)} exceeds the 10 MB file limit.`);
        }
        selectedBytes += entry.originalSize;
        selectedFiles += 1;
        if (selectedBytes > MAX_TOTAL_BYTES || selectedFiles > MAX_CSV_FILES) {
          throw new Error("The Letterboxd export contains too much data to import safely.");
        }
        return true;
      },
    });
    const files = {};
    let total = 0;
    for (const [pathname, bytes] of Object.entries(archive)) {
      total += bytes.length;
      if (total > MAX_TOTAL_BYTES) {
        throw new Error("The extracted Letterboxd files exceed the 50 MB import limit.");
      }
      files[pathname] = fflate.strFromU8(bytes);
    }
    return files;
  }

  function token() {
    return String(tokenInput.value || "").trim();
  }

  function requireToken() {
    const value = token();
    if (!appTmdb.isReadAccessToken(value)) {
      throw new Error("Paste your TMDB API Read Access Token first.");
    }
    return value;
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function searchFilm(film) {
    const readToken = token();
    let lastError = null;
    for (let attempt = 0; attempt <= MATCH_RETRIES; attempt += 1) {
      try {
        const response = await fetch(
          appTmdb.buildSearchUrl(film.title),
          appTmdb.buildRequestInit(readToken),
        );
        if (!response.ok) {
          throw new Error(`TMDB search failed (${response.status})`);
        }
        const results = appTmdb.normalizeSearchResults(await response.json());
        await delay(MATCH_DELAY_MS);
        return results;
      } catch (error) {
        lastError = error;
        const transient = /\b429\b|\b5\d\d\b|network|failed to fetch|abort/i.test(String(error?.message || error));
        if (!transient || attempt === MATCH_RETRIES) {
          break;
        }
        await delay(600 * (2 ** attempt) + Math.floor(Math.random() * 250));
      }
    }
    throw lastError || new Error("TMDB lookup failed");
  }

  async function mapWithConcurrency(items, worker, concurrency = MATCH_CONCURRENCY) {
    let cursor = 0;
    async function run() {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        await worker(items[index], index);
      }
    }
    await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run));
  }

  function rebuildCsv() {
    const rows = appLetterboxdImport.letterboxdFilmsToImportRows(
      parsed.films.filter((film) => selections[film.sourceKey]),
      selections,
    );
    csvText = appListCsv.buildListCsv(rows);
    downloadBtn.disabled = rows.length === 0;
    return rows.length;
  }

  function renderMatches() {
    if (!parsed) {
      matchesEl.innerHTML = "";
      summaryEl.textContent = "";
      downloadBtn.disabled = true;
      return;
    }
    const matched = Object.values(selections).filter(Boolean).length;
    const rowCount = rebuildCsv();
    summaryEl.textContent = `${parsed.films.length} films · ${matched} matched · ${rowCount} CSV row${rowCount === 1 ? "" : "s"}. Import the downloaded file via Settings → Import backup on the main site.`;
    const rows = parsed.films.map((film, index) => {
      const filmCandidates = candidates.get(film.sourceKey) || [];
      const selected = Number(selections[film.sourceKey]) || 0;
      const status = selected
        ? "is-matched"
        : lookupErrors.has(film.sourceKey)
          ? "lookup-failed"
          : filmCandidates.length ? "needs-review" : "is-unmatched";
      return { film, filmCandidates, selected, status, index };
    }).sort((left, right) => {
      const rank = { "lookup-failed": 0, "is-unmatched": 1, "needs-review": 2, "is-matched": 3 };
      return rank[left.status] - rank[right.status] || left.index - right.index;
    });

    matchesEl.innerHTML = rows.map(({ film, filmCandidates, selected, status }) => {
      const menu = appLetterboxdImport.sortedTmdbCandidates(film, filmCandidates);
      const listed = menu.some((candidate) => candidate.id === selected);
      const savedOption = selected && !listed
        ? `<option value="${selected}" selected>Saved match (TMDB #${selected})</option>`
        : "";
      const options = [
        '<option value="">Skip this film</option>',
        savedOption,
        ...menu.map((candidate) => {
          const year = appLetterboxdImport.candidateReleaseYear(candidate);
          const label = appCardHtml.escapeHtml(candidate.title);
          return `<option value="${candidate.id}"${candidate.id === selected ? " selected" : ""}>${label}${year ? ` (${year})` : ""}</option>`;
        }),
      ].join("");
      const title = appCardHtml.escapeHtml(film.title);
      const state = status === "is-matched"
        ? "Matched"
        : status === "needs-review"
          ? "Choose a TMDB match"
          : status === "lookup-failed" ? "Lookup failed" : "No TMDB results";
      return `<label class="match-row ${status}"><span class="match-title"><strong>${title}${film.year ? ` (${film.year})` : ""}</strong><span class="match-state">${state}</span></span><select data-source-key="${appCardHtml.escapeHtml(film.sourceKey)}" aria-label="TMDB match for ${title}">${options}</select></label>`;
    }).join("");
  }

  async function onStart() {
    const file = zipInput.files?.[0];
    if (!file) {
      setStatus("Choose a Letterboxd export ZIP first.", "error");
      return;
    }
    try {
      requireToken();
    } catch (error) {
      setStatus(error.message, "error");
      tokenInput.focus();
      return;
    }

    sessionStorage.setItem(TOKEN_KEY, token());
    const activeRun = ++runId;
    startBtn.disabled = true;
    downloadBtn.disabled = true;
    csvText = "";
    setStatus("Reading export and matching with TMDB…", null);
    try {
      const files = await extractZip(file);
      parsed = appLetterboxdImport.parseLetterboxdFiles(files);
      candidates = new Map();
      selections = {};
      lookupErrors = new Set();
      const cache = readMatchCache();
      let finished = 0;
      await mapWithConcurrency(parsed.films, async (film) => {
        if (activeRun !== runId) return;
        if (cache[film.sourceKey]) {
          selections[film.sourceKey] = cache[film.sourceKey];
        } else {
          try {
            const results = await searchFilm(film);
            candidates.set(film.sourceKey, results.slice(0, 10));
            const picked = appLetterboxdImport.pickTmdbMatch(film, results);
            if (picked) selections[film.sourceKey] = picked;
          } catch (_) {
            candidates.set(film.sourceKey, []);
            lookupErrors.add(film.sourceKey);
          }
        }
        if (activeRun !== runId) return;
        finished += 1;
        summaryEl.textContent = `Matching films with TMDB… ${finished}/${parsed.films.length}`;
      });
      if (activeRun !== runId) return;
      writeMatchCache({ ...readMatchCache(), ...selections });
      renderMatches();
      setStatus("Review matches, then download the backup CSV.", "ok");
    } catch (error) {
      if (activeRun !== runId) return;
      parsed = null;
      renderMatches();
      setStatus(error.message || "Could not read that export.", "error");
    } finally {
      startBtn.disabled = false;
    }
  }

  function onMatchChange(event) {
    const select = event.target.closest("[data-source-key]");
    if (!select) return;
    const id = Number(select.value);
    if (Number.isInteger(id) && id > 0) {
      selections[select.dataset.sourceKey] = id;
    } else {
      delete selections[select.dataset.sourceKey];
    }
    writeMatchCache({ ...readMatchCache(), ...selections });
    renderMatches();
  }

  function onDownload() {
    if (!csvText) return;
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = appListCsv.CSV_FILENAME;
    link.click();
    URL.revokeObjectURL(url);
    setStatus(`Downloaded ${appListCsv.CSV_FILENAME}. Import it on the main site under Settings → Import backup.`, "ok");
  }

  startBtn.addEventListener("click", onStart);
  downloadBtn.addEventListener("click", onDownload);
  matchesEl.addEventListener("change", onMatchChange);
})();
