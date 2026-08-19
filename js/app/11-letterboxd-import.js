/* --- Letterboxd import --- */

const LETTERBOXD_MATCH_CACHE_KEY = "moviecollector-letterboxd-matches-v1";
const LETTERBOXD_MAX_ZIP_BYTES = 25 * 1024 * 1024;
const LETTERBOXD_MAX_CSV_BYTES = 10 * 1024 * 1024;
const LETTERBOXD_MAX_TOTAL_BYTES = 50 * 1024 * 1024;
const LETTERBOXD_MATCH_CONCURRENCY = 4;

let letterboxdParsed = null;
let letterboxdCandidates = new Map();
let letterboxdSelections = {};

function readLetterboxdMatchCache() {
  try {
    const parsed = JSON.parse(readStorage(LETTERBOXD_MATCH_CACHE_KEY) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (_) {
    return {};
  }
}

function writeLetterboxdMatchCache(matches) {
  const clean = {};
  for (const [sourceKey, rawId] of Object.entries(matches || {})) {
    const id = Number(rawId);
    if (sourceKey.startsWith("uri:") && Number.isInteger(id) && id > 0) clean[sourceKey] = id;
  }
  writeStorage(LETTERBOXD_MATCH_CACHE_KEY, JSON.stringify(clean));
}

function letterboxdBaseName(pathname) {
  return String(pathname || "").replace(/\\/g, "/").split("/").pop().toLowerCase();
}

async function extractLetterboxdCsv(file) {
  if (!file || !/\.zip$/i.test(file.name)) throw new Error("Choose the ZIP downloaded from Letterboxd.");
  if (file.size > LETTERBOXD_MAX_ZIP_BYTES) throw new Error("That ZIP is larger than the 25 MB import limit.");
  if (typeof fflate === "undefined") throw new Error("The ZIP reader did not load. Refresh and try again.");
  const supported = appLetterboxdImport.SUPPORTED_FILES;
  const archive = fflate.unzipSync(new Uint8Array(await file.arrayBuffer()), {
    filter(entry) {
      return appLetterboxdImport.isSupportedPath(entry.name)
        && supported.has(letterboxdBaseName(entry.name))
        && entry.originalSize <= LETTERBOXD_MAX_CSV_BYTES;
    },
  });
  const files = {};
  let total = 0;
  for (const [pathname, bytes] of Object.entries(archive)) {
    total += bytes.length;
    if (total > LETTERBOXD_MAX_TOTAL_BYTES) throw new Error("The extracted Letterboxd files exceed the 50 MB import limit.");
    files[pathname] = fflate.strFromU8(bytes);
  }
  return files;
}

function normalizedImportTitle(value) {
  return String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function candidateYear(candidate) {
  return Number(String(candidate.releaseDate || "").slice(0, 4)) || null;
}

function autoPickLetterboxdCandidate(film, candidates) {
  const title = normalizedImportTitle(film.title);
  const exactTitle = candidates.filter((candidate) => normalizedImportTitle(candidate.title) === title);
  if (film.year) {
    const exact = exactTitle.filter((candidate) => candidateYear(candidate) === film.year);
    if (exact.length === 1) return exact[0].id;
    return null;
  }
  return exactTitle.length === 1 ? exactTitle[0].id : null;
}

async function mapWithConcurrency(items, worker, concurrency = LETTERBOXD_MATCH_CONCURRENCY) {
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

function renderLetterboxdPreview() {
  if (!letterboxdParsed) return;
  const matched = Object.values(letterboxdSelections).filter(Boolean).length;
  const unresolved = letterboxdParsed.films.length - matched;
  const viewings = letterboxdParsed.films.reduce((sum, film) => sum + film.viewings.length, 0);
  letterboxdSummary.textContent = `${letterboxdParsed.films.length} unique films, ${viewings} diary entries. ${matched} matched; ${unresolved} will be skipped unless matched below.`;
  const rows = letterboxdParsed.films.filter((film) => {
    const candidates = letterboxdCandidates.get(film.sourceKey) || [];
    return !letterboxdSelections[film.sourceKey] || candidates.length > 1;
  });
  letterboxdMatches.innerHTML = rows.length ? rows.map((film) => {
    const candidates = letterboxdCandidates.get(film.sourceKey) || [];
    const selected = Number(letterboxdSelections[film.sourceKey]) || 0;
    const options = ['<option value="">Skip this film</option>', ...candidates.map((candidate) => {
      const year = candidateYear(candidate);
      return `<option value="${candidate.id}"${candidate.id === selected ? " selected" : ""}>${appCardHtml.escapeHtml(candidate.title)}${year ? ` (${year})` : ""}</option>`;
    })].join("");
    return `<label class="letterboxd-match-row"><span>${appCardHtml.escapeHtml(film.title)}${film.year ? ` (${film.year})` : ""}</span><select data-letterboxd-source-key="${appCardHtml.escapeHtml(film.sourceKey)}" aria-label="TMDB match for ${appCardHtml.escapeHtml(film.title)}">${options}</select></label>`;
  }).join("") : '<p class="sheet-note">Every film has a confident match.</p>';
  letterboxdImport.disabled = matched === 0;
  letterboxdPreview.hidden = false;
}

async function onReviewLetterboxdImport() {
  const file = letterboxdFile.files?.[0];
  letterboxdRead.disabled = true;
  letterboxdPreview.hidden = true;
  setStatus(letterboxdStatus, "Reading export…", null);
  try {
    const files = await extractLetterboxdCsv(file);
    letterboxdParsed = appLetterboxdImport.parseLetterboxdFiles(files);
    letterboxdCandidates = new Map();
    letterboxdSelections = {};
    const cache = readLetterboxdMatchCache();
    let finished = 0;
    await mapWithConcurrency(letterboxdParsed.films, async (film) => {
      if (cache[film.sourceKey]) {
        letterboxdSelections[film.sourceKey] = cache[film.sourceKey];
      } else {
        try {
          const candidates = await searchMovies(film.title);
          letterboxdCandidates.set(film.sourceKey, candidates.slice(0, 10));
          const picked = autoPickLetterboxdCandidate(film, candidates);
          if (picked) letterboxdSelections[film.sourceKey] = picked;
        } catch (_) {
          letterboxdCandidates.set(film.sourceKey, []);
        }
      }
      finished += 1;
      setStatus(letterboxdStatus, `Matching films with TMDB… ${finished}/${letterboxdParsed.films.length}`, null);
    });
    const ignored = letterboxdParsed.ignoredFiles.length
      ? ` Ignored ${letterboxdParsed.ignoredFiles.length} unsupported CSV file(s).`
      : "";
    setStatus(letterboxdStatus, `Export ready for review.${ignored}`, "ok");
    renderLetterboxdPreview();
  } catch (error) {
    letterboxdParsed = null;
    setStatus(letterboxdStatus, error.message || "Could not read that export.", "error");
  } finally {
    letterboxdRead.disabled = false;
  }
}

function onLetterboxdMatchChange(event) {
  const select = event.target.closest("[data-letterboxd-source-key]");
  if (!select) return;
  const id = Number(select.value);
  if (Number.isInteger(id) && id > 0) letterboxdSelections[select.dataset.letterboxdSourceKey] = id;
  else delete letterboxdSelections[select.dataset.letterboxdSourceKey];
  renderLetterboxdPreview();
}

function onCommitLetterboxdImport() {
  if (!letterboxdParsed) return;
  letterboxdImport.disabled = true;
  try {
    const before = userState;
    const result = appLetterboxdImport.applyLetterboxdImport(
      before,
      letterboxdParsed.films,
      letterboxdSelections,
      { overwriteRatings: letterboxdOverwriteRatings.checked },
    );
    backupUserState(before);
    userState = result.state;
    persistUserState();
    writeLetterboxdMatchCache({ ...readLetterboxdMatchCache(), ...letterboxdSelections });
    refreshViewModeForActiveList();
    render();
    hydrateActiveList();
    setStatus(letterboxdStatus, `Imported ${result.summary.matched} films: ${result.summary.watched} watched, ${result.summary.watchlist} watchlist, ${result.summary.ratings} ratings, and ${result.summary.viewings} viewing dates.`, "ok");
    letterboxdPreview.hidden = true;
    letterboxdParsed = null;
  } catch (error) {
    setStatus(letterboxdStatus, error.message || "The import could not be saved.", "error");
    letterboxdImport.disabled = false;
  }
}
