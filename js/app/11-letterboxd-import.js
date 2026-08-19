/* --- Letterboxd import --- */

const LETTERBOXD_MATCH_CACHE_KEY = "moviecollector-letterboxd-matches-v1";
const LETTERBOXD_MAX_ZIP_BYTES = 25 * 1024 * 1024;
const LETTERBOXD_MAX_CSV_BYTES = 10 * 1024 * 1024;
const LETTERBOXD_MAX_TOTAL_BYTES = 50 * 1024 * 1024;
const LETTERBOXD_MATCH_CONCURRENCY = 4;

let letterboxdParsed = null;
let letterboxdCandidates = new Map();
let letterboxdSelections = {};

function openLetterboxdReview() {
  closeSettings();
  letterboxdReviewDialog.hidden = false;
  letterboxdSummary.textContent = "Preparing import…";
  letterboxdMatches.innerHTML = "";
  letterboxdImport.disabled = true;
  letterboxdReviewClose.focus({ preventScroll: true });
}

function closeLetterboxdReview() {
  letterboxdReviewDialog.hidden = true;
  settingsBtn.focus({ preventScroll: true });
}

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

function candidateYear(candidate) {
  return appLetterboxdImport.candidateReleaseYear(candidate);
}

function sortedLetterboxdCandidates(film, candidates) {
  return candidates.map((candidate, index) => ({ candidate, index })).sort((left, right) => {
    const yearRank = (candidate) => {
      const year = candidateYear(candidate);
      if (!film.year || year == null) return 2;
      if (year === film.year) return 0;
      if (Math.abs(year - film.year) === 1) return 1;
      return 2;
    };
    return yearRank(left.candidate) - yearRank(right.candidate) || left.index - right.index;
  }).map((entry) => entry.candidate);
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
  const rows = letterboxdParsed.films.map((film, index) => {
    const candidates = letterboxdCandidates.get(film.sourceKey) || [];
    const selected = Number(letterboxdSelections[film.sourceKey]) || 0;
    const status = selected ? "is-matched" : candidates.length ? "needs-review" : "is-unmatched";
    return { film, candidates, selected, status, index };
  }).sort((left, right) => {
    const rank = { "is-unmatched": 0, "needs-review": 1, "is-matched": 2 };
    return rank[left.status] - rank[right.status] || left.index - right.index;
  });
  letterboxdMatches.innerHTML = rows.length ? rows.map(({ film, candidates, selected, status }) => {
    candidates = sortedLetterboxdCandidates(film, candidates);
    const selectedIsListed = candidates.some((candidate) => candidate.id === selected);
    const savedOption = selected && !selectedIsListed
      ? [`<option value="${selected}" selected>Saved match (TMDB #${selected})</option>`]
      : [];
    const options = ['<option value="">Skip this film</option>', ...savedOption, ...candidates.map((candidate) => {
      const year = candidateYear(candidate);
      return `<option value="${candidate.id}"${candidate.id === selected ? " selected" : ""}>${appCardHtml.escapeHtml(candidate.title)}${year ? ` (${year})` : ""}</option>`;
    })].join("");
    const stateLabel = status === "is-matched"
      ? "Matched"
      : status === "needs-review" ? "Choose a TMDB match" : "No TMDB results";
    return `<label class="letterboxd-match-row ${status}"><span class="letterboxd-match-title"><strong>${appCardHtml.escapeHtml(film.title)}${film.year ? ` (${film.year})` : ""}</strong><span class="letterboxd-match-state">${stateLabel}</span></span><select data-letterboxd-source-key="${appCardHtml.escapeHtml(film.sourceKey)}" aria-label="TMDB match for ${appCardHtml.escapeHtml(film.title)}">${options}</select></label>`;
  }).join("") : '<p class="sheet-note">No films were found in this export.</p>';
  letterboxdImport.disabled = matched === 0;
}

async function onReviewLetterboxdImport() {
  const file = letterboxdFile.files?.[0];
  if (!file) {
    setStatus(letterboxdStatus, "Choose a Letterboxd export ZIP first.", "error");
    return;
  }
  letterboxdRead.disabled = true;
  openLetterboxdReview();
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
          const picked = appLetterboxdImport.pickTmdbMatch(film, candidates);
          if (picked) letterboxdSelections[film.sourceKey] = picked;
        } catch (_) {
          letterboxdCandidates.set(film.sourceKey, []);
        }
      }
      finished += 1;
      letterboxdSummary.textContent = `Matching films with TMDB… ${finished}/${letterboxdParsed.films.length}`;
    });
    const ignored = letterboxdParsed.ignoredFiles.length
      ? ` Ignored ${letterboxdParsed.ignoredFiles.length} unsupported CSV file(s).`
      : "";
    setStatus(letterboxdStatus, `Export ready for review.${ignored}`, "ok");
    renderLetterboxdPreview();
  } catch (error) {
    letterboxdParsed = null;
    setStatus(letterboxdStatus, error.message || "Could not read that export.", "error");
    letterboxdSummary.textContent = error.message || "Could not read that export.";
    letterboxdMatches.innerHTML = '<p class="sheet-note">Close this review and choose another export.</p>';
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
    letterboxdParsed = null;
    closeLetterboxdReview();
  } catch (error) {
    setStatus(letterboxdStatus, error.message || "The import could not be saved.", "error");
    letterboxdImport.disabled = false;
  }
}
