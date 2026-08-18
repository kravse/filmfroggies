/**
 * Detail overlay, settings, and about dialogs.
 *
 * The overlay is the only routed surface: it deep-links as `#movie/{id}` and
 * is driven by history state, so back and forward behave as expected.
 */

const TMDB_MOVIE_URL = "https://www.themoviedb.org/movie/";

/* --- Detail overlay --- */

function detailMetaChips(record) {
  const chips = [];
  const year = appCardHtml.formatYear(record.releaseDate);
  const runtime = appCardHtml.formatRuntime(record.runtime);
  const rating = appCardHtml.formatRating(record.voteAverage);

  if (year) {
    chips.push(`<span class="meta-chip">${year}</span>`);
  }
  if (runtime) {
    chips.push(`<span class="meta-chip">${runtime}</span>`);
  }
  if (rating) {
    chips.push(`<span class="meta-chip">★ ${rating}</span>`);
  }
  for (const genre of record.genres) {
    chips.push(`<span class="meta-chip">${appCardHtml.escapeHtml(genre)}</span>`);
  }
  return chips.join("");
}

function detailCreditsHtml(record) {
  const rows = [];
  const directors = appCardHtml.joinNames(record.directors);
  const cast = appCardHtml.joinNames(record.cast);

  if (directors) {
    rows.push(
      `<div><strong>${record.directors.length > 1 ? "Directors" : "Director"}:</strong> ${appCardHtml.escapeHtml(directors)}</div>`,
    );
  }
  if (cast) {
    rows.push(`<div><strong>Cast:</strong> ${appCardHtml.escapeHtml(cast)}</div>`);
  }
  return rows.join("");
}

function detailUserRatingBlockHtml(movieId) {
  const inCollection = appLists.findListIdsForMovie(userState.lists, movieId).length > 0;
  if (!inCollection) {
    return "";
  }

  const rating = appRatings.getRating(userState.ratings, movieId);
  const valueText = rating == null ? "—" : appRatings.formatUserRating(rating);
  const sliderValue = appRatings.sliderValueFromRating(rating);
  const editorOpen = detailRatingEditorOpen;
  const editorValueClass =
    rating == null ? "detail-rating-editor-value is-empty" : "detail-rating-editor-value";

  return `<div class="detail-rating-block${editorOpen ? " is-editing" : ""}" id="detail-rating-block">
  <div class="detail-rating-row"${editorOpen ? " hidden" : ""} id="detail-rating-summary-row">
    <span class="detail-rating-label">My Rating:</span>
    <button
      type="button"
      class="detail-rating-chip meta-chip${rating == null ? "" : " is-rated"}"
      id="detail-rating-summary"
      aria-expanded="${editorOpen}"
      aria-controls="detail-rating-editor"
      title="Edit my rating"
    >★ <span id="detail-rating-summary-value">${appCardHtml.escapeHtml(valueText)}</span></button>
  </div>
  <div class="detail-rating-editor" id="detail-rating-editor"${editorOpen ? "" : " hidden"}>
    <div class="detail-rating-editor-head">
      <span class="detail-rating-editor-title">My rating</span>
      <span class="${editorValueClass}" id="detail-rating-editor-value">${appCardHtml.escapeHtml(valueText)}</span>
    </div>
    <div class="detail-rating-slider-wrap">
      <span class="detail-rating-scale" aria-hidden="true">1</span>
      <div class="rating-control">
        <input
          type="range"
          class="detail-rating-slider rating-control-slider"
          id="detail-rating-slider"
          min="0"
          max="90"
          step="1"
          value="${sliderValue}"
          aria-label="My rating from 1 to 10"
          aria-valuetext="${rating == null ? "Not rated" : appRatings.formatUserRating(rating)}"
        />
        <select
          class="detail-rating-select rating-control-select"
          id="detail-rating-select"
          aria-label="My rating from 1 to 10"
        >${appRatings.ratingSelectInnerHtml(rating)}</select>
      </div>
      <span class="detail-rating-scale" aria-hidden="true">10</span>
    </div>
    <div class="detail-rating-editor-actions">
      <button type="button" class="detail-rating-btn detail-rating-btn--clear" id="detail-rating-clear"${rating == null ? " hidden" : ""}>Clear rating</button>
      <div class="detail-rating-editor-actions-main">
        <button type="button" class="detail-rating-btn detail-rating-btn--ghost" id="detail-rating-cancel">Cancel</button>
        <button type="button" class="detail-rating-btn detail-rating-btn--primary" id="detail-rating-done">Done</button>
      </div>
    </div>
  </div>
</div>`;
}

