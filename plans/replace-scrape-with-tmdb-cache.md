# Replace `npm run scrape` with Cloudflare TMDB cache

Status: **planned** (not implemented)

## Goal

Stop maintaining the committed movie snapshot (`data/movies.json`, `data/posters/`) via `npm run scrape`. Instead:

1. Store normalized TMDB movie metadata in **D1** (read-through cache, ~monthly refresh).
2. Serve metadata through the **existing Worker** (same origin as account sync via `/api/backend/*`).
3. Load posters from **TMDB CDN** initially; optionally move to **R2** later if we want same-origin images without scraping.

User lists stay in the browser / account doc — unchanged. Only **how movie records are resolved** changes.

## Non-goals

- No edit layer for TMDB fields (still TMDB-shaped records only).
- No change to list sync merge rules (Gist / account).
- No requirement to cache the entire TMDB catalog — only ids users actually load.

## Current vs target

| | Today | Target |
|---|--------|--------|
| Metadata source | `data/movies.json` → Cache API → TMDB API | Worker → D1 → (miss) TMDB API → write D1 |
| Posters | `data/posters/` or `image.tmdb.org` | Phase 1: `image.tmdb.org` + browser Cache API. Phase 2 (optional): R2 |
| Refresh | Manual `npm run scrape` + git commit | Worker cron (~30 days) + on-demand miss fill |
| Deploy bundle | Ships `data/` in `build/` | No `data/movies.json` / posters in deploy |
| Offline / no-backend browse | Snapshot works without token | Requires Worker reachable (browser cache helps repeat visits) |

## Architecture

```
Browser hydrateMovies(ids)
  → POST /api/backend/movies/batch  { ids: […] }
       → D1 SELECT … WHERE tmdb_id IN (…)
       → for each miss: TMDB GET /movie/{id}?append_to_response=credits
       → normalize (same as scripts/lib/tmdb.js normalizeMovie)
       → INSERT/UPDATE D1
       → return { movies: { "123": {…}, … }, stale: […] }
  → merge into movieById (same shape as today)
  → posters: unchanged Phase 1 (lazy load from image.tmdb.org using poster_path)
```

**Batch endpoint is required.** Do not implement per-id Worker round trips for grid hydration — that would feel slower than one `movies.json` fetch.

## Cloudflare resources

| Resource | Role | Free tier (few users) |
|----------|------|------------------------|
| **D1** (`cinequeue`) | `movies` table | Well within 5M rows read / day |
| **Worker** | API + TMDB fetch on miss | Well within 100k req / day |
| **R2** (optional) | Poster blobs | Phase 2; ~10 GB storage free |
| **Cron trigger** | Monthly metadata refresh | 1 scheduled invocation / day is fine |

Store `TMDB_READ_TOKEN` as a Worker secret (same token type as scrape). Never expose in client or Gist.

## D1 schema

Add to `worker/schema.sql` + migration file:

```sql
CREATE TABLE IF NOT EXISTS movies (
  tmdb_id INTEGER PRIMARY KEY,
  doc TEXT NOT NULL,           -- normalized JSON, same shape as normalizeMovie output
  poster_path TEXT,            -- denormalized for refresh / R2 keying; also inside doc
  fetched_at INTEGER NOT NULL, -- ms since epoch
  refreshed_at INTEGER         -- last successful TMDB refetch (nullable until first refresh)
);

CREATE INDEX IF NOT EXISTS movies_fetched_at ON movies(fetched_at);
```

- **`doc`**: stringified normalized record (keep under D1 row limits; movie JSON is ~2–15 KB).
- **`fetched_at`**: set on insert; used for staleness (e.g. 30 days).
- Do **not** store poster bytes in D1.

## Worker API

All paths under existing `/api` prefix (proxied as `/api/backend/…` on Netlify).

| Method | Path | Auth | Behavior |
|--------|------|------|----------|
| `POST` | `/movies/batch` | No* | Body `{ ids: number[] }` max ~100 ids. Returns `{ movies: Record<id, doc> }`. Missing ids omitted or listed in `missing`. |
| `GET` | `/movies/:id` | No* | Single id; same read-through logic. Useful for detail / share links. |

\*Same as TMDB today: metadata is not secret. Optionally rate-limit by IP later. Do not require account login for movie metadata.

