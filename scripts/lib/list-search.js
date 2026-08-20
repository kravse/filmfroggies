function normalizeLabelKey(label) {
  return String(label || "")
    .trim()
    .toLowerCase();
}

function normalizePersonKey(name) {
  return normalizeLabelKey(name);
}

function emptyFieldTerms() {
  return { genre: [], actor: [], director: [], year: [] };
}

function emptySearchFilter() {
  return { fieldTerms: emptyFieldTerms(), textTerms: [] };
}

function formatFieldSearchQuery(prefix, label) {
  const text = String(label || "").trim();
  if (!text) {
    return "";
  }
  if (/\s/.test(text)) {
    return `${prefix}:"${text.replace(/"/g, "")}"`;
  }
  return `${prefix}:${text}`;
}

function buildFieldTokenRegex(prefix) {
  return new RegExp(`${prefix}:\\s*(?:"([^"]*)"|(\\S+))`, "gi");
}

function parseYearTrailingToken(input) {
  const text = String(input || "").trim();
  const digitMatch = text.match(/(?:^|\s)(\d{1,4}s?)$/i);
  if (!digitMatch) {
    return null;
  }
  return {
    partial: digitMatch[1],
    prefix: text.slice(0, digitMatch.index).trim(),
  };
}

function isYearFilterDraftPartial(partial) {
  const token = String(partial || "").trim();
  if (!token) {
    return false;
  }
  if (/^\d{4}$/.test(token)) {
    return false;
  }
  if (/^\d{4}s$/i.test(token)) {
    return false;
  }
  return /^\d{1,3}s?$/i.test(token);
}

function parseYearDraftInput(input) {
  const text = String(input || "").trim();
  if (!text) {
    return null;
  }

  const prefixEsc = "year".replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const colonMatch = text.match(
    new RegExp(`(?:^|\\s)${prefixEsc}:\\s*(?:"([^"]*)"?|(\\S*))$`, "i"),
  );
  if (colonMatch) {
    const partial = String(colonMatch[1] ?? colonMatch[2] ?? "").trim();
    if (!isYearFilterDraftPartial(partial)) {
      return null;
    }
    return {
      fieldKey: "year",
      partial,
      quoted: /"/.test(colonMatch[0]),
      prefix: text.slice(0, colonMatch.index).trim(),
    };
  }

  const token = parseYearTrailingToken(text);
  if (!token || !isYearFilterDraftPartial(token.partial)) {
    return null;
  }

  return {
    fieldKey: "year",
    partial: token.partial,
    quoted: false,
    prefix: token.prefix,
  };
}

function getYearSuggestDraft(input) {
  const filterDraft = parseYearDraftInput(input);
  if (filterDraft) {
    return filterDraft;
  }

  const text = String(input || "").trim();
  const prefixEsc = "year".replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const colonMatch = text.match(
    new RegExp(`(?:^|\\s)${prefixEsc}:\\s*(?:"([^"]*)"?|(\\S*))$`, "i"),
  );
  if (colonMatch) {
    return {
      fieldKey: "year",
      partial: String(colonMatch[1] ?? colonMatch[2] ?? "").trim(),
      quoted: /"/.test(colonMatch[0]),
      prefix: text.slice(0, colonMatch.index).trim(),
    };
  }

  const token = parseYearTrailingToken(text);
  if (!token) {
    return null;
  }

  return {
    fieldKey: "year",
    partial: token.partial,
    quoted: false,
    prefix: token.prefix,
  };
}

