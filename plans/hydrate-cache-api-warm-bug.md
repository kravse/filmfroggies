# Bug: `hydrateMovies` ignores Cache API on page refresh

Status: fixed.

## Summary

Every full page reload clears in-memory `movieById` and forces `hydrateMovies` to call `POST /api/movies/batch` for all pending ids — even when the browser **Cache API** already has those movies from a prior visit. Repeat refreshes generate redundant Worker traffic and can hit **429 rate limits** for users with large libraries.

## Symptoms

- User with ~500 movies refreshes the page 5–10 times (or scrolls the full list after each refresh)
- Network tab shows repeated `POST /api/backend/movies/batch` (or direct Worker URL on localhost) for the same ids
- May eventually see 429 responses; cards stay on skeletons or fall through to slower per-id TMDB fetches
- Worse on localhost where batch limit is 30 requests / user / 15 min ([`BATCH_RATE_LIMITS`](../worker/src/movies-cache.js))

## Root cause

Two code paths for movie metadata; only one uses Cache API:

| Path | Cache API? | When used |
| --- | --- | --- |
| `getMovie(id)` | Yes | Per-id fallback after batch fails |
| `hydrateMovies` → `fetchMoviesBatch` | **No** | Grid hydration (primary path) |

On refresh:

1. New JS context → [`movieById`](../js/app/01-config-dom-state.js) is empty (in-memory `Map`, not persisted)
2. [`hydrateMovies`](../js/app/03-tmdb-client.js) filters to ids without a detailed record in `movieById`
3. Goes straight to `fetchMoviesBatch(stillPending)` — no `cache.match(movieCacheKey(id))` step
4. Worker + D1 serve data that already sits in `moviecollector-tmdb-v1` Cache API from the previous page load

`movieById` is only cleared intentionally on logout via [`clearMovieCache`](../js/app/06-dialogs.js) — not the bug. The bug is **not rehydrating `movieById` from Cache API** after an innocent refresh.

## Reproduction

1. Log in with a account that has 100+ movies on Watched
2. Open DevTools → Network; filter `movies/batch`
3. Load the list; scroll until metadata appears (note batch calls)
4. Hard refresh (Cmd+R) 5 times, scrolling the list each time
5. Observe: batch calls repeat for the same ids; count grows toward 30/15min

## Expected behavior

After the first hydration, subsequent refreshes (within Cache API TTL / 30-day revalidation) should:

1. Read cached movie JSON from Cache API into `movieById`
2. Call `/api/movies/batch` only for ids with no cache entry
3. Optionally revalidate stale cache entries in the background (same pattern as `getMovie`)

## Suggested fix

In [`js/app/03-tmdb-client.js`](../js/app/03-tmdb-client.js) `hydrateMovies`, **before** `fetchMoviesBatch`:

```js
// Pseudocode
const cache = await openTmdbCache();
const fromCache = [];
for (const id of stillPending) {
  const cached = cache ? await cache.match(movieCacheKey(id)) : null;
  if (!cached) continue;
  const record = parseMovieText(await cached.text());
  if (record) {
    movieById.set(id, record);
    handlers.onRecord?.(id, record);
    fromCache.push(id);
  }
}
stillPending = stillPending.filter((id) => !movieById.has(id) || !appTmdb.isDetailedMovieRecord(movieById.get(id)));
```

Then proceed with `fetchMoviesBatch(stillPending)` only if `stillPending.length > 0`.

Consider extracting `loadMovieFromCache(id)` shared with `getMovie` to avoid duplication.

### Secondary fixes (same PR recommended)

**429 cascade** — [`hydrateMovies`](../js/app/03-tmdb-client.js) catch block falls through to per-id `getMovie` on *any* batch failure, including 429:

```js
} catch (_) {
  /* Fall through to per-id TMDB for remaining ids. */
}
```

On 429, **stop** — do not burn TMDB proxy limits. Check `response.status === 429` in `fetchMoviesBatch` and rethrow or return a sentinel.

**Rate limits (optional in same PR)** — raise [`BATCH_RATE_LIMITS`](../worker/src/movies-cache.js) from 30/60 to 120/240 per 15 min as a backstop even with Cache API warm. See [r2-poster-cache.md](./r2-poster-cache.md#abuse-rate-limits-movie--poster-loading).

## Files to touch

| File | Change |
| --- | --- |
| [`js/app/03-tmdb-client.js`](../js/app/03-tmdb-client.js) | Cache warm in `hydrateMovies`; 429 handling in `fetchMoviesBatch` |
| [`worker/src/movies-cache.js`](../worker/src/movies-cache.js) | (Optional) raise `BATCH_RATE_LIMITS` |
| `test/` | Optional: unit test for cache-warm path if logic extracted to `scripts/lib/` |

Run `npm run bundle` after `js/app/` edits.

## Verification

1. Load 100+ movie list; confirm batch calls in Network
2. Hard refresh 5 times
3. **Before fix:** ~5+ batch calls per refresh
4. **After fix:** 0 batch calls on refresh (Cache API hits only); batch only for genuinely new ids
5. Clear site data / `clearMovieCache` from settings → batch resumes (expected)

## Not in scope for this bug

- R2 poster caching
- Persisting `movieById` to `sessionStorage`
- Removing `data/posters/` layer