function syncDetailRatingDisplay(rating) {
  const chipValue = document.getElementById("detail-rating-summary-value");
  if (chipValue) {
    chipValue.textContent = rating == null ? "—" : appRatings.formatUserRating(rating);
  }

  const editorValue = document.getElementById("detail-rating-editor-value");
  if (editorValue) {
    editorValue.textContent = rating == null ? "—" : appRatings.formatUserRating(rating);
    editorValue.classList.toggle("is-empty", rating == null);
  }

  const slider = document.getElementById("detail-rating-slider");
  if (slider) {
    slider.value = String(
      rating == null
        ? appRatings.DEFAULT_SLIDER_VALUE
        : appRatings.sliderValueFromRating(rating),
    );
    slider.setAttribute(
      "aria-valuetext",
      rating == null ? "Not rated" : appRatings.formatUserRating(rating),
    );
  }

  const select = document.getElementById("detail-rating-select");
  if (select) {
    select.value = appRatings.ratingSelectDisplayValue(rating);
  }

  const clearBtn = document.getElementById("detail-rating-clear");
  if (clearBtn) {
    clearBtn.hidden = rating == null;
  }

  const summary = document.getElementById("detail-rating-summary");
  if (summary) {
    summary.classList.toggle("is-rated", rating != null);
  }
}

function syncDetailRatingEditorVisibility() {
  const block = document.getElementById("detail-rating-block");
  const summaryRow = document.getElementById("detail-rating-summary-row");
  const summary = document.getElementById("detail-rating-summary");
  const editor = document.getElementById("detail-rating-editor");
  if (!summary || !editor) {
    return;
  }
  block?.classList.toggle("is-editing", detailRatingEditorOpen);
  if (summaryRow) {
    summaryRow.hidden = detailRatingEditorOpen;
  }
  summary.setAttribute("aria-expanded", String(detailRatingEditorOpen));
  editor.hidden = !detailRatingEditorOpen;
}

function openDetailRatingEditor() {
  if (detailMovieId == null) {
    return;
  }
  detailRatingEditorSnapshot = appRatings.getRating(userState.ratings, detailMovieId);
  detailRatingEditorOpen = true;
  syncDetailRatingEditorVisibility();
  focusDetailRatingControl();
}

function focusDetailRatingControl() {
  const mobile = window.matchMedia("(max-width: 640px)").matches;
  const select = document.getElementById("detail-rating-select");
  const slider = document.getElementById("detail-rating-slider");
  (mobile ? select : slider)?.focus({ preventScroll: true });
}

function closeDetailRatingEditor() {
  commitDetailRating();
  detailRatingEditorOpen = false;
  detailRatingEditorSnapshot = null;
  syncDetailRatingEditorVisibility();
}

function cancelDetailRatingEditor() {
  if (detailMovieId == null) {
    return;
  }
  const snapshot = detailRatingEditorSnapshot;
  const current = appRatings.getRating(userState.ratings, detailMovieId);
  if (snapshot !== current) {
    const nextRatings =
      snapshot == null
        ? appRatings.removeRating(userState.ratings, detailMovieId)
        : appRatings.setRating(userState.ratings, detailMovieId, snapshot);
    updateRatings(nextRatings);
    persistUserState();
    applyHydratedRecord(detailMovieId, { skipDetail: true });
  }
  syncDetailRatingDisplay(snapshot);
  detailRatingEditorOpen = false;
  detailRatingEditorSnapshot = null;
  syncDetailRatingEditorVisibility();
}

