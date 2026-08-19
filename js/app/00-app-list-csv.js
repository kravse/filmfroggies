/* Generated from scripts/lib/list-csv.js — run npm run bundle */

const appListCsv = (function () {
  /**
   * The CSV that carries a list of ids from the browser to the scraper.
   *
   * The browser is the only place that knows the collection, and the scraper runs
   * on a machine that cannot read localStorage or the Gist. Settings exports this
   * file, you commit it, and `npm run scrape` reads it back. Both ends share these
   * functions so the format has exactly one definition.
   *
   * Only `tmdb_id` is load-bearing. `title` and `list` exist so the committed file
   * is readable in a diff; the scraper ignores them.
   */

  const CSV_HEADER = ["tmdb_id", "title", "list"];
  const CSV_FILENAME = "my_list.csv";

  function getLists() {
    if (typeof appLists !== "undefined") {
      return appLists;
    }
    if (typeof require === "function") {
      return require("./lists");
    }
    throw new Error("appLists is not available");
  }

  /** Quote whenever a field could otherwise change the shape of the row. */
  function csvField(value) {
    const text = String(value == null ? "" : value);
    if (!/[",\r\n]/.test(text)) {
      return text;
    }
    return `"${text.replace(/"/g, '""')}"`;
  }

  function csvRow(values) {
    return values.map(csvField).join(",");
  }

  /**
   * Watched first, then watchlist, each in stored order. Removal records live only
   * in `statuses` and never in `movieIds`, so they are excluded for free.
   */
  function listCsvRows(state, titleFor) {
    const lists = Array.isArray(state?.lists) ? state.lists : [];
    const resolveTitle = typeof titleFor === "function" ? titleFor : () => "";
    const rows = [];
    for (const listId of getLists().LIST_IDS) {
      const list = lists.find((entry) => entry && entry.id === listId);
      for (const movieId of list?.movieIds || []) {
        const id = Number(movieId);
        if (!Number.isInteger(id) || id <= 0) {
          continue;
        }
        rows.push({ id, title: String(resolveTitle(id) || ""), listId });
      }
    }
    return rows;
  }

  function buildListCsv(rows) {
    const lines = [csvRow(CSV_HEADER)];
    for (const row of rows || []) {
      lines.push(csvRow([row.id, row.title, row.listId]));
    }
    return `${lines.join("\n")}\n`;
  }

  /**
   * Reads the first column of every line as an id. The header, blank lines, and
   * anything hand-edited into an unparseable state are skipped rather than
   * refused: a typo in a comment column should not stop a scrape.
   */
  function parseListCsv(text) {
    const seen = new Set();
    const ids = [];
    for (const line of String(text || "").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }
      const field = trimmed.split(",")[0].replace(/^"|"$/g, "").trim();
      if (!/^\d+$/.test(field)) {
        continue;
      }
      const id = Number(field);
      if (!Number.isInteger(id) || id <= 0 || seen.has(id)) {
        continue;
      }
      seen.add(id);
      ids.push(id);
    }
    return ids;
  }

  return {
    CSV_HEADER,
    CSV_FILENAME,
    listCsvRows,
    buildListCsv,
    parseListCsv,
  };
})();