**Read-through logic** (shared helper):

1. Load all requested ids from D1 in one query.
2. Return fresh-enough rows (`now - fetched_at < STALE_MS`).
3. For stale or missing ids: fetch TMDB (bounded concurrency, reuse `normalizeMovie` — port or duplicate minimal subset in Worker).
4. Upsert D1; return merged map.
5. On TMDB failure for one id: return cached stale row if present; else omit id (client shows skeleton/error as today).

**Constants** (starting point):

- `STALE_MS = 30 * 24 * 60 * 60 * 1000`
- `BATCH_MAX_IDS = 100`
- `TMDB_FETCH_CONCURRENCY = 4` (respect TMDB rate limits)

**Response caching:** set `Cache-Control: public, max-age=86400` on batch responses when all ids are hits and fresh. Reduces D1 reads for repeat page loads.

## Scheduled refresh

Add Worker cron in `wrangler.toml`:

```toml
[triggers]
crons = ["0 4 1 * *"]   # 04:00 UTC on the 1st of each month — adjust as needed
```

Handler:

1. Select ids where `fetched_at < now - STALE_MS` (cap rows per run, e.g. 500).
2. Refetch from TMDB, update `doc`, `poster_path`, `fetched_at`, `refreshed_at`.
3. Log counts; no user-facing email required.

Optional: only refresh ids that appear in any `user_data.doc` (requires parsing JSON in D1 — defer until needed).

## Phase 2 (optional): R2 posters

Only if we want to drop TMDB CDN dependency and fully remove `data/posters/`:

1. Create R2 bucket `cinequeue-posters`, bind in `wrangler.toml`.
2. On metadata upsert, if `poster_path` present and object missing: fetch `image.tmdb.org/t/p/w342{path}` once, `PUT` to R2.
3. `GET /api/posters/w342/:hashOrId` → stream from R2 with long cache headers.
4. App: prefer Worker poster URL when `resolvePosterUrl` detects hosted mode (new branch in `03-tmdb-client.js` / `local-data.js`).

Free tier (~10 GB, 10M reads/mo) is ample for a personal collection at two sizes.

## App changes

### 1. `scripts/lib/` (tested domain logic)

- **`movie-cache.js`** (new): batch request shape, merge server movies into hydration flow, stale handling.
- **`account-sync.js`**: add `MOVIES_API_PROXIED = "/api/backend/movies/batch"` (or extend base URL helper).
- Reuse **`tmdb.normalizeMovie`** validation rules when parsing server `doc`.

### 2. `js/app/03-tmdb-client.js`

Update `hydrateMovies`:

```
Order:
  1. movieById (already loaded)
  2. POST batch to Worker/D1 cache     ← replaces localMovieById snapshot path
  3. Browser Cache API (keep for TMDB direct fallback during migration)
  4. TMDB direct (keep until Worker proven; then optional removal)
```

Remove or gate `loadLocalData()` / `localMovieById` once Worker cache is live.

### 3. Remove snapshot from deploy

- **`build.js`**: stop `copyData()` (or copy only if `KEEP_DATA_SNAPSHOT=1` during transition).
- **`index.html` / app**: no references to `data/movies.json` required at runtime.

### 4. Deprecate scrape

- Keep `scripts/scrape-data.js` temporarily behind `npm run scrape:legacy` or delete after migration.
- **`data/my_list.csv`**: still valid as **backup/export** input, not scraper driver.
- Update **README** when implemented.

## Migration steps (ordered)

### Phase 0 — Prep

- [ ] Read this plan; confirm poster strategy (Phase 1 = TMDB CDN only is recommended).
- [ ] Ensure Worker deployed with current account backend stable.
- [ ] `wrangler secret put TMDB_READ_TOKEN` on Worker (if not already).

### Phase 1 — Backend

- [ ] Add `movies` table migration; `wrangler d1 execute cinequeue --remote --file=migrations/00X_movies.sql`
- [ ] Port `normalizeMovie` + `buildMovieUrl` + fetch helper into Worker (or shared package — prefer duplicating minimal Worker-safe subset to avoid bundling all of `scripts/`).
- [ ] Implement `POST /api/movies/batch` + tests in `worker/test-movies-cache.js`
- [ ] Add cron handler for stale refresh
- [ ] `wrangler deploy`
- [ ] Manual test: `curl -X POST …/api/movies/batch -d '{"ids":[550]}'`