function toggleDetailRatingEditor() {
  if (detailRatingEditorOpen) {
    closeDetailRatingEditor();
    return;
  }
  openDetailRatingEditor();
}

function commitDetailRating() {
  if (detailMovieId == null) {
    return;
  }
  persistUserState();
  applyHydratedRecord(detailMovieId, { skipDetail: true });
}

function onDetailRatingSliderInput(event) {
  if (detailMovieId == null) {
    return;
  }
  const rating = appRatings.ratingFromSliderValue(Number(event.target.value));
  if (!updateRatings(appRatings.setRating(userState.ratings, detailMovieId, rating))) {
    return;
  }
  syncDetailRatingDisplay(rating);
}

function onDetailRatingSelectChange(event) {
  if (detailMovieId == null) {
    return;
  }
  const rating = appRatings.normalizeRating(event.target.value);
  if (!updateRatings(appRatings.setRating(userState.ratings, detailMovieId, rating))) {
    return;
  }
  syncDetailRatingDisplay(rating);
}

function clearDetailRating() {
  if (detailMovieId == null) {
    return;
  }
  if (!updateRatings(appRatings.removeRating(userState.ratings, detailMovieId))) {
    return;
  }
  persistUserState();
  applyHydratedRecord(detailMovieId, { skipDetail: true });
  syncDetailRatingDisplay(null);
}

function renderDetail() {
  if (detailMovieId == null) {
    return;
  }

  const ids = activeMovieIds();
  const index = ids.indexOf(detailMovieId);
  const record = movieById.get(detailMovieId);

  detailEyebrow.textContent =
    index >= 0 ? `${index + 1} of ${ids.length}` : "Not in this list";
  detailPrevBtn.disabled = index <= 0;
  detailNextBtn.disabled = index < 0 || index >= ids.length - 1;

  if (!record) {
    let heading = "Loading…";
    let note = "";
    if (!hasTmdbAccess()) {
      heading = "No TMDB credential";
      note = "Open Settings and paste your TMDB credential to load this movie.";
    } else if (movieErrors.has(detailMovieId)) {
      heading = "Could not load this movie";
      note = "TMDB did not return details. Check your credential and connection.";
    }
    detailPoster.innerHTML = `<div class="placeholder"></div>`;
    detailBody.innerHTML = `<h2 class="movie-detail-title" id="movie-detail-title">${heading}</h2>
<p class="movie-detail-overview">${note}</p>`;
  } else {
    detailPoster.innerHTML = posterHtml(record, appTmdb.POSTER_SIZES.detail);
    bindPosterImages(detailPoster);
    detailBody.innerHTML = `<h2 class="movie-detail-title" id="movie-detail-title">${appCardHtml.escapeHtml(record.title)}</h2>
${record.tagline ? `<p class="movie-detail-tagline">${appCardHtml.escapeHtml(record.tagline)}</p>` : ""}
<div class="movie-detail-meta">${detailMetaChips(record)}</div>
${detailUserRatingBlockHtml(detailMovieId)}
<p class="movie-detail-overview">${appCardHtml.escapeHtml(record.overview || "No overview available.")}</p>
<div class="movie-detail-credits">${detailCreditsHtml(record)}</div>`;
  }

  const inCollection = appLists.findListIdsForMovie(userState.lists, detailMovieId).length > 0;
  const onWatchlist = appLists.isOnWatchlist(userState.lists, detailMovieId);

  const leftActions = [];
  if (inCollection && onWatchlist) {
    leftActions.push(
      `<button type="button" class="detail-watch-btn" id="detail-watch">Mark as watched</button>`,
    );
  }

  const removeBtn = inCollection
    ? `<button type="button" class="detail-remove-btn" id="detail-remove">Remove movie</button>`
    : "";

  detailActions.innerHTML = `<div class="detail-actions-left">${leftActions.join("")}</div>
<div class="detail-actions-right">${removeBtn}
<a class="detail-link" href="${TMDB_MOVIE_URL}${detailMovieId}" target="_blank" rel="noopener noreferrer">View on TMDB</a></div>`;
}

