# Movie collector

Search [TMDB](https://www.themoviedb.org/), add movies to ordered lists, and browse them as a cover grid, a list, or a full detail overlay. No account and no backend — your lists live in the browser, with optional sync to a private GitHub Gist.

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
2. Toggle **grid** and **list** view in the toolbar; the choice persists.
3. Click any card to open the detail overlay — poster, year, runtime, genres, rating, director, cast, and overview. Arrow keys move between movies; Escape closes. Overlays deep-link as `#movie/{id}`.
4. Drag the grip handle on a card or row to reorder. Reordering works in both views and saves immediately. The order you drag is the only order there is — there are no sort modes to disagree with it.
5. **Settings** stores your TMDB token and, optionally, connects GitHub Gist sync so lists follow you across devices.

### The three lists

Tabs under the search box switch between three fixed lists — **Favourites**, **Watchlist**, and **Watched** — each showing its own count. They are statuses rather than collections, so there is nothing to create, rename, or delete.

Two rules govern how they relate, and both follow from what the words mean:

- **Favourites is part of Watched.** You can't favourite a film you haven't seen, so favouriting also marks it watched. Favourited movies appear in the Watched tab with a star.
- **Watchlist is separate from both.** It means "haven't seen this yet", which rules out having watched or favourited it. Putting something on the watchlist clears both; marking it watched or favouriting it takes it off the watchlist.

That leaves three states a movie can be in: on the watchlist, watched, or watched and favourited. Both rules are enforced when state is read, not only when it's written, so no synced or hand-edited payload can produce a contradiction.

**Watchlist:** each card has a **Watch** button that marks the film as watched (it leaves this tab). **Watched** and **Favourites:** click the star to favourite or un-favourite. **Remove** (× on a card, or **Remove movie** in the detail overlay) drops the film from your entire collection after a confirmation.

### Browser storage keys

| Key | Contents |
|-----|----------|
| `moviecollector-user-state` | The three lists with their ordered `movieIds`, active list, view preference |
| `moviecollector-tmdb-auth` | Your TMDB read access token only |
| `moviecollector-gist-sync` | GitHub Gist credentials (`token`, `gistId`) when connected |

**Gist sync security:** the PAT is stored in `localStorage`. Use a throwaway GitHub account and a fine-grained PAT limited to gist read/write. Neither the PAT nor the TMDB credential is written into the synced Gist file.

## Deploy

```bash
npm run build    # writes build/
```

`build/` is a plain static directory — `index.html`, bundled CSS, the JS bundle, and a `noindex` robots file. Routing is hash-only, so no server rewrite rules are needed. Point any static host at it.

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