function parseFieldDraftInput(input, field) {
  if (field.key === "year") {
    return parseYearDraftInput(input);
  }

  const text = String(input || "").trim();
  if (!text) {
    return null;
  }

  const prefix = field.prefix;
  const prefixEsc = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const colonMatch = text.match(
    new RegExp(`(?:^|\\s)${prefixEsc}:\\s*(?:"([^"]*)"?|(\\S*))$`, "i"),
  );
  if (colonMatch) {
    return {
      fieldKey: field.key,
      partial: String(colonMatch[1] ?? colonMatch[2] ?? "").trim(),
      quoted: /"/.test(colonMatch[0]),
      prefix: text.slice(0, colonMatch.index).trim(),
    };
  }

  const shorthandMatch = text.match(
    new RegExp(
      `(?:^|\\s)${prefixEsc}(?:\\s+(?:"([^"]*)"?|(\\S*)))?$`,
      "i",
    ),
  );
  if (shorthandMatch) {
    return {
      fieldKey: field.key,
      partial: String(shorthandMatch[1] ?? shorthandMatch[2] ?? "").trim(),
      quoted: /"/.test(shorthandMatch[0]),
      prefix: text.slice(0, shorthandMatch.index).trim(),
    };
  }

  return null;
}

function getFieldByKey(key) {
  return SEARCH_FIELD_TYPES.find((field) => field.key === key) || null;
}

function decadeFromYear(year) {
  if (!Number.isFinite(year)) {
    return "";
  }
  const decade = Math.floor(year / 10) * 10;
  return `${decade}s`;
}

function movieReleaseYear(movie) {
  if (!movie) {
    return null;
  }
  const match = String(movie.releaseDate || "").match(/\d{4}/);
  return match ? parseInt(match[0], 10) : null;
}