function openDetail(movieId, options = {}) {
  const id = Number(movieId);
  if (!Number.isInteger(id) || id <= 0) {
    return;
  }

  detailMovieId = id;
  detailRatingEditorOpen = false;
  detailRatingEditorSnapshot = null;
  detailDialog.hidden = false;
  document.body.classList.add("movie-detail-open");
  renderDetail();
  detailCloseBtn.focus({ preventScroll: true });

  if (options.pushHistory !== false) {
    history.pushState({ detailMovieId: id }, "", `#movie/${id}`);
  }

  if (!movieById.has(id)) {
    hydrateMovies([id], {
      onRecord: applyHydratedRecord,
      onUpdate: applyHydratedRecord,
    });
  }
}

function closeDetail(options = {}) {
  if (detailMovieId == null) {
    return;
  }
  commitDetailRating();
  const hadHistoryEntry = history.state?.detailMovieId != null;
  detailMovieId = null;
  detailRatingEditorOpen = false;
  detailRatingEditorSnapshot = null;
  detailDialog.hidden = true;
  document.body.classList.remove("movie-detail-open");

  if (options.popHistory !== false && hadHistoryEntry) {
    history.back();
  }
}

function stepDetail(delta) {
  const ids = activeMovieIds();
  const index = ids.indexOf(detailMovieId);
  const nextIndex = index + delta;
  if (index < 0 || nextIndex < 0 || nextIndex >= ids.length) {
    return;
  }
  commitDetailRating();
  detailMovieId = ids[nextIndex];
  detailRatingEditorOpen = false;
  detailRatingEditorSnapshot = null;
  history.replaceState({ detailMovieId }, "", `#movie/${detailMovieId}`);
  renderDetail();
  if (!movieById.has(detailMovieId)) {
    hydrateMovies([detailMovieId], {
      onRecord: applyHydratedRecord,
      onUpdate: applyHydratedRecord,
    });
  }
}

function movieIdFromHash() {
  const match = /^#movie\/(\d+)$/.exec(window.location.hash || "");
  return match ? Number(match[1]) : null;
}

/** Single source of truth for the overlay on load, back, and forward. */
function syncDetailFromLocation() {
  const id = movieIdFromHash();
  if (id == null) {
    closeDetail({ popHistory: false });
    return;
  }
  if (id !== detailMovieId) {
    openDetail(id, { pushHistory: false });
  }
}

/* --- Settings --- */

function refreshSettings() {
  tmdbKeyInput.value = "";
  setStatus(
    tmdbKeyStatus,
    hasCredential() ? "Read access token saved." : "No token saved.",
    hasCredential() ? "ok" : null,
  );

  const usingGist = userState.storageMode === "gist";
  storageModeLocal.checked = !usingGist;
  storageModeGist.checked = usingGist;
  gistFields.hidden = !usingGist;
  gistTokenInput.value = "";
  setStatus(
    gistStatus,
    appGistSync.isConnectedGistConfig(gistConfig)
      ? `Connected to Gist ${gistConfig.gistId.slice(0, 8)}…`
      : "Not connected.",
    appGistSync.isConnectedGistConfig(gistConfig) ? "ok" : null,
  );
  setStatus(cacheStatus, "");
}

function openSettings() {
  refreshSettings();
  settingsDialog.hidden = false;
  settingsBtn.setAttribute("aria-expanded", "true");
  tmdbKeyInput.focus({ preventScroll: true });
}

function closeSettings() {
  settingsDialog.hidden = true;
  settingsBtn.setAttribute("aria-expanded", "false");
}

