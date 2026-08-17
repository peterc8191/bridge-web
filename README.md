# bridge-web

Web project for Bridge.

## Property Swipe (prototype)

A Tinder-style swiping app for browsing property listings: one listing at a time, swipe or tap right to save it, left to pass. Each listing has multiple photos — tap the left or right side of the card to step back/forward through them, shown via a progress bar across the top (photo position resets whenever a new listing becomes active). The Discover screen has a collapsible filter bar (location, min/max price, minimum bedrooms) that narrows the deck live — collapsed by default to keep the deck front and center, with a "Filters (n)" toggle showing how many are active. Already-decided listings stay excluded regardless of the filter, and a distinct "no listings match your filters" state shows when the filter (not your swipe history) is why the deck is empty. Saved listings are viewable on a separate page and persist across reloads (no backend — decisions are stored in `localStorage`, and listing data is a local mock dataset).

An **Issues** tab lets you report a problem to a property's owner for any listing you've saved: pick the property, add a title and description, and it's added with status "Open". The report form is collapsible (collapsed by default, same pattern as the Discover filter bar) so it doesn't crowd out the issues list. The tab lists every reported issue (newest first) with its status (Open / In Progress / Resolved) and which property it's about — a couple of issues are seeded for demo purposes so the tab isn't empty on first load. Reporting is disabled with a hint until you've saved at least one property, since issues are always tied to a specific listing.

A **Settings** tab holds:
- **Theme** — System / Light / Dark, defaulting to System (follows the OS preference live, including if it changes while the app is open). The whole app is re-themed via CSS custom properties in `src/index.css`, not just the settings page — colors, borders, and status badges all switch. Listing photo cards intentionally stay black/white-on-photo in both themes (readability over real photos, not app chrome).
- **Reduce motion** — turns off the swipe/spring animations on the Discover screen (durations drop to 0 and the card-stack transition is disabled) for motion-sensitive users. Drag-to-swipe itself still works; only the animated transitions are removed.
- **Your data** — reset saved/passed properties, or clear everything you've reported on the Issues tab. Both are local-only (no account/server) and ask for confirmation first since they can't be undone.

**Stack:** React 19 + TypeScript, Vite, React Router, Framer Motion (drag/swipe gestures), Vitest + React Testing Library for tests.

### Structure

```
src/
  types/property.ts        Property shape, PropertyFilters shape
  types/issue.ts            Issue / IssueStatus / NewIssueInput shapes
  types/settings.ts          Theme / ResolvedTheme shapes
  data/properties.ts       Mock listing data (12 properties, 4 placeholder photos each)
  data/issues.ts            Seed issues shown on first load
  hooks/usePropertyDeck.ts Deck/saved state + localStorage persistence (+ reset)
  hooks/useIssues.ts        Seed issues + user-reported issues, persisted in localStorage (+ clearAddedIssues)
  hooks/useSettings.ts       Theme (+ system-preference resolution) and reduceMotion, persisted in localStorage;
                              applies data-theme to <html> so CSS variables re-theme the app
  components/
    PropertyCard.tsx       Swipeable card (drag + programmatic swipe) with tap-to-browse photos
    SwipeDeck.tsx           Stacked deck + like/pass buttons
    ActionButtons.tsx       Like/pass buttons
    FilterBar.tsx           Location / price / bedrooms filter controls
    IssueForm.tsx            Collapsible report-an-issue form (property picker + title + description)
    IssueList.tsx            Reported issues list, newest first, with status badges
    StatusBadge.tsx          Open / In Progress / Resolved badge
    NavBar.tsx              Discover / Saved / Issues / Settings navigation
  pages/
    Discover.tsx            Swipe deck screen ("/") — owns filter state, derives the filtered deck
    Saved.tsx                Saved listings screen ("/saved")
    Issues.tsx                Report/track issues screen ("/issues")
    Settings.tsx              Theme, reduce motion, and data-reset controls ("/settings")
  utils/filterProperties.ts Pure filter predicate (unit tested independent of the UI)
```

### Run it

```
npm install
npm run dev       # start the dev server
npm run build     # production build (runs typecheck first)
npm test          # run the test suite (vitest)
```

### Deploying to GitHub Pages

```
npm run deploy    # builds, then pushes dist/ to the gh-pages branch
```

One-time setup before this works:

1. This repo needs a GitHub remote: `git remote add origin <your-repo-url>` (and the repo must exist on GitHub).
2. After the first `npm run deploy`, go to the repo's **Settings → Pages** and set Source to "Deploy from a branch", branch `gh-pages`, folder `/(root)`. GitHub will publish the site at `https://<user>.github.io/<repo>/`.

Two things were changed specifically to make this work reliably as a project-page deployment (i.e. served from a subpath, not a custom domain):

- **`vite.config.ts` uses `base: './'`** (relative asset paths) instead of the default `/`, so the build works under whatever subpath GitHub Pages serves it from without needing to hardcode the repo name.
- **Routing switched from `BrowserRouter` to `HashRouter`** (`src/main.tsx`). GitHub Pages serves static files with no server-side rewrite, so a direct link or a hard refresh on `/saved`, `/issues`, etc. would 404 under `BrowserRouter`. Routes now live in the URL hash (e.g. `.../#/saved`), which never reaches the server, so this works regardless of host. The trade-off is the `#` in every URL.

I haven't run `npm run deploy` in this session — there's no git remote configured on this repo yet, and pushing to GitHub is something to confirm with you first.

### Verified

- `tsc -b` — typechecks clean
- `vitest run` — 92 tests passing (deck/save logic, swipe button interactions, photo tap-navigation and its boundaries, location/price/bedroom filtering and the collapse/expand toggle, issue reporting/listing/persistence, the issue form's own collapse/expand toggle, the saved-property-required empty state, theme resolution incl. live system-preference changes and persistence, reduce-motion's effect on the swipe animations, the settings page's confirm-before-reset actions, nav bar tab counts/logo/Settings link — unit and integration — saved-list rendering and removal, empty and no-matches states)
- `npm run build` — production build succeeds; confirmed the emitted `dist/index.html` references assets with relative (`./assets/...`) paths as expected from the `base: './'` change
- Dev server confirmed serving the app and `main.tsx` loading (200 OK) — not manually clicked through in a browser in this session, so do a visual pass (`npm run dev`) before treating the UI itself as verified.
- `npm run deploy` itself was **not** run — no git remote is configured on this repo yet (see "Deploying to GitHub Pages" below).

### Notes / next steps

- Listing photos are placeholder images (picsum.photos, seeded per listing) — swap for real photos/CDN when there's real data.
- No backend: properties are hardcoded in `src/data/properties.ts` and saved/passed decisions live in `localStorage`. Wiring to a real API is a later step, not part of this prototype.
- Issues have no owner-facing UI to change status (Open → In Progress → Resolved) — that's the property owner's side, which this prototype doesn't model. The two seed issues demonstrate what the other statuses look like.