function tokenizeSearchText(text) {
  return String(text || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function ensureSearchHaystack(movie) {
  if (!movie || movie._titleTokens) {
    return;
  }
  const year = movieReleaseYear(movie);
  const decade = year != null ? decadeFromYear(year) : "";
  movie._decadeLabel = decade;
  movie._titleTokens = tokenizeSearchText(movie.title);
}

function movieMatchesTitleTerms(movie, terms) {
  if (!terms || terms.length === 0) {
    return true;
  }
  ensureSearchHaystack(movie);
  const unused = (movie._titleTokens || []).slice();
  let usedAToken = false;
  for (const term of terms) {
    const tokens = tokenizeSearchText(term);
    if (!tokens.length) {
      continue;
    }
    usedAToken = true;
    for (const token of tokens) {
      const index = unused.findIndex((word) => word.startsWith(token));
      if (index === -1) {
        return false;
      }
      unused.splice(index, 1);
    }
  }
  return usedAToken;
}

const GENRE_FIELD = {
  key: "genre",
  prefix: "genre",
  suppressTextOnLiteralPrefix: true,
  chipAriaPrefix: "genre",
  labelKey: normalizeLabelKey,
  formatQuery(label) {
    return formatFieldSearchQuery("genre", label);
  },
  formatLabel(raw, knownValues) {
    const needle = this.labelKey(raw);
    if (!needle) {
      return null;
    }
    for (const label of knownValues || []) {
      if (this.labelKey(label) === needle) {
        return String(label).trim();
      }
    }
    return String(raw || "").trim() || null;
  },
  matchMovie(movie, term) {
    if (!term) {
      return true;
    }
    const genres = Array.isArray(movie?.genres) ? movie.genres : [];
    return genres.some((genre) => this.labelKey(genre).includes(term));
  },
  collectValues(movies) {
    const seen = new Set();
    const values = [];
    for (const movie of movies || []) {
      for (const label of Array.isArray(movie?.genres) ? movie.genres : []) {
        const key = this.labelKey(label);
        if (!key || seen.has(key)) {
          continue;
        }
        seen.add(key);
        values.push(String(label).trim());
      }
    }
    return values.sort((a, b) => this.labelKey(a).localeCompare(this.labelKey(b)));
  },
};

const ACTOR_FIELD = {
  key: "actor",
  prefix: "actor",
  suppressTextOnLiteralPrefix: false,
  chipAriaPrefix: "actor",
  labelKey: normalizePersonKey,
  formatQuery(label) {
    return formatFieldSearchQuery("actor", label);
  },
  formatLabel(raw, knownValues) {
    const needle = this.labelKey(raw);
    if (!needle) {
      return null;
    }
    for (const label of knownValues || []) {
      if (this.labelKey(label) === needle) {
        return String(label).trim();
      }
    }
    return String(raw || "").trim() || null;
  },
  matchMovie(movie, term) {
    if (!term) {
      return true;
    }
    const cast = Array.isArray(movie?.cast) ? movie.cast : [];
    return cast.some((name) => this.labelKey(name).includes(term));
  },
  collectValues(movies) {
    const seen = new Set();
    const values = [];
    for (const movie of movies || []) {
      for (const label of Array.isArray(movie?.cast) ? movie.cast : []) {
        const key = this.labelKey(label);
        if (!key || seen.has(key)) {
          continue;
        }
        seen.add(key);
        values.push(String(label).trim());
      }
    }
    return values.sort((a, b) => this.labelKey(a).localeCompare(this.labelKey(b)));
  },
};

const DIRECTOR_FIELD = {
  key: "director",
  prefix: "director",
  suppressTextOnLiteralPrefix: false,
  chipAriaPrefix: "director",
  labelKey: normalizePersonKey,
  formatQuery(label) {
    return formatFieldSearchQuery("director", label);
  },
  formatLabel(raw, knownValues) {
    const needle = this.labelKey(raw);
    if (!needle) {
      return null;
    }
    for (const label of knownValues || []) {
      if (this.labelKey(label) === needle) {
        return String(label).trim();
      }
    }
    return String(raw || "").trim() || null;
  },
  matchMovie(movie, term) {
    if (!term) {
      return true;
    }
    const directors = Array.isArray(movie?.directors) ? movie.directors : [];
    return directors.some((name) => this.labelKey(name).includes(term));
  },
  collectValues(movies) {
    const seen = new Set();
    const values = [];
    for (const movie of movies || []) {
      for (const label of Array.isArray(movie?.directors) ? movie.directors : []) {
        const key = this.labelKey(label);
        if (!key || seen.has(key)) {
          continue;
        }
        seen.add(key);
        values.push(String(label).trim());
      }
    }
    return values.sort((a, b) => this.labelKey(a).localeCompare(this.labelKey(b)));
  },
};

function yearSortKey(label) {
  const match = String(label || "")
    .trim()
    .match(/^(\d{4})/);
  return match ? parseInt(match[1], 10) : 0;
}

const YEAR_FIELD = {
  key: "year",
  prefix: "year",
  suppressTextOnLiteralPrefix: false,
  chipAriaPrefix: "year",
  labelKey: normalizeLabelKey,
  formatQuery(label) {
    return formatFieldSearchQuery("year", label);
  },
  formatLabel(raw, knownValues) {
    const needle = this.labelKey(raw);
    if (!needle) {
      return null;
    }
    for (const label of knownValues || []) {
      if (this.labelKey(label) === needle) {
        return String(label).trim();
      }
    }
    return null;
  },
  matchesSuggestion(partial, label) {
    const needle = this.labelKey(partial);
    if (!needle) {
      return true;
    }
    return this.labelKey(label).startsWith(needle);
  },
  matchMovie(movie, term) {
    if (!term) {
      return true;
    }
    ensureSearchHaystack(movie);
    return this.labelKey(movie._decadeLabel) === term;
  },
  collectValues(movies) {
    const seen = new Set();
    const values = [];
    for (const movie of movies || []) {
      ensureSearchHaystack(movie);
      const label = String(movie._decadeLabel || "").trim();
      if (!label) {
        continue;
      }
      const key = this.labelKey(label);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      values.push(label);
    }
    return values.sort((a, b) => yearSortKey(a) - yearSortKey(b));
  },
};

function decadeStartYear(label) {
  const match = String(label || "")
    .trim()
    .match(/^(\d{4})s$/i);
  return match ? parseInt(match[1], 10) : null;
}

function yearInDecade(year, decadeLabel) {
  const start = decadeStartYear(decadeLabel);
  if (start == null || !Number.isFinite(year)) {
    return false;
  }
  return year >= start && year <= start + 9;
}

function movieMatchesYearTerm(movie, term) {
  ensureSearchHaystack(movie);
  const normalizedTerm = normalizeLabelKey(term);
  if (!normalizedTerm) {
    return true;
  }
  if (YEAR_FIELD.labelKey(movie._decadeLabel) === normalizedTerm) {
    return true;
  }
  const year = movieReleaseYear(movie);
  return year != null && yearInDecade(year, term);
}

function splitYearDecadeTextTerms(textTerms) {
  const decadeTermsFromText = [];
  const yearTerms = [];
  const otherTextTerms = [];
  for (const term of textTerms || []) {
    if (/^\d{4}s$/i.test(term)) {
      decadeTermsFromText.push(normalizeLabelKey(term));
    } else if (/^\d{4}$/.test(term)) {
      yearTerms.push(parseInt(term, 10));
    } else {
      otherTextTerms.push(term);
    }
  }
  return { decadeTermsFromText, yearTerms, otherTextTerms };
}

function dedupeLowerTerms(terms) {
  const seen = new Set();
  const out = [];
  for (const term of terms) {
    const key = normalizeLabelKey(term);
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(key);
  }
  return out;
}

function buildYearDecadeCriteria(yearFieldTerms, textTerms) {
  const { decadeTermsFromText, yearTerms, otherTextTerms } =
    splitYearDecadeTextTerms(textTerms);
  const decades = dedupeLowerTerms([
    ...(yearFieldTerms || []),
    ...decadeTermsFromText,
  ]);
  const years = yearTerms.filter(
    (year) => !decades.some((decade) => yearInDecade(year, decade)),
  );
  return { decades, years, otherTextTerms };
}

function movieMatchesYearDecadeCriteria(movie, criteria) {
  const { decades, years } = criteria;
  if (decades.length === 0 && years.length === 0) {
    return true;
  }
  if (decades.some((term) => movieMatchesYearTerm(movie, term))) {
    return true;
  }
  const movieYear = movieReleaseYear(movie);
  if (movieYear != null && years.some((year) => movieYear === year)) {
    return true;
  }
  return false;
}

const SEARCH_FIELD_TYPES = [GENRE_FIELD, ACTOR_FIELD, DIRECTOR_FIELD, YEAR_FIELD];

function getActiveDraftField(draftQuery) {
  const text = String(draftQuery || "").trim();
  if (!text) {
    return null;
  }

  let active = null;
  for (const field of SEARCH_FIELD_TYPES) {
    const draft = parseFieldDraftInput(text, field);
    if (draft) {
      active = field;
    }
  }
  return active;
}

function isFieldLiteralPrefixPending(draftQuery, field) {
  if (!field.suppressTextOnLiteralPrefix) {
    return false;
  }
  const text = String(draftQuery || "").trim();
  if (!text) {
    return false;
  }
  const lower = text.toLowerCase();
  const literal = field.prefix.toLowerCase();
  if (lower.length <= literal.length && literal.startsWith(lower)) {
    return true;
  }
  return false;
}

function isSearchDraftBlockingText(draftQuery) {
  for (const field of SEARCH_FIELD_TYPES) {
    if (isFieldLiteralPrefixPending(draftQuery, field)) {
      return true;
    }
  }
  return false;
}

function parseCompoundSearchQuery(query) {
  let remainder = String(query || "");
  const fieldTerms = emptyFieldTerms();

  for (const field of SEARCH_FIELD_TYPES) {
    const tokenRe = buildFieldTokenRegex(field.prefix);
    remainder = remainder.replace(tokenRe, (_, quoted, unquoted) => {
      const term = String(quoted ?? unquoted ?? "")
        .trim()
        .toLowerCase();
      if (term) {
        fieldTerms[field.key].push(term);
      }
      return " ";
    });
  }

  const textTerms = remainder
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => term.toLowerCase());

  return { fieldTerms, textTerms };
}

function mergeFieldTermsFromChips(chips, parsedFieldTerms) {
  const fieldTerms = emptyFieldTerms();
  const seen = {
    genre: new Set(),
    actor: new Set(),
    director: new Set(),
    year: new Set(),
  };

  for (const chip of chips || []) {
    const field = getFieldByKey(chip?.type);
    if (!field) {
      continue;
    }
    const label = field.formatLabel(chip.label, [chip.label]);
    const term = field.labelKey(label);
    if (!term || seen[field.key].has(term)) {
      continue;
    }
    seen[field.key].add(term);
    fieldTerms[field.key].push(term);
  }

  for (const field of SEARCH_FIELD_TYPES) {
    for (const term of parsedFieldTerms[field.key] || []) {
      if (!seen[field.key].has(term)) {
        seen[field.key].add(term);
        fieldTerms[field.key].push(term);
      }
    }
  }

  return fieldTerms;
}

function buildSearchFilter(chips, draftQuery) {
  const trimmed = String(draftQuery || "").trim();
  const activeDraftField = getActiveDraftField(trimmed);
  let parsed;

  if (activeDraftField) {
    const draft = parseFieldDraftInput(trimmed, activeDraftField);
    parsed = draft?.prefix
      ? parseCompoundSearchQuery(draft.prefix)
      : emptySearchFilter();
  } else if (isSearchDraftBlockingText(trimmed)) {
    parsed = emptySearchFilter();
  } else {
    parsed = parseCompoundSearchQuery(trimmed);
  }

  return {
    fieldTerms: mergeFieldTermsFromChips(chips, parsed.fieldTerms),
    textTerms: parsed.textTerms,
  };
}

function resolveKnownFieldLabel(term, field, knownValues) {
  const needle = field.labelKey(term);
  if (!needle) {
    return null;
  }
  for (const label of knownValues || []) {
    if (field.labelKey(label) === needle) {
      return String(label).trim();
    }
  }
  if (field.key === "year" || field.key === "actor" || field.key === "director") {
    const matches = (knownValues || []).filter((label) => {
      if (field.matchesSuggestion) {
        return field.matchesSuggestion.call(field, needle, label);
      }
      return field.labelKey(label).includes(needle);
    });
    if (matches.length === 1) {
      return String(matches[0]).trim();
    }
  }
  return null;
}

function absorbFieldDraftInput(input, field, knownValues) {
  if (field.key === "year") {
    return null;
  }

  const draft = parseFieldDraftInput(input, field);
  if (!draft) {
    return null;
  }
  const prefix = draft.prefix || "";
  if (!draft.partial) {
    return { fieldKey: field.key, chipLabel: null, remainder: prefix };
  }
  const chipLabel = resolveKnownFieldLabel(draft.partial, field, knownValues);
  if (chipLabel) {
    return { fieldKey: field.key, chipLabel, remainder: prefix };
  }
  return {
    fieldKey: field.key,
    chipLabel: null,
    remainder: prefix
      ? `${prefix} ${field.formatQuery(draft.partial)}`
      : field.formatQuery(draft.partial),
  };
}

function filterFieldSuggestions(partial, field, knownValues, options = {}) {
  const { exclude = [], limit } = options;
  const needle = String(partial || "").trim().toLowerCase();
  const excluded = new Set((exclude || []).map((label) => field.labelKey(label)));

  const matches = (knownValues || [])
    .filter((label) => !excluded.has(field.labelKey(label)))
    .filter((label) => {
      if (!needle) {
        return true;
      }
      if (field.matchesSuggestion) {
        return field.matchesSuggestion.call(field, needle, label);
      }
      return field.labelKey(label).includes(needle);
    });

  return typeof limit === "number" ? matches.slice(0, limit) : matches;
}

function normalizeSearchFilter(filter) {
  if (!filter) {
    return emptySearchFilter();
  }
  if (filter.fieldTerms) {
    return {
      fieldTerms: {
        genre: [...(filter.fieldTerms.genre || [])],
        actor: [...(filter.fieldTerms.actor || [])],
        director: [...(filter.fieldTerms.director || [])],
        year: [...(filter.fieldTerms.year || [])],
      },
      textTerms: [...(filter.textTerms || [])],
    };
  }
  return emptySearchFilter();
}

function hasAnyFilterTerms(filter) {
  const normalized = normalizeSearchFilter(filter);
  if (normalized.textTerms.length > 0) {
    return true;
  }
  return SEARCH_FIELD_TYPES.some(
    (field) => (normalized.fieldTerms[field.key] || []).length > 0,
  );
}

function matchesCompoundSearch(movie, filter) {
  const { fieldTerms, textTerms } = normalizeSearchFilter(filter);
  const yearDecadeCriteria = buildYearDecadeCriteria(fieldTerms.year, textTerms);

  for (const field of SEARCH_FIELD_TYPES) {
    if (field.key === "year") {
      continue;
    }
    for (const term of fieldTerms[field.key] || []) {
      if (!field.matchMovie(movie, term)) {
        return false;
      }
    }
  }

  if (
    yearDecadeCriteria.decades.length > 0 ||
    yearDecadeCriteria.years.length > 0
  ) {
    if (!movieMatchesYearDecadeCriteria(movie, yearDecadeCriteria)) {
      return false;
    }
  }

  return movieMatchesTitleTerms(movie, yearDecadeCriteria.otherTextTerms);
}

function filterMoviesMatchingFieldTerms(movies, fieldTermsPartial) {
  const partial = normalizeSearchFilter({
    fieldTerms: fieldTermsPartial,
    textTerms: [],
  });
  return (movies || []).filter((movie) => matchesCompoundSearch(movie, partial));
}

function chipsToFieldTermsPartial(chips, excludeFieldKey) {
  const partial = emptyFieldTerms();
  for (const chip of chips || []) {
    if (chip.type === excludeFieldKey) {
      continue;
    }
    const field = getFieldByKey(chip.type);
    if (!field) {
      continue;
    }
    const label = field.formatLabel(chip.label, [chip.label]);
    const term = field.labelKey(label);
    if (term) {
      partial[chip.type].push(term);
    }
  }
  return partial;
}

function filterMovieIds(ids, filter, getRecord) {
  if (!hasAnyFilterTerms(filter)) {
    return ids;
  }
  return (ids || []).filter((id) => {
    const movie = getRecord(id);
    if (!movie) {
      return true;
    }
    return matchesCompoundSearch(movie, filter);
  });
}

module.exports = {
  SEARCH_FIELD_TYPES,
  normalizeLabelKey,
  emptyFieldTerms,
  emptySearchFilter,
  getFieldByKey,
  parseYearTrailingToken,
  parseYearDraftInput,
  getYearSuggestDraft,
  parseFieldDraftInput,
  getActiveDraftField,
  isFieldLiteralPrefixPending,
  isSearchDraftBlockingText,
  parseCompoundSearchQuery,
  buildSearchFilter,
  absorbFieldDraftInput,
  resolveKnownFieldLabel,
  filterFieldSuggestions,
  normalizeSearchFilter,
  hasAnyFilterTerms,
  decadeFromYear,
  movieReleaseYear,
  ensureSearchHaystack,
  tokenizeSearchText,
  movieMatchesTitleTerms,
  movieMatchesYearTerm,
  buildYearDecadeCriteria,
  movieMatchesYearDecadeCriteria,
  matchesCompoundSearch,
  filterMoviesMatchingFieldTerms,
  chipsToFieldTermsPartial,
  filterMovieIds,
  formatFieldSearchQuery,
};
