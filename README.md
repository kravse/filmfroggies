# Movie collector

Search [TMDB](https://www.themoviedb.org/), add movies to ordered lists, and browse them as a cover grid or a detail-style layout. No account and no backend — your lists live in the browser, with optional sync to a private GitHub Gist.

## How it works

The only thing this site stores is **which TMDB ids are in which list, and in what order**, plus your ratings, viewing history, and a few preferences. Nothing about a movie is duplicated into your lists. Every page load rehydrates movie records by id:

1. **`data/movies.json`** when the committed snapshot covers that id (no API call; snapshot rows are not revalidated in the browser)
2. **Browser Cache API** for TMDB responses fetched earlier in the session
3. **TMDB** for anything still missing (when you have a credential)

That keeps the precious data tiny (a few hundred bytes of ids), and everything else is disposable by construction — a cleared cache costs you one slow reload, never a lost list.

## Run it locally

```bash
npm install
npm run serve    # http://localhost:8743
```

Copy [`.env.example`](.env.example) to `.env` if you need `npm run scrape`, `npm run letterboxd-import`, or `netlify dev` (all read `TMDB_READ_TOKEN` from the environment).

Open **Settings** (footer, bottom left) and paste your TMDB **API Read Access Token**. Without one, movies covered by the committed [`data/`](#bundled-movie-data) snapshot still render; anything else stays a skeleton card and the add-movie search returns nothing.

### Getting a TMDB credential

1. Create an account at [themoviedb.org/signup](https://www.themoviedb.org/signup)
2. Go to [Settings → API](https://www.themoviedb.org/settings/api) and request a **Developer** key (approval is instant for personal projects)
3. Copy the **API Read Access Token** — the long JWT, not the shorter API Key above it — and paste it into Settings

Only the v4 read access token is accepted. It is sent as `Authorization: Bearer` and never appears in a URL. Settings validates the shape before saving and verifies the token against TMDB so a bad value fails once instead of once per movie.

The token is stored in `localStorage` under `moviecollector-tmdb-auth`. It is never committed, never sent anywhere except TMDB, and never included in Gist sync.

## Using the site

### Adding movies

There is no header search box. Tap **+ Add a movie** (floating button, or the empty-state button when a list is empty) to open the add dialog:

1. Search TMDB with autocomplete (arrow keys, Enter, or click to pick a result)
2. Toggle **Director:** to search people and pick a filmography hit instead of title search
3. Choose **Watched** or **Watchlist** (or custom-list checkboxes when viewing a custom list)
4. Set the viewing date (defaults to today) and optionally set **My rating** (1–10 in 0.1 steps) when adding to Watched
5. Submit

When you are viewing a custom list (`#lists/{id}`), the add dialog can also **Add from watched** — a multi-select picker of Watched movies not already on that list.

On the collection view, the sparkle button beside **Lists** opens **New releases** (`#discover/upcoming`, `#discover/upcoming/2`, `#discover/now-playing`, etc.): each tab queries TMDB **`/discover/movie`** with US theatrical release filters (~20 titles per page). **Upcoming** uses US theatrical `release_date` from today through ~90 days ahead, sorted by **popularity** (TMDB’s upcoming discover query — no vote minimum, since unreleased titles rarely have votes yet). **Now playing** uses US theatrical dates from the last **~12 weeks** through today, requires a primary release within **~2 years** (to drop classic re-releases), `vote_count.gte=10`, sorted by popularity. Page lists may differ slightly from [the TMDB website’s shortcut lists](https://www.themoviedb.org/movie/upcoming) because those use fixed internal date ranges. Discover uses a fixed **4-column** grid (**2** on mobile). Non-final pages trim to a count divisible by **4** so both layouts stay full rows. The last page keeps whatever remains. Use **Previous** / **Next** in the toolbar to paginate either tab. The list response seeds cards immediately (title, release date, poster path); full movie details load only when you open a title. Posters lazy-load in the grid with a small concurrency cap. Those movies are not stored until you add them from the detail overlay. In discover detail, **Watchlist** (and **Watched** on Now playing) with the same list icons as Add movie live in the bottom bar. The detail **Lists** editor is for custom lists only. Ratings are not available in discover.

### Browsing lists

**Watched** and **Watchlist** are preset tabs under the header.

| List | Layout | Order | Filter | Reorder |
|------|--------|-------|--------|---------|
| **Watched** | Card or detail (toolbar toggle; persists) | Sort dropdown + reverse button (display only; stored order unchanged) | Chip-based metadata filter (see below) | No |
| **Watchlist** | Always detail grid | Stored order only | No | **Reorder** toggle → drag handles |
| **Custom list** (`#lists/{id}`) | Card or detail | Same sort controls as Watched | No | No |

On **Watched** (and custom lists), the **Sort** dropdown offers My Rating, Fan Rating, Release Year, Title, Date Added, and Date Watched (using the latest viewing), plus a reverse button for direction. Default is My Rating, highest first. Sort never rewrites stored order.

Click any card to open the detail overlay — poster, year, runtime, genres, fan rating, your rating, director, cast, and overview. Edit **My rating** and list membership in the overlay (desktop inline; mobile via a lists sheet). Arrow keys move between movies; Escape closes. Overlays deep-link as `#movie/{id}`.

**Watchlist** cards show **Watch** (moves to Watched) and **Remove**. **Remove movie** in the detail overlay on a preset list drops the film from your entire preset collection. On a custom list, remove takes the movie off that list only.

### Watched filter

When Watched has hydrated movies, a filter bar appears below the header. It is display-only and does not change stored order.

- Plain words match title, director, cast, and genres
- `genre:horror`, `actor:name`, `year:1980s` (or trailing `19…` while typing)
- Multiple chips combine as AND filters

### Custom lists

**Lists** (header, top right on the main collection view) opens the custom lists index at `#lists`:

- Create up to 10 lists; rename or delete from the index
- Sort the index by Recent, Alphabetical, or Size
- Open a list at `#lists/{id}` for the same card/detail layout and sort controls as Watched
- **← Collection** returns to Watched/Watchlist; **← All lists** returns from a list detail to the index

A movie can be on any combination of Watched, Watchlist, and custom lists. Custom membership merges separately (per-list `updatedAt`, last-write-wins, plus delete tombstones).

### Preset invariant

**Watchlist is disjoint from Watched.** Putting something on the watchlist clears watched; marking it watched takes it off the watchlist.

### Hash routing

| URL | View |
|-----|------|
| *(no hash)* | Preset tabs — Watched or Watchlist |
| `#lists` | Custom lists index |
| `#lists/{id}` | Custom list detail |
| `#movie/{id}` | Detail overlay (history back/forward supported) |

### Footer

**Settings** (bottom left): TMDB token, optional Gist sync, import/export CSV, clear cached movie/poster data, hosted-access lock (Netlify only).

**About** (bottom right): short description and TMDB attribution.

### Settings details

**Clear cached data** wipes the browser Cache API (TMDB JSON + poster blobs). Your lists in `localStorage` / Gist are untouched.

**Import & export** (Settings): see [Collection backup CSV](#collection-backup-csv). Import shows a confirmation with row counts before replacing your collection. Use this after running the local [Letterboxd import tool](#letterboxd-import-local-tool).

**Gist sync:** connect with a fine-grained PAT limited to gist read/write. The sync Gist is private, titled **Movie collector sync**, file `moviecollector-state.json`. Neither the PAT nor the TMDB token is written into synced files.

**Automatic backups** (when Gist sync is connected): a separate private gist holds up to five immutable snapshots in `moviecollector-backups.json`. A new snapshot is appended on load when the latest is older than 20 minutes. Restore replaces local state and re-syncs.

## User state (what gets saved)

Stored under `moviecollector-user-state` (and optionally synced to Gist). Movie records from TMDB are **not** part of this payload.

| Field | Role |
|-------|------|
| `lists` | Preset lists: `{ id, name, movieIds[] }` for Watched and Watchlist |
| `customLists` | User lists: `{ id, name, movieIds[], createdAt, updatedAt }` |
| `customListTombstones` | `{ listId → ISO }` so deletes merge correctly across devices |
| `statuses` | `{ movieId → { status, at } }` where status is `watched`, `watchlist`, or `removed` (sync only) |
| `ratings` | `{ movieId → number }` — 1–10, one decimal; only for movies in Watched or a custom list |
| `addedAt` | `{ movieId → ISO }` — when the movie first entered the collection |
| `viewingHistory` | `{ movieId → viewing[] }` — optional dated viewings; opt in when adding to Watched or marking watched from the watchlist, or add later from the detail overlay |
| `preferences` | `{ viewMode: "cards"\|"detail", sort: "<mode>" }` |
| `activeListId` | Which preset tab was last active |
| `storageMode` | `"local"` or `"gist"` |
| `updatedAt` | Payload touch time; **not** used for per-movie merge |

### Browser storage keys

| Key | Contents |
|-----|----------|
| `moviecollector-user-state` | Payload above |
| `moviecollector-user-state-backup` | Payload from just before the last merge |
| `moviecollector-tmdb-auth` | TMDB read access token |
| `moviecollector-hosted-session` | Opaque hosted-access session (Netlify only) |
| `moviecollector-gist-sync` | `{ token, gistId, backupGistId }` when Gist sync is connected |

### How sync avoids losing movies

A tab left open holds its own copy of your lists, so a naive "newest payload wins" push lets a stale tab overwrite everything another tab added. Sync is built to make that impossible:

- **Read before write.** Every save fetches the Gist, merges, then writes. A payload that cannot be read is never overwritten.
- **One request at a time.** All syncs run through a single promise chain.
- **Per-movie timestamps, not per-payload.** Each movie carries a status stamped with when it last changed. Merging compares those stamps. Acting in a stale tab bumps `updatedAt` but not movie stamps — which is why this works.
- **Removal is recorded, not inferred.** Deleting writes a `removed` status record. Re-adding outranks an older removal.
- **Ties keep the movie.**
- **Tabs self-heal.** Background tabs merge on focus.

Recovery: every push creates a Gist revision; `moviecollector-user-state-backup` holds pre-merge state; automatic backups hold periodic snapshots.

## Collection backup CSV

Export, import, Letterboxd CLI output, and optional `data/my_list.csv` all use the same file shape.

| Workflow | Where | What it does |
|----------|-------|--------------|
| **Backup / restore** | Settings → Import & export | **Export** downloads `my_list.csv`; **Import** replaces Watched, Watchlist, custom list memberships, ratings, and viewing history (custom lists in the file are recreated if missing). |
| **Repo snapshot** | `data/my_list.csv` + `npm run scrape` | Scraper reads **unique `tmdb_id` values only** from the first column → `data/movies.json` + posters. List membership and ratings in the CSV are ignored. |

Header:

`tmdb_id,title,list_id,list_name,my_rating,release_year,watch_dates`

**Multi-row export:** one row per list membership (Watched, Watchlist, each custom list). The same movie can appear on several rows; import merges `my_rating` and semicolon-separated `watch_dates` per `tmdb_id`. Scrape dedupes ids from column 1, so a multi-row backup file is valid scraper input.

Letterboxd conversion is local only — it produces this CSV; it never writes browser state directly. See [Letterboxd import](#letterboxd-import-local-only).

## Bundled movie data

Everything above still costs one TMDB request per movie on a cold load, and it stops working entirely if the API is unreachable or its terms change. So the repo can carry its own copy. Movies present in `data/` render from the repo and are **never** requested from the API; only ids added since the last scrape fall through to it.

The snapshot is a cache, not an edit layer. Every field in it came from TMDB and is replaced wholesale on the next scrape.

Refreshing it is three steps:

1. On the running site, open **Settings → Import & export** and click **Export** (or use a CSV from `npm run letterboxd-import`). It downloads `my_list.csv`. Export hydrates missing TMDB titles when a token is available.
2. Commit it to the repo as `data/my_list.csv`.
3. Run the scraper for **metadata and posters only**, then commit what it writes:

```bash
echo 'TMDB_READ_TOKEN=eyJ…' > .env    # gitignored; see .env.example
npm run scrape
```

| Flag | Effect |
|------|--------|
| *(none)* | Incremental: only ids missing from the snapshot are fetched, only missing posters are downloaded |
| `--force` | Refetch every id and re-download every poster |
| `--prune` | Drop records and posters for ids no longer in the CSV |

Without `--prune` nothing is ever deleted, so an export from a half-synced device cannot quietly shrink the snapshot. `--prune` is also skipped automatically if any movie failed to fetch.

A no-op scrape rewrites nothing, so `git status` stays clean when there is nothing new.

### What lands in `data/`

| Path | Contents |
|------|----------|
| `data/my_list.csv` | Scraper input (unique ids from column 1); same backup CSV from Settings or Letterboxd CLI. Not published in the build |
| `data/movies.json` | One record per movie, ascending id, same shape the app renders |
| `data/posters/w342/` | Card and grid posters |
| `data/posters/w500/` | Detail-overlay posters |

Only two poster sizes are stored. Smaller requests use the `w342` file and scale down. Poster filenames are content hashes, so re-scraping an unchanged poster adds nothing to git history.

Missing poster files fall back to TMDB's CDN. Missing `movies.json` records fall back to the API path.

**Browsing without a token.** Once the snapshot covers your lists, the grid and detail overlay render with no credential. A token is still required to search and add movies.

## Letterboxd import (local tool)

Letterboxd is **not** in the deployed site. A separate local tool opens in your browser, lets you upload a Letterboxd ZIP, review TMDB matches, and download a [collection backup CSV](#collection-backup-csv).

```bash
npm run letterboxd-import
```

That starts a small server on port **8744** (override with `LETTERBOXD_TOOL_PORT`) and opens `http://127.0.0.1:8744/tools/letterboxd.html` in a new window. Paste your TMDB read access token, choose your export ZIP, click **Review matches**, fix any ambiguous titles, then **Download backup CSV**.

Import the file on the main site: **Settings → Import & export → Import**.

The `tools/` directory is served locally only and is **not** copied into `build/` for deploy.

## Deploy

```bash
npm run build    # bundles JS, writes build/
```

`build/` is a plain static directory — `index.html`, bundled `css/app.css`, fingerprinted `js/app-bundle.js`, `images/`, the committed `data/` snapshot, and a `noindex` robots file. Routing is hash-only; no SPA fallback is needed beyond [`netlify.toml`](netlify.toml) redirects for Netlify Functions.

Build details:

- `npm run build` runs `npm run bundle` internally, then copies assets into `build/`
- Production HTML links one CSS file and `js/app-bundle.js?v=<hash>` (12-char SHA-256 of file contents) for cache busting
- [`netlify.toml`](netlify.toml) sets `Cache-Control: no-cache` on `index.html` and `must-revalidate` on `/js/*`

Point any static host at `build/` if you are not using Netlify Functions.

### Netlify (optional hosted TMDB access)

For a personal deploy you can keep your TMDB read token on the server so casual visitors never see it. Set in **Site configuration → Environment variables**:

| Variable | Purpose |
|----------|---------|
| `TMDB_READ_TOKEN` | v4 TMDB API Read Access Token (same as `npm run scrape` and `npm run letterboxd-import`) |
| `HOSTED_SITE_PASSWORD` | Password for the hidden unlock flow |

Build command: `npm run build`. Publish directory: `build`. Functions: [`netlify/functions/`](netlify/functions/).

**Hidden unlock:** triple-click the projector logo, enter the site password. The browser stores an opaque session token (not the password). TMDB calls then go through `/api/tmdb`; posters still load from TMDB directly. Triple-click again to lock. This path is intentionally undocumented in the UI.

Casual visitors see the normal site — snapshot movies render without a credential. Threat model: obscurity for casual users, not anti-brute-force.

### Local development with functions

| Command | Use |
|---------|-----|
| `npm run serve` | Static site only; TMDB token in Settings |
| `netlify dev` | Static site **and** `/api/auth` + `/api/tmdb` ([Netlify CLI](https://docs.netlify.com/cli/get-started/)); env from Netlify or `.env` |

## Development

Vanilla HTML/CSS/JS. **CommonJS** in `scripts/` and `test/`. No TypeScript, no framework. `express` is a devDependency for the local static server only.

### Where to edit

| Change | Location |
|--------|----------|
| Domain logic (lists, sync, sort, backup CSV, Letterboxd parse, …) | `scripts/lib/` + tests in `test/` |
| UI wiring, DOM, TMDB client | Numbered partials in `js/app/` (**not** `00-*`) |
| Styles | `css/` — load order in [`scripts/css-manifest.js`](scripts/css-manifest.js); keep [`index.html`](index.html) link tags in sync |
| Generated browser namespaces | `js/app/00-*.js` — **never hand-edit**; synced from `scripts/lib/` |

After any change under `scripts/lib/` or `js/app/`:

```bash
npm test
npm run bundle
```

Adding a new `scripts/lib/` module: implement + test, add its exports to [`scripts/app-sync-config.js`](scripts/app-sync-config.js), then `npm run bundle`.

### App partial load order

[`scripts/bundle-app-js.js`](scripts/bundle-app-js.js) defines `PARTS`. Every partial shares one IIFE opened by `01-config-dom-state.js` and closed by `08-init.js`. Notable layers:

| Prefix | Role |
|--------|------|
| `00-*` | Generated from `scripts/lib/` |
| `01-*` | Config, DOM refs, mutable state |
| `03-*` | User state persistence; TMDB client and hydration |
| `04-*` | Add-movie search dialog |
| `05-*` | Grid/cards render |
| `06-*` | Detail overlay, settings, about |
| `07-*` | Drag reorder (Watchlist) |
| `09-*` | Watched list filter |
| `10-*` | Custom lists routing and index CRUD |
| `11-*` | TMDB discover browse (upcoming / now playing) |
| `12-*` | Collection backup CSV import |
| `08-*` | Event wiring and startup |

### Hard constraints (do not break)

These are deliberate design decisions — see also [`.cursor/rules/moviecollector-project.mdc`](.cursor/rules/moviecollector-project.mdc):

- **No edit layer** for TMDB metadata; no overriding titles/posters in user state
- **Browser-only writes** for lists, ratings, and preferences (`localStorage` / Gist). `server.js` is read-only static files; only `npm run scrape` writes `data/`
- **Only ids are persisted** in user state; movies are rehydrated by id
- **Snapshot before API** for ids in `data/movies.json`; no background revalidation of snapshot hits
- **Watchlist disjoint from Watched** — enforced on read and write
- **Hash-only routing** — no path routes or SPA fallback
- **Search is add-only** — the Watched filter is separate and display-only

## Project layout

| Path | Role |
|------|------|
| `index.html` | UI shell (loads `js/app-bundle.js`) |
| `js/app/` | App source partials |
| `js/app-bundle.js` | Concatenated bundle (generated) |
| `css/` | Stylesheets (12 files; bundled to `css/app.css` in deploy) |
| `scripts/lib/` | Pure CommonJS domain logic, one concern per file |
| `scripts/bundle-app-js.js` | Concatenates partials; runs lib sync |
| `scripts/scrape-data.js` | Refills `data/` from TMDB (`npm run scrape`) |
| `scripts/letterboxd-import.js` | Opens the local Letterboxd tool in your browser |
| `scripts/bundle-letterboxd-tool.js` | Builds `js/tools/letterboxd-tool-bundle.js` |
| `tools/letterboxd.html` | Local Letterboxd import UI (not deployed) |
| `data/` | Committed movie snapshot + scraper input CSV |
| `test/` | Node tests (`npm test`) |
| `server.js` | Read-only static server (`npm run serve`) |
| `build.js` | Static deploy output (`npm run build`) |
| `netlify.toml` | Netlify build, redirects, cache headers |
| `netlify/functions/` | Hosted auth + TMDB proxy |

## npm scripts

| Script | Purpose |
|--------|---------|
| `serve` | Local static server on port 8743 (`PORT` to override) |
| `bundle` | Sync `js/app/00-*.js` from `scripts/lib/`, write `js/app-bundle.js`, verify no bare `require()` in the bundle |
| `test` | Run Node tests in `test/` |
| `scrape` | Refresh `data/` from `data/my_list.csv` (needs `TMDB_READ_TOKEN`) |
| `letterboxd-import` | Open local Letterboxd tool (`http://127.0.0.1:8744/tools/letterboxd.html`) |
| `bundle:letterboxd` | Build the local Letterboxd tool bundle |
| `build` | Bundle + write static site to `build/` |

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.

Movie metadata and images come from [The Movie Database](https://www.themoviedb.org/). This project is not affiliated with TMDB.
