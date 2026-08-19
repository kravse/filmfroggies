/* --- Collection backup import --- */

let collectionImportRows = null;

function syncCollectionImportFileLabel() {
  if (!collectionImportFileName) {
    return;
  }
  const file = collectionImportFile?.files?.[0];
  collectionImportFileName.textContent = file ? file.name : "Choose CSV…";
  collectionImportFileName.classList.toggle("is-empty", !file);
  if (collectionImportRead) {
    collectionImportRead.disabled = !file;
  }
}

function collectionExportMovieCount() {
  const rows = appListCsv.listCsvRows(userState, () => ({ title: "", releaseDate: "" }));
  return new Set(rows.map((row) => row.id)).size;
}

function refreshCollectionTransferStatus() {
  const movieCount = collectionExportMovieCount();
  setStatus(
    exportCsvStatus,
    movieCount
      ? `${movieCount} movie${movieCount === 1 ? "" : "s"} ready to export.`
      : "Nothing to export yet.",
    movieCount ? "ok" : null,
  );
  if (exportCsvBtn) {
    exportCsvBtn.disabled = !movieCount;
  }
  setStatus(collectionImportStatus, "");
  syncCollectionImportFileLabel();
}

function formatCollectionImportSummary(summary) {
  const parts = [
    `${summary.movies} movie${summary.movies === 1 ? "" : "s"}`,
    `${summary.rows} row${summary.rows === 1 ? "" : "s"}`,
    `${summary.watched} watched`,
    `${summary.watchlist} watchlist`,
  ];
  if (summary.customRows) {
    parts.push(`${summary.customRows} custom list row${summary.customRows === 1 ? "" : "s"}`);
  }
  if (summary.ratings) {
    parts.push(`${summary.ratings} rating${summary.ratings === 1 ? "" : "s"}`);
  }
  if (summary.viewings) {
    parts.push(`${summary.viewings} viewing date${summary.viewings === 1 ? "" : "s"}`);
  }
  return parts.join(", ");
}

function openCollectionImportConfirm(summary) {
  collectionImportMessage.textContent =
    `Replace your lists, ratings, and viewing history with this backup (${formatCollectionImportSummary(summary)})? Movies not in the file will be removed. Custom lists in the file are restored; others are cleared.`;
  collectionImportDialog.hidden = false;
  collectionImportCancel.focus({ preventScroll: true });
}

function closeCollectionImportConfirm() {
  collectionImportDialog.hidden = true;
  settingsBtn.focus({ preventScroll: true });
}

async function onReviewCollectionImport() {
  const file = collectionImportFile.files?.[0];
  if (!file) {
    setStatus(collectionImportStatus, "Choose a backup CSV first.", "error");
    return;
  }
  collectionImportRead.disabled = true;
  setStatus(collectionImportStatus, "Reading backup…", null);
  try {
    const text = await file.text();
    const rows = appListCsv.parseCollectionCsv(text);
    if (!rows.length) {
      throw new Error("That file does not contain any collection rows.");
    }
    collectionImportRows = rows;
    openCollectionImportConfirm(appListCsv.summarizeCollectionImport(rows));
    setStatus(collectionImportStatus, "Review the import confirmation.", null);
  } catch (error) {
    collectionImportRows = null;
    setStatus(collectionImportStatus, error.message || "Could not read that backup.", "error");
  } finally {
    collectionImportRead.disabled = false;
  }
}

function onConfirmCollectionImport() {
  if (!collectionImportRows?.length) {
    closeCollectionImportConfirm();
    return;
  }
  collectionImportOk.disabled = true;
  try {
    const before = userState;
    const result = appListCsv.applyCollectionImport(before, collectionImportRows, {
      mode: "replace",
    });
    backupUserState(before);
    userState = result.state;
    persistUserState();
    refreshViewModeForActiveList();
    render();
    hydrateActiveList();
    collectionImportRows = null;
    collectionImportFile.value = "";
    syncCollectionImportFileLabel();
    closeCollectionImportConfirm();
    refreshCollectionTransferStatus();
    setStatus(
      collectionImportStatus,
      `Imported backup: ${formatCollectionImportSummary(result.summary)}.`,
      "ok",
    );
  } catch (error) {
    setStatus(collectionImportStatus, error.message || "The import could not be saved.", "error");
  } finally {
    collectionImportOk.disabled = false;
  }
}
