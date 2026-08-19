# Movie collector

Search [TMDB](https://www.themoviedb.org/), add movies to ordered lists, and browse them as a cover grid or a full detail overlay. No account and no backend — your lists live in the browser, with optional sync to a private GitHub Gist.

## How it works

The only thing this site stores is **which TMDB ids are in which list, and in what order**. Nothing about a movie is duplicated locally. Every page load rehydrates the records from TMDB by id, through a stale-while-revalidate cache so repeat loads paint instantly from the browser's Cache API and refresh in the background.

That means the precious data is tiny (a few hundred bytes of ids), and everything else is disposable by construction — a cleared cache costs you one slow reload, never a lost list.

## Run it locally

```bash
npm install
npm run serve    # http://localhost:8743
```

Then open **Settings** (bottom right) and paste your TMDB **API Read Access Token**. Without one the grid renders skeleton cards and search returns nothing.

### Getting a TMDB credential

1. Create an account at [themoviedb.org/signup](https://www.themoviedb.org/signup)
2. Go to [Settings → API](https://www.themoviedb.org/settings/api) and request a **Developer** key (approval is instant for personal projects)
3. Copy the **API Read Access Token** — the long JWT, not the shorter API Key above it — and paste it into Settings

Only the v4 read access token is accepted. It is sent as `Authorization: Bearer` and never appears in a URL, so it stays out of query strings, referrers, and server logs. Settings validates the shape before saving and tells you if you pasted the v3 API Key by mistake, then verifies the token against TMDB so a bad value fails once instead of once per movie.

The token is stored in your browser's `localStorage` under `moviecollector-tmdb-auth` and is never committed, never sent anywhere except TMDB, and never included in Gist sync.

## Using the site

1. Type in the search box to get TMDB autocomplete. Arrow keys navigate, Enter or click adds the movie to the active list.
2. Toggle **card** and **detail** view in the toolbar; the choice persists.
3. Click any card to open the detail overlay — poster, year, runtime, genres, rating, director, cast, and overview. Arrow keys move between movies; Escape closes. Overlays deep-link as `#movie/{id}`.
4. On **Watched**, use the **Sort** dropdown for display order (custom order, release year, fan rating, my rating, title). Sort never changes stored order; switch back to **Custom order** to drag-reorder. **Watchlist** is always manual order.
5. On **Watched** or **Watchlist**, tap **reorder** (bottom left) to unlock drag handles when **Custom order** is selected. Tap again to lock when finished.
6. **Settings** stores your TMDB token and, optionally, connects GitHub Gist sync so lists follow you across devices.

### The two lists

Tabs under the search box switch between two fixed lists — **Watched** and **Watchlist** — each showing its own count. They are statuses rather than collections, so there is nothing to create, rename, or delete.

One rule governs how they relate:

- **Watchlist is disjoint from Watched.** It means "haven't seen this yet", which rules out having watched it. Putting something on the watchlist clears watched; marking it watched takes it off the watchlist.

That leaves two states a movie can be in: on the watchlist, or watched. The rule is enforced when state is read, not only when it's written, so no synced or hand-edited payload can produce a contradiction.

**Watchlist:** each card has a **Watch** button that marks the film as watched (it leaves this tab). **Remove** (× on a card, or **Remove movie** in the detail overlay) drops the film from your entire collection after a confirmation.

### Browser storage keys

| Key | Contents |
|-----|----------|
| `moviecollector-user-state` | The two lists with their ordered `movieIds`, per-movie statuses, active list, view preference |
| `moviecollector-user-state-backup` | The payload from just before the last merge, kept for recovery |
| `moviecollector-tmdb-auth` | Your TMDB read access token only |
| `moviecollector-hosted-session` | Opaque hosted-access session token (Netlify only; not synced) |
| `moviecollector-gist-sync` | GitHub Gist credentials (`token`, `gistId`) when connected |

**Gist sync security:** the PAT is stored in `localStorage`. Use a throwaway GitHub account and a fine-grained PAT limited to gist read/write. Neither the PAT nor the TMDB credential is written into the synced Gist file. The Gist is private, titled **Movie collector sync**, and holds a single file: `moviecollector-state.json`.

### How sync avoids losing movies

A tab left open holds its own copy of your lists, so a naive "newest payload wins" push lets a stale tab overwrite everything another tab added. Sync is built to make that impossible:

- **Read before write.** Every save fetches the Gist, merges, and only then writes. A payload that cannot be read is never overwritten — the change stays local and retries later.
- **One request at a time.** All syncs run through a single promise chain, so two overlapping read/write pairs cannot interleave.
- **Per-movie timestamps, not per-payload.** Each movie carries a status (`watched`, `watchlist`, or `removed`) stamped with when it last changed. Merging compares those stamps, so a stale tab contributes its edit instead of replacing the payload. Acting in a stale tab bumps the payload's `updatedAt` but not any movie's stamp, which is what makes this work.
- **Removal is recorded, not inferred.** A missing id means "never heard of it" and the movie is kept. Deleting writes a `removed` record, so removals survive a stale tab while re-adding a film outranks the older removal.
- **Ties keep the movie.** If two stamps match exactly, the film stays.
- **Tabs self-heal.** A background tab merges in another tab's write immediately and re-checks the Gist whenever it regains focus, then shows a notice explaining what changed.

Recovery, if you ever need it: every push creates a GitHub Gist revision, so the remote keeps full history, and `moviecollector-user-state-backup` holds the payload from just before the last merge.

## Deploy

```bash
npm run build    # writes build/
```

`build/` is a plain static directory — `index.html`, bundled CSS, the JS bundle, `images/`, and a `noindex` robots file. Routing is hash-only, so no server rewrite rules are needed beyond what [`netlify.toml`](netlify.toml) provides for Netlify Functions.

### Netlify (optional hosted TMDB access)

For a personal deploy you can keep your TMDB read token on the server so casual visitors never see it. Set two environment variables in **Site configuration → Environment variables**:

| Variable | Purpose |
|----------|---------|
| `TMDB_READ_TOKEN` | Your v4 TMDB API Read Access Token |
| `HOSTED_SITE_PASSWORD` | Password for the hidden unlock flow |

Build command: `npm run build`. Publish directory: `build`. Functions live in [`netlify/functions/`](netlify/functions/).

**Hidden unlock:** triple-click the projector logo, enter the site password, and the browser stores an opaque session token (not the password). TMDB API calls then go through `/api/tmdb`; poster images still load directly from TMDB. Triple-click again when unlocked to lock hosted access on this browser.

Casual visitors see the normal site — paste a TMDB token in Settings, or browse lists without search/hydration. The hosted path is intentionally undocumented in the UI.

Threat model: obscurity for casual users, not anti-brute-force. Anyone who discovers the auth endpoint can attempt the password.

### Local development

| Command | Use |
|---------|-----|
| `npm run serve` | Static site only; use your own TMDB token in Settings |
| `netlify dev` | Static site **and** `/api/auth` + `/api/tmdb` functions (install [Netlify CLI](https://docs.netlify.com/cli/get-started/)); env vars from Netlify or a local `.env` file (gitignored) |

Point any other static host at `build/` if you are not using Netlify Functions.

## Project layout

| Path | Role |
|------|------|
| `index.html` | UI shell (loads `js/app-bundle.js`) |
| `js/app/` | App source partials; `npm run bundle` regenerates the bundle |
| `js/app/00-*.js` | Generated from `scripts/lib/` — do not hand-edit |
| `css/` | Styles; load order in [`scripts/css-manifest.js`](scripts/css-manifest.js) |
| `scripts/lib/` | Pure CommonJS domain logic (tested) |
| `test/` | Node tests |
| `server.js` | Read-only static server for local viewing |
| `build.js` | Static deploy build |
| `netlify.toml` | Netlify build settings and `/api/*` redirects |
| `netlify/functions/` | Hosted auth + TMDB proxy (Netlify only) |

Vanilla HTML/CSS/JS — no TypeScript, no framework, no runtime dependencies. `express` is a devDependency used only by the local server.

## npm scripts

| Script | Purpose |
|--------|---------|
| `serve` | Local static server on port 8743 (`PORT` to override) |
| `bundle` | Sync `js/app/00-*.js` from `scripts/lib/`, then concatenate `js/app-bundle.js` |
| `test` | Run Node tests (`test/`) |
| `build` | Write the static site to `build/` |

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.

Movie metadata and images come from [The Movie Database](https://www.themoviedb.org/). This project is not affiliated with TMDB.