### Phase 2 — Frontend

- [ ] Add `movie-cache` lib + tests in `test/`
- [ ] Wire `hydrateMovies` to batch endpoint
- [ ] `npm run bundle`; verify grid + detail + discover add flow
- [ ] Verify localhost (direct Worker URL) and production (Netlify proxy)

### Phase 3 — Cut over

- [ ] Stop copying `data/` in `build.js`
- [ ] Remove `loadLocalData` path from hot path (keep dead code one release if cautious)
- [ ] Update README (deploy, no scrape workflow)
- [ ] Optional: one-time script to seed D1 from existing `data/movies.json` (avoids TMDB burst on first load)

### Phase 4 — Cleanup

- [ ] Remove or archive `npm run scrape`, `data/movies.json`, `data/posters/` from routine workflow
- [ ] Gitignore large poster dirs if removed from repo (or keep last snapshot tag for backup)
- [ ] R2 posters (optional sub-plan)

## Seeding D1 from existing snapshot (optional one-time)

Before cutover, upload current cache to avoid re-hitting TMDB for ~200 ids:

```bash
# Pseudocode: node scripts/seed-movie-cache.js
# Reads data/movies.json, POST internal admin endpoint or wrangler d1 execute batches
```

Implement as a local script using Wrangler D1 HTTP API or a temporary Worker route protected by admin secret — **do not** leave admin route open.

## Performance expectations (few users)

| Concern | Verdict |
|---------|---------|
| Cloudflare limits | Not an issue at this scale |
| vs `movies.json` | Batch endpoint + HTTP cache ≈ comparable after first visit |
| First visit cold | One POST + N poster image requests (same as today for non-snapshot movies) |
| Worker latency | +1 hop vs static file; acceptable for personal site |
| TMDB rate limits | Batch miss fill uses concurrency cap; seed from snapshot avoids day-one spike |

## Risks

| Risk | Mitigation |
|------|------------|
| Worker down → no metadata | Browser cache; optional short TMDB fallback with user token |
| Stale ratings/overviews | Monthly cron + `fetched_at` on read |
| TMDB ToS / attribution | Cache only; keep About TMDB attribution; no redistribution as dataset |
| Larger Worker bundle | Keep TMDB normalize logic minimal; no `require()` of whole `scripts/` tree |
| Regression in token-free browse | Accept as tradeoff, or keep thin static seed for top N ids (not recommended) |

## Testing checklist

- [ ] `cd worker && npm test`
- [ ] `npm test` (new `test/movie-cache.test.js`)
- [ ] Hydrate 200-id list: one batch request in network tab
- [ ] Add new movie via search (id not in D1): appears after single miss fill
- [ ] Friend view / share `#movie/{id}` for uncached id
- [ ] Account sync unchanged
- [ ] Clear site data → reload → movies load without local `data/`
- [ ] Cron dry-run in `wrangler dev` with mocked date

## Rollback

1. Re-enable `copyData()` in `build.js`.
2. Revert `hydrateMovies` to prefer `localMovieById` first.
3. Redeploy static site; Worker movie routes can remain (unused).

## Open decisions

1. **Posters Phase 1 vs R2 immediately** — recommend TMDB CDN first.
2. **Keep TMDB client fallback** after Worker cache — yes for first release.
3. **Seed D1 from `movies.json`** — recommended for smooth cutover.
4. **Auth on `/movies/batch`** — public + IP rate limit vs require account session.

## Files to touch (implementation reference)

| Area | Files |
|------|--------|
| Worker | `worker/src/index.js`, `worker/schema.sql`, `worker/migrations/`, `worker/wrangler.toml`, `worker/test-*.js` |
| Lib | `scripts/lib/movie-cache.js`, `scripts/lib/account-sync.js`, `scripts/app-sync-config.js` |
| App | `js/app/03-tmdb-client.js`, generated `00-*` |
| Build | `build.js` |
| Docs | `README.md` (when done) |
| Remove / archive | `scripts/scrape-data.js`, `data/movies.json`, `data/posters/` (last step) |

---

*Created for the account-backend / Cloudflare migration track. Update this doc as decisions are made.*
