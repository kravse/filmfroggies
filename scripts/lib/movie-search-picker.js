/** Shared debounced, abortable search state for movie picker UIs. */

function createMovieSearchPicker(options = {}) {
  if (typeof options.search !== "function") {
    throw new Error("Movie search picker requires a search function.");
  }
  const debounceMs = Number.isFinite(options.debounceMs) ? options.debounceMs : 300;
  let timer = null;
  let controller = null;
  let requestToken = 0;
  let results = [];

  function cancel() {
    if (timer) clearTimeout(timer);
    timer = null;
    requestToken += 1;
    controller?.abort();
    controller = null;
    options.onBusy?.(false);
  }

  function clear() {
    cancel();
    results = [];
    options.onClear?.();
  }

  async function run(query, searchOptions = {}) {
    cancel();
    const token = ++requestToken;
    controller = new AbortController();
    options.onBusy?.(true);
    try {
      const next = await options.search(query, { ...searchOptions, signal: controller.signal });
      if (token !== requestToken) return [];
      results = Array.isArray(next) ? next : [];
      options.onResults?.(results, query, searchOptions);
      return results;
    } catch (error) {
      if (error?.name !== "AbortError" && token === requestToken) {
        options.onError?.(error, query, searchOptions);
      }
      return [];
    } finally {
      if (token === requestToken) {
        controller = null;
        options.onBusy?.(false);
      }
    }
  }

  function schedule(query, searchOptions = {}) {
    cancel();
    timer = setTimeout(() => {
      timer = null;
      run(query, searchOptions);
    }, debounceMs);
  }

  function select(index) {
    const result = results[Number(index)] || null;
    if (result) options.onSelect?.(result, Number(index));
    return result;
  }

  return { run, schedule, cancel, clear, select, getResults: () => [...results] };
}

function movieSearchPosterHtml(result, options = {}) {
  const escapeHtml = options.escapeHtml || String;
  const url = options.posterUrl?.(result) || "";
  return url
    ? `<img class="search-suggest-poster" data-poster-src="${escapeHtml(url)}" alt="" loading="lazy">`
    : `<span class="search-suggest-poster search-suggest-poster--empty"></span>`;
}

function movieSearchResultsHtml(results, options = {}) {
  const escapeHtml = options.escapeHtml || String;
  return (Array.isArray(results) ? results : []).map((result, index) => {
    const active = index === options.activeIndex ? " active" : "";
    const dataName = options.dataName || "suggest-index";
    const dataValue = options.dataValue?.(result, index) ?? index;
    const meta = options.meta?.(result) || "";
    const badge = options.badge?.(result) || "";
    return `<li class="search-suggest-item${active}" role="option" data-${dataName}="${escapeHtml(dataValue)}" aria-selected="${index === options.activeIndex}">
  ${movieSearchPosterHtml(result, options)}
  <span class="search-suggest-text">
    <span class="search-suggest-title">${escapeHtml(result.title)}</span>
    <span class="search-suggest-meta">${escapeHtml(meta)}</span>
  </span>
  ${badge}
</li>`;
  }).join("");
}

module.exports = { createMovieSearchPicker, movieSearchPosterHtml, movieSearchResultsHtml };