async function onSaveCredential() {
  const value = tmdbKeyInput.value.trim();

  // Reject the wrong credential shape before storing it, so a mistyped or v3
  // value never becomes the reason every later request fails.
  const problem = appTmdb.describeCredentialProblem(value);
  if (problem) {
    setStatus(tmdbKeyStatus, problem, "error");
    return;
  }

  saveCredential(value);
  refreshSettings();
  render();
  setStatus(tmdbKeyStatus, "Checking with TMDB…", null);
  tmdbKeySave.disabled = true;

  try {
    await verifyCredential();
    refreshSettings();
    hydrateActiveList();
  } catch (error) {
    // The credential stays saved so it can be corrected rather than retyped.
    setStatus(tmdbKeyStatus, `Saved, but TMDB rejected it. ${error.message}`, "error");
  } finally {
    tmdbKeySave.disabled = false;
  }
}

function onClearCredential() {
  saveCredential("");
  movieById.clear();
  movieErrors.clear();
  refreshSettings();
  render();
}

async function onClearCache() {
  const cleared = await clearMovieCache();
  movieById.clear();
  movieErrors.clear();
  setStatus(
    cacheStatus,
    cleared ? "Cache cleared. Reloading movie data…" : "Nothing cached.",
    "ok",
  );
  render();
  hydrateActiveList();
}

function onStorageModeChange(mode) {
  if (mode === "gist") {
    userState = { ...userState, storageMode: "gist" };
    gistFields.hidden = false;
    persistUserState({ sync: false });
    refreshSettings();
    return;
  }
  disconnectGist();
  gistFields.hidden = true;
  refreshSettings();
}

async function onConnectGist() {
  const token = gistTokenInput.value.trim();
  setStatus(gistStatus, "Connecting to GitHub…", null);
  gistConnectBtn.disabled = true;
  try {
    const result = await connectGist(token);
    if (!result.ok) {
      setStatus(gistStatus, result.error, "error");
      return;
    }
    setStatus(
      gistStatus,
      result.action === "adopt"
        ? "Connected. Loaded the lists already in your Gist."
        : "Connected. Created a new private Gist for your lists.",
      "ok",
    );
    gistTokenInput.value = "";
    setViewMode(gridViewMode);
    render();
    hydrateActiveList();
  } finally {
    gistConnectBtn.disabled = false;
  }
}

function onDisconnectGist() {
  disconnectGist();
  refreshSettings();
}

/* --- About --- */

function openAbout() {
  aboutDialog.hidden = false;
  aboutBtn.setAttribute("aria-expanded", "true");
  aboutClose.focus({ preventScroll: true });
}

function closeAbout() {
  aboutDialog.hidden = true;
  aboutBtn.setAttribute("aria-expanded", "false");
}

/* --- Hosted unlock (hidden) --- */

function openHostedUnlockDialog() {
  hostedUnlockInput.value = "";
  setStatus(hostedUnlockStatus, "");
  hostedUnlockDialog.hidden = false;
  hostedUnlockInput.focus({ preventScroll: true });
}

function closeHostedUnlockDialog() {
  hostedUnlockDialog.hidden = true;
  hostedUnlockInput.value = "";
  setStatus(hostedUnlockStatus, "");
}

async function submitHostedUnlock() {
  const password = hostedUnlockInput.value;
  setStatus(hostedUnlockStatus, "Checking…", null);
  hostedUnlockSubmit.disabled = true;
  try {
    await unlockHostedAccess(password);
    closeHostedUnlockDialog();
    render();
    hydrateActiveList();
  } catch (error) {
    setStatus(hostedUnlockStatus, error.message, "error");
  } finally {
    hostedUnlockSubmit.disabled = false;
  }
}

function openHostedLockDialog() {
  hostedLockDialog.hidden = false;
  hostedLockCancel.focus({ preventScroll: true });
}

function closeHostedLockDialog() {
  hostedLockDialog.hidden = true;
}

function confirmHostedLock() {
  lockHostedAccess();
  closeHostedLockDialog();
  render();
}
