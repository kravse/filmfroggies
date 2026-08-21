# FilmFroggies

Search [TMDB](https://www.themoviedb.org/), add movies to ordered lists, and browse them as a cover grid or a detail-style layout. **Sign in with a filmfroggies account** to search TMDB, sync lists across devices, and use Discover. Lists are cached in the browser and synced to the Cloudflare Worker + D1 backend when logged in.

## How it works

The only thing this site stores is **which TMDB ids are in which list, and in what order**, plus your ratings, viewing history, and a few preferences. Nothing about a movie is duplicated into your lists. Every page load rehydrates movie records by id:

1. **Account D1 batch cache** (`POST /api/movies/batch`) when logged in — one request per **visible viewport batch** (not the full list), with a short prefetch band below the fold
2. **Browser Cache API** for TMDB movie JSON and poster blobs (revalidated at most once every 30 days)
3. **Per-id TMDB** via the account-gated Worker proxy for anything still missing

Committed **`data/posters/`** files (see [Bundled poster files](#bundled-poster-files)) serve poster images from the repo when listed in `data/posters.json`; missing files fall back to TMDB's CDN.

That keeps the precious data tiny (a few hundred bytes of ids), and everything else is disposable by construction — a cleared cache costs you one slow reload, never a lost list.

## Run it locally

```bash
npm install
npm run serve    # http://localhost:8743
```

Copy [`.env.example`](.env.example) to `.env` if you need `npm run scrape` or `npm run letterboxd-import` (both read `TMDB_READ_TOKEN` from the environment).

Logged-out visitors land on a **splash page** that explains the site and shows sample poster tiles from committed `data/` assets. Use **Sign up** or **Log in** there, or the footer **Log in** button. Search, Discover, metadata hydration, and adding movies require a session. TMDB traffic uses the server read token on the Worker — you never paste a personal TMDB token in Settings.

### Migrating from local-only or Gist data

The app does **not** auto-merge old local or Gist lists when you create an account. Export via **Settings → Import & export → Export**, sign in, then **Import** the CSV if you want those lists on your account.

## Using the site

### Adding movies

There is no header search box. Tap **+ Add a movie** (floating button, or the empty-state button when a list is empty) to open the add dialog:

1. Search TMDB with autocomplete (arrow keys, Enter, or click to pick a result)
2. Toggle **Director:** to search people and pick a filmography hit instead of title search
3. Choose **Watched** or **Watchlist** (or custom-list checkboxes when viewing a custom list)
4. Set the viewing date (defaults to today) and optionally set **My rating** (1–10 in 0.1 steps) when adding to Watched
5. Submit

When you are viewing a custom list (`#lists/{id}`), the add dialog can also **Add from watched** — a multi-select picker of Watched movies not already on that list.

On the collection view, the sparkle button beside **Lists** opens **Discover** (`#discover/upcoming`, `#discover/upcoming/2`, `#discover/now-playing`, etc.): each tab queries TMDB **`/discover/movie`** with US theatrical release filters (~20 titles per page). **Upcoming** uses US theatrical `release_date` and matching **primary** premiere from today through **~4 weeks** ahead (new releases only — no re-releases), sorted by **popularity** (no vote minimum, since unreleased titles rarely have votes yet). **Now playing** uses US theatrical dates from the last **~12 weeks** through today, requires a primary premiere in the same window (new only), `vote_count.gte=10`, sorted by popularity. Page lists may differ slightly from [the TMDB website’s shortcut lists](https://www.themoviedb.org/movie/upcoming) because those use fixed internal date ranges. Discover uses a fixed **4-column** grid (**2** on mobile). Non-final pages trim to a count divisible by **4** so both layouts stay full rows. The last page keeps whatever remains. Use **Previous** / **Next** in the toolbar to paginate either tab. The list response seeds cards immediately (title, release date, poster path); full movie details load only when you open a title. Posters lazy-load in the grid with a small concurrency cap. Those movies are not stored until you add them from the detail overlay. In discover detail, **Watchlist** (and **Watched** on Now playing) with the same list icons as Add movie live in the bottom bar. The detail **Lists** editor is for custom lists only. Ratings and viewing history are not available in discover.

### Browsing lists

**Watched** and **Watchlist** are preset tabs under the header.

| List | Layout | Order | Filter | Reorder |
|------|--------|-------|--------|---------|
| **Watched** | Card or detail (toolbar toggle; persists) | Sort dropdown + reverse button (display only; stored order unchanged) | Chip-based metadata filter (see below) | No |
| **Watchlist** | Always detail grid | Stored order only | No | **Reorder** toggle → drag handles |
| **Custom list** (`#lists/{id}`) | Card or detail | Same sort controls as Watched | No | No |

On **Watched** (and custom lists), the **Sort** dropdown offers My Rating, Fan Rating, Release Year, Title, Date Added, and Date Watched (using the latest viewing), plus a reverse button for direction. Default is My Rating, highest first. Sort never rewrites stored order.

Click any card to open the detail overlay — poster, year, runtime, genres, fan rating, your rating, director, cast, and overview. Edit **My rating** and list membership in the overlay (desktop inline; mobile via a lists sheet). **Share** beside the title copies a `#movie/{id}` link; anyone signed in can open that movie. If it is not in their collection, the overlay shows the overview plus the add-movie controls (Watched / Watchlist, optional rating and viewing date, custom lists). Arrow keys move between movies; Escape closes. Overlays deep-link as `#movie/{id}`.

**Watchlist** cards show **Watch** (moves to Watched) and **Remove**. **Remove movie** in the detail overlay on a preset list drops the film from your entire preset collection. On a custom list, remove takes the movie off that list only.

### Watched filter

When Watched has hydrated movies, a filter bar appears below the header. It is display-only and does not change stored order.

- Plain words match title words (each query word needs its own title word)
- `genre:horror`, `actor:name`, `director:name`, `year:1980s` (or trailing `19…` while typing)
- Multiple chips combine as AND filters

### Custom lists

**Lists** (header, top right on the main collection view) opens the custom lists index at `#lists`:

- Create up to 20 lists (200 movies each); rename or delete from the index
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

**Log in** (bottom left, logged out only): opens the login dialog. It replaces the Settings button until you have a session. The splash page also links to sign up and log in.

**Settings** (bottom left, logged in): **Account** and **Config** tabs — session details and delete account; import/export CSV and clear cached movie/poster data. **Friends** (header icon beside Lists and Discover) opens the friends overlay to add people and browse shared lists at `#friend/{userId}`.

**Attribution** (bottom right): TMDB credit and required disclaimer.

### Settings details

**Clear cached data** wipes the browser Cache API (TMDB JSON + poster blobs). Your lists in `localStorage` and on the account server are untouched.

**Import & export** (Settings): see [Collection backup CSV](#collection-backup-csv). Import shows a confirmation with row counts before replacing your collection. Use this to migrate lists when moving to account-only storage or after running the local [Letterboxd import tool](#letterboxd-import-local-tool).

**Account:** the footer **Log in** button (logged out) opens the login dialog; log in or sign up with email and password, and new signups also need the invite code you were given. Once logged in, Settings → **Account** shows the session and the delete-account action. Lists sync through the filmfroggies backend (see [Account backend](#account-backend-cloudflare-worker--d1)). Friends can browse each other's lists at `#friend/{userId}` (header **Friends** icon → View lists) once both sides accept a request. The session token stays in this browser and is never part of the synced payload. Connecting pulls remote lists only — local lists are not pushed on signup/login; use CSV export/import to migrate.

## User state (what gets saved)

Stored under `moviecollector-user-state` and synced to your filmfroggies account when logged in. Movie records from TMDB are **not** part of this payload.

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
| `storageMode` | Always `"account"` (legacy `"local"` / `"gist"` values normalize to `"account"`) |
| `updatedAt` | Payload touch time; **not** used for per-movie merge |

### Browser storage keys

| Key | Contents |
|-----|----------|
| `moviecollector-user-state` | Payload above |
| `moviecollector-user-state-backup` | Payload from just before the last merge |
| `moviecollector-account` | `{ token, email, userId, displayName }` when logged in |

### How sync avoids losing movies

A tab left open holds its own copy of your lists, so a naive "newest payload wins" push lets a stale tab overwrite everything another tab added. Sync is built to make that impossible:

- **Read before write.** Every save fetches the remote doc, merges, then writes. A payload that cannot be read is never overwritten.
- **One request at a time.** All syncs run through a single promise chain.
- **Per-movie timestamps, not per-payload.** Each movie carries a status stamped with when it last changed. Merging compares those stamps. Acting in a stale tab bumps `updatedAt` but not movie stamps — which is why this works.
- **Removal is recorded, not inferred.** Deleting writes a `removed` status record. Re-adding outranks an older removal.
- **Ties keep the movie.**
- **Tabs self-heal.** Background tabs merge on focus.

Recovery: `moviecollector-user-state-backup` holds pre-merge state on this device.

Account sync uses these merge rules (read before write, per-movie stamps, serialized promise chain) against `GET`/`PUT /api/data` on the Worker.

## Account backend (Cloudflare Worker + D1)

The account feature is a small [Cloudflare Worker](https://developers.cloudflare.com/workers/) with a [D1](https://developers.cloudflare.com/d1/) SQLite database. It stores:

- **Accounts** — email, PBKDF2 password hash, display name
- **User data** — one JSON doc per user
- **Friends** — pending/accepted relationships; accepted friends can `GET` each other's docs
- **Movies** — normalized TMDB metadata keyed by `tmdb_id` (batch cache for grid hydration)

Movie metadata is served from the account-gated batch endpoint (`POST /api/movies/batch`), with D1 hits first and server-side TMDB fill for misses. Committed poster files under `data/posters/` are listed in `data/posters.json`. The Worker holds the shared TMDB read token as `TMDB_READ_TOKEN`; users never send a personal TMDB token from the browser.

### How the site reaches the Worker

| Environment | Account API | TMDB proxy | Notes |
|-------------|-------------|------------|-------|
| **Production** (`filmfroggies.com`) | `/api/backend/…` | `/api/tmdb` | Netlify proxies both to the Worker (see [`netlify.toml`](netlify.toml)) |
| **Local dev** (`localhost:8743`) | Worker URL directly | Worker URL directly | CORS allowlist includes `http://localhost:8743` and `http://127.0.0.1:8743` |

Configured in [`scripts/lib/account-sync.js`](scripts/lib/account-sync.js). After changing the Worker URL, update that file and the Netlify redirects, then `npm run bundle`.

### API surface

All paths are under `/api`. Authenticated routes expect `Authorization: Bearer <token>`.

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/signup` | No | Create account (returns session token on success) |
| `POST` | `/login` | No | Log in |
| `POST` | `/logout` | Yes | Revoke current session |
| `GET` | `/me` | Yes | Current user profile |
| `GET` | `/data` | Yes | Fetch synced list doc (`404` if never pushed) |
| `PUT` | `/data` | Yes | Save list doc (max ~200 KB JSON) |
| `GET` | `/friends` | Yes | List friends and pending requests |
| `POST` | `/friends/request` | Yes | Send friend request by email |
| `POST` | `/friends/{id}/accept` | Yes | Accept an incoming request |
| `DELETE` | `/friends/{id}` | Yes | Remove friend or cancel outgoing pending request |
| `DELETE` | `/account` | Yes | Delete account (body: `{ password }`; removes server data only) |
| `GET` | `/tmdb` | Yes | TMDB proxy (allowlisted paths; server `TMDB_READ_TOKEN`) |
| `POST` | `/movies/batch` | Yes | Batch movie metadata (D1 cache + TMDB miss fill) |
| `GET` | `/lists/watched?sort=…` | Yes | Full sorted id list for Watched (TMDB fill on title/year/fan-rating sorts) |
| `GET` | `/lists/watchlist` | Yes | Watchlist ids in stored order (sort param ignored) |
| `GET` | `/lists/custom/{id}?sort=…` | Yes | Full sorted id list for a custom list |
| `GET` | `/friends/{id}/lists/…` | Yes | Same as `/lists/…` but for an accepted friend's doc |
| `GET` | `/friends/{id}/data` | Yes | Read an accepted friend's list doc |

Implementation: [`worker/src/index.js`](worker/src/index.js). Schema: [`worker/schema.sql`](worker/schema.sql).

### Wrangler setup (first deploy)

You need a [Cloudflare account](https://dash.cloudflare.com/sign-up), the [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/), and a **verified account email** (deploy fails with error 10034 otherwise).

```bash
cd worker
npm install          # installs nothing extra today; keeps test script local
wrangler login
```

**1. Create a D1 database** (once per Cloudflare account / project):

```bash
wrangler d1 create cinequeue
```

Copy the `database_id` from the output into [`worker/wrangler.toml`](worker/wrangler.toml) under `[[d1_databases]]`.

**2. Apply schema** (creates `users`, `user_data`, `friends`, `rate_limits`, `movies`, `invite_codes`, `sessions`):

```bash
wrangler d1 execute cinequeue --remote --file=schema.sql
```

**3. Apply migrations** (if any exist under `worker/migrations/`):

```bash
wrangler d1 execute cinequeue --remote --file=migrations/001_rate_limits.sql
wrangler d1 execute cinequeue --remote --file=migrations/002_movies.sql
wrangler d1 execute cinequeue --remote --file=migrations/003_invite_codes.sql
wrangler d1 execute cinequeue --remote --file=migrations/004_sessions.sql
```

Apply `004_sessions.sql` **before** deploying Worker code that reads the `sessions` table. Existing bearer tokens without a server session row will 401 once; users re-login once.

**4. Set secrets** (required):

```bash
# Random 32+ byte secret — used to sign session tokens
openssl rand -base64 32 | wrangler secret put SESSION_SECRET

# v4 TMDB read token — same value as npm run scrape uses locally
wrangler secret put TMDB_READ_TOKEN
```

**5. Deploy:**

```bash
wrangler deploy
```

Generate signup invite codes from `#admin` after the static site is deployed (see [Admin](#admin)). Only SHA-256 hashes are stored in D1. Share each code privately; wrong or already-used codes get the same neutral signup response as a duplicate email.

To revoke the old shared signup secret (if you used one before):

```bash
cd worker && wrangler secret delete SIGNUP_INVITE_CODE
```

Note the deployed URL (e.g. `https://cinequeue-api.<subdomain>.workers.dev`). Wire it into the static site:

1. [`scripts/lib/account-sync.js`](scripts/lib/account-sync.js) — set `ACCOUNT_API_DIRECT` to `https://…/api`
2. [`netlify.toml`](netlify.toml) — set the `/api/backend/*` redirect target to the same host
3. `npm run bundle` and redeploy the static site

### Wrangler day-to-day

| Task | Command |
|------|---------|
| Deploy Worker changes | `cd worker && wrangler deploy` |
| Run Worker unit tests | `cd worker && npm test` |
| Local Worker dev server | `cd worker && wrangler dev` |
| Local D1 (offline) | Add `--local` to `wrangler d1 execute …` and use `wrangler dev` with local D1 |
| Inspect remote D1 | `wrangler d1 execute cinequeue --remote --command "SELECT COUNT(*) FROM users"` |
| Tail live logs | `wrangler tail` |

After editing [`worker/schema.sql`](worker/schema.sql) for an existing database, add a numbered file under `worker/migrations/` and apply it with `wrangler d1 execute cinequeue --remote --file=migrations/….sql` — do not rely on re-running the full schema on production.

### Worker configuration

[`worker/wrangler.toml`](worker/wrangler.toml):

| Key | Purpose |
|-----|---------|
| `name` | Worker script name in Cloudflare |
| `main` | Entry point (`src/index.js`) |
| `compatibility_date` | Workers runtime pin |
| `[[d1_databases]]` | Binds D1 as `env.DB` |

Secrets and vars (set in Cloudflare, not committed):

| Name | Required | Purpose |
|------|----------|---------|
| `SESSION_SECRET` | **Yes** | HMAC key for bearer session tokens (30-day lifetime) |
| `TMDB_READ_TOKEN` | **Yes** | v4 TMDB API Read Access Token for `GET /api/tmdb` and `POST /api/movies/batch` |
| `ADMIN_PASSWORD` | No | Admin UI login password (`#admin`) |
| `ADMIN_SESSION_SECRET` | No | HMAC key for admin bearer tokens (required with `ADMIN_PASSWORD`) |
| `ALLOWED_ORIGINS` | No | Comma-separated extra CORS origins merged with the default allowlist |

Signup invite codes live in D1 (`invite_codes`). Generate from `#admin` when admin secrets are set.

Default CORS origins (hardcoded): `https://filmfroggies.com`, `https://www.filmfroggies.com`, `http://localhost:8743`, `http://127.0.0.1:8743`.

### Auth and limits

- Passwords: PBKDF2-SHA256, 100k iterations, per-user salt
- Sessions: HMAC-signed bearer token (`{ uid, jti, exp }`) plus a D1 `sessions` row per login; logout and account delete revoke server-side
- Rate limits (by IP / email): signup 5/hr per IP; login 15/15 min per IP; 5 failed logins/15 min per email
- **Closed signups:** new accounts require a one-time invite code (**Log in → Sign up**); wrong or used codes get the same neutral response as a duplicate email
- Signup and friend-request responses are intentionally neutral (no email enumeration).

Logout flushes pending sync, calls `POST /api/logout` to delete the session row, then clears local storage. Account delete removes all sessions for that user before the user row is deleted.

### Admin (`#admin`)

When `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` are set on the Worker:

```bash
cd worker
wrangler secret put ADMIN_PASSWORD
openssl rand -base64 32 | wrangler secret put ADMIN_SESSION_SECRET
```

Open `#admin` on the site (hash-only route, e.g. `https://filmfroggies.com/#admin`). Sign in with that password to view user counts, delete accounts, and generate one-time invite codes (up to 20 per batch). Admin sessions last 1 hour and live in `sessionStorage` only. Failed admin logins are capped at **3 per IP per hour** and **8 globally per hour**.

### Using accounts locally

```bash
npm run serve    # http://localhost:8743
```

Log in through the footer **Log in** button. Localhost talks to the deployed Worker URL directly (CORS must allow your dev origin — the defaults cover port **8743**).

To run the Worker itself locally against a local D1:

```bash
cd worker
wrangler d1 execute cinequeue --local --file=schema.sql
wrangler d1 execute cinequeue --local --file=migrations/003_invite_codes.sql
wrangler d1 execute cinequeue --local --file=migrations/004_sessions.sql
wrangler secret put SESSION_SECRET   # prompts; needed for wrangler dev too
wrangler dev
```

Point `ACCOUNT_API_DIRECT` at the `wrangler dev` URL while testing, then restore the production Worker URL before committing.

## Collection backup CSV

Export, import, Letterboxd CLI output, and optional `data/my_list.csv` all use the same file shape.

| Workflow | Where | What it does |
|----------|-------|--------------|
| **Backup / restore** | Settings → Import & export | **Export** downloads `my_list.csv`; **Import** replaces Watched, Watchlist, custom list memberships, ratings, and viewing history (custom lists in the file are recreated if missing). |
| **Repo poster cache** | `data/my_list.csv` + `npm run scrape` | Scraper reads **unique `tmdb_id` values only** from the first column → `data/posters.json` + poster files under `data/posters/`. List membership and ratings in the CSV are ignored. |

Header:

`tmdb_id,title,list_id,list_name,my_rating,release_year,watch_dates`

**Multi-row export:** one row per list membership (Watched, Watchlist, each custom list). The same movie can appear on several rows; import merges `my_rating` and semicolon-separated `watch_dates` per `tmdb_id`. Scrape dedupes ids from column 1, so a multi-row backup file is valid scraper input.

Letterboxd conversion is local only — it produces this CSV; it never writes browser state directly. See [Letterboxd import](#letterboxd-import-local-only).

## Bundled poster files

Movie metadata comes from the account D1 cache when you are logged in. The repo can still carry **poster image files** so your deployed site serves stable local images for ids you care about (developer workflow — faster grids, fewer CDN requests).

Refreshing posters is three steps:

1. On the running site, open **Settings → Import & export** and click **Export** (or use a CSV from `npm run letterboxd-import`). It downloads `my_list.csv`.
2. Commit it to the repo as `data/my_list.csv`.
3. Run the poster scraper, then commit what it writes:

```bash
echo 'TMDB_READ_TOKEN=eyJ…' > .env    # gitignored; see .env.example
npm run scrape
```

| Flag | Effect |
|------|--------|
| *(none)* | Incremental: only ids missing from the manifest or with incomplete files on disk are fetched |
| `--force` | Re-download every poster listed in the CSV |
| `--prune` | Drop manifest entries and poster files for ids no longer in the CSV |

Without `--prune` nothing is ever deleted, so an export from a half-synced device cannot quietly shrink the poster cache. `--prune` is also skipped automatically if any poster failed to fetch.

On first run after upgrading from the old metadata scraper, the script seeds `posters.json` from an existing `data/movies.json` if present, so you do not need to re-download posters you already have.

A no-op scrape rewrites nothing, so `git status` stays clean when there is nothing new.

### What lands in `data/`

| Path | Contents |
|------|----------|
| `data/my_list.csv` | Scraper input (unique ids from column 1); same backup CSV from Settings or Letterboxd CLI. Not published in the build |
| `data/posters.json` | Manifest of which ids have local poster files |
| `data/posters/w342/` | Card and grid posters |
| `data/posters/w500/` | Detail-overlay posters |

Only two poster sizes are stored. Smaller requests use the `w342` file and scale down. Poster filenames are content hashes, so re-scraping an unchanged poster adds nothing to git history.

Missing poster files fall back to TMDB's CDN. Legacy `data/movies.json` is no longer written or deployed; you can delete it from the repo once `posters.json` exists.

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

`build/` is a plain static directory — `index.html`, bundled `css/app.css`, fingerprinted `js/app-bundle.js`, `images/`, committed poster files under `data/`, and a `noindex` robots file. Routing is hash-only; no SPA fallback is needed beyond [`netlify.toml`](netlify.toml) redirects for Netlify Functions and the account API proxy.

Build details:

- `npm run build` runs `npm run bundle` internally, then copies assets into `build/`
- Production HTML links one CSS file and `js/app-bundle.js?v=<hash>` (12-char SHA-256 of file contents) for cache busting
- [`netlify.toml`](netlify.toml) sets `Cache-Control: no-cache` on `index.html` and `must-revalidate` on `/js/*`
- `/api/tmdb` and `/api/backend/*` are proxied to the Cloudflare Worker (TMDB proxy + account API)

Point any static host at `build/` only if you also reverse-proxy `/api/tmdb` and `/api/backend/*` to the Worker (or set `ACCOUNT_API_DIRECT` in [`scripts/lib/account-sync.js`](scripts/lib/account-sync.js) to the Worker URL and `npm run bundle`).

### Netlify (production static site)

[`netlify.toml`](netlify.toml) redirects:

| Path | Target |
|------|--------|
| `/api/tmdb` | Worker `GET /api/tmdb` |
| `/api/backend/*` | Worker `/api/*` |

Build command: `npm run build`. Publish directory: `build`. **No Netlify Functions** — TMDB and account traffic go to the Worker. Set `TMDB_READ_TOKEN` on the Worker (`wrangler secret put TMDB_READ_TOKEN`), not on Netlify. Remove legacy Netlify env vars `HOSTED_SITE_PASSWORD` and `TMDB_READ_TOKEN` if they are still present.

### Local development

| Command | Use |
|---------|-----|
| `npm run serve` | Static site on port 8743; logged-out visitors see the splash page; TMDB + account API hit the deployed Worker directly |
| `cd worker && wrangler dev` | Run the account API + TMDB proxy locally (see [Account backend](#account-backend-cloudflare-worker--d1)) |
| `cd worker && npm test` | Worker auth, CORS, TMDB proxy, movies batch cache, and rate-limit unit tests |

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

Sort logic shared with the Worker lives in [`scripts/lib/list-query.js`](scripts/lib/list-query.js). After changing `list-query.js`, `sort.js`, or their deps, also run:

```bash
npm run sync-worker-lib
cd worker && npm test
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
- **Browser-only writes** for lists, ratings, and preferences (`localStorage` and Account API from the browser). `server.js` is read-only static files; only `npm run scrape` writes poster files under `data/`
- **Only ids are persisted** in user state; movies are rehydrated by id via D1 batch cache, then TMDB
- **D1 batch before per-id TMDB** when logged in; committed poster files when listed in `data/posters.json`
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
| `scripts/scrape-data.js` | Downloads poster files for CSV ids (`npm run scrape`) |
| `scripts/letterboxd-import.js` | Opens the local Letterboxd tool in your browser |
| `scripts/bundle-letterboxd-tool.js` | Builds `js/tools/letterboxd-tool-bundle.js` |
| `tools/letterboxd.html` | Local Letterboxd import UI (not deployed) |
| `data/` | Committed poster cache + scraper input CSV |
| `test/` | Node tests (`npm test`) |
| `server.js` | Read-only static server (`npm run serve`) |
| `build.js` | Static deploy output (`npm run build`) |
| `netlify.toml` | Netlify build, redirects (`/api/tmdb`, `/api/backend/*` → Worker), cache headers |
| `worker/` | Cloudflare Worker account API (`wrangler deploy`) |
| `worker/wrangler.toml` | Worker name, D1 binding, compatibility date |
| `worker/schema.sql` | D1 base schema |
| `worker/migrations/` | Incremental D1 migrations |
| `scripts/lib/account-sync.js` | Account API URL helpers (synced to `js/app/00-app-account-sync.js`) |

## npm scripts

| Script | Purpose |
|--------|---------|
| `serve` | Local static server on port 8743 (`PORT` to override) |
| `bundle` | Sync `js/app/00-*.js` from `scripts/lib/`, write `js/app-bundle.js`, verify no bare `require()` in the bundle |
| `test` | Run Node tests in `test/` |
| `scrape` | Download poster files for CSV ids → `data/posters.json` + `data/posters/` (needs `TMDB_READ_TOKEN`) |
| `letterboxd-import` | Open local Letterboxd tool (`http://127.0.0.1:8744/tools/letterboxd.html`) |
| `bundle:letterboxd` | Build the local Letterboxd tool bundle |
| `build` | Bundle + write static site to `build/` |

Worker tests (separate from site tests): `cd worker && npm test`.

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.

Movie metadata and images come from [The Movie Database](https://www.themoviedb.org/). This project is not affiliated with TMDB.
