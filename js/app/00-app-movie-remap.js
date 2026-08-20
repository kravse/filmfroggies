/* Generated from scripts/lib/movie-remap.js — run npm run bundle */

const appMovieRemap = (function () {
  /** Atomically move all collection metadata from one TMDB movie id to another. */

  function getLists() {
    if (typeof appLists !== "undefined") {
      return appLists;
    }
    if (typeof require === "function") {
      return require("./lists");
    }
    throw new Error("appLists is not available");
  }

  function validId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
  }

  function replaceId(ids, fromId, toId) {
    const out = [];
    for (const raw of Array.isArray(ids) ? ids : []) {
      const id = Number(raw) === fromId ? toId : Number(raw);
      if (Number.isInteger(id) && id > 0 && !out.includes(id)) out.push(id);
    }
    return out;
  }

  function moveKey(map, fromId, toId) {
    const source = map && typeof map === "object" && !Array.isArray(map) ? map : {};
    const out = { ...source };
    if (Object.prototype.hasOwnProperty.call(out, String(fromId))) {
      out[String(toId)] = out[String(fromId)];
      delete out[String(fromId)];
    }
    return out;
  }

  function remapMovieState(state, fromValue, toValue, now = new Date()) {
    const fromId = validId(fromValue);
    const toId = validId(toValue);
    if (!state || !fromId || !toId || fromId === toId) {
      throw new Error("Choose a different valid TMDB movie.");
    }
    if (!getLists().isWatched(state.lists, fromId)) {
      throw new Error("Only watched movies can be remapped.");
    }
    const alreadyPresent = (state.lists || []).some((list) => list.movieIds?.includes(toId)) ||
      (state.customLists || []).some((list) => list.movieIds?.includes(toId));
    if (alreadyPresent) {
      throw new Error("That TMDB movie is already in your collection.");
    }
    const sourceList = (state.lists || []).find((list) => list.movieIds?.includes(fromId));
    if (!sourceList && !(state.customLists || []).some((list) => list.movieIds?.includes(fromId))) {
      throw new Error("The original movie is no longer in your collection.");
    }
    const stamp = now.toISOString();
    const lists = (state.lists || []).map((list) => ({
      ...list,
      movieIds: replaceId(list.movieIds, fromId, toId),
    }));
    const customLists = (state.customLists || []).map((list) => {
      if (!list.movieIds?.includes(fromId)) return list;
      return { ...list, movieIds: replaceId(list.movieIds, fromId, toId), updatedAt: stamp };
    });
    const statuses = {
      ...(state.statuses && typeof state.statuses === "object" ? state.statuses : {}),
      [String(fromId)]: { status: "removed", updatedAt: stamp },
    };
    if (sourceList) {
      statuses[String(toId)] = { status: sourceList.id, updatedAt: stamp };
    }
    return {
      ...state,
      lists,
      customLists,
      ratings: moveKey(state.ratings, fromId, toId),
      viewingHistory: moveKey(state.viewingHistory, fromId, toId),
      addedAt: moveKey(state.addedAt, fromId, toId),
      statuses,
    };
  }

  return {
    remapMovieState,
  };
})();
