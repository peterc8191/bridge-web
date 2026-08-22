# bridge-web

Web project for Bridge.

## Property Swipe (prototype)

A Tinder-style swiping app for browsing property listings: one listing at a time, swipe or tap right to save it, left to pass. Each listing has multiple photos — tap the left or right side of the card to step back/forward through them, shown via a progress bar across the top (photo position resets whenever a new listing becomes active). Every listing is either **For Sale** or **For Rent** (a badge shown on every card/row/detail view) — sale prices are the total price, rent prices are monthly and formatted with a "/mo" suffix, via one shared `formatPrice` helper so the two are never confused. The Discover screen has a collapsible filter bar (listing type, location, min/max price, minimum bedrooms) that narrows the deck live — collapsed by default to keep the deck front and center, with a "Filters (n)" toggle showing how many are active. Already-decided listings stay excluded regardless of the filter, and a distinct "no listings match your filters" state shows when the filter (not your swipe history) is why the deck is empty. Saved listings are viewable on a separate page and persist across reloads (no backend — decisions are stored in `localStorage`, and listing data is a local mock dataset).

An **Issues** tab lets you report a problem to a property's owner for any listing you've saved: pick the property, add a title and description, and it's added with status "Open". The report form is collapsible (collapsed by default, same pattern as the Discover filter bar) so it doesn't crowd out the issues list. The tab lists every reported issue (newest first) with its status (Open / In Progress / Resolved) and which property it's about — a couple of issues are seeded for demo purposes so the tab isn't empty on first load. Reporting is disabled with a hint until you've saved at least one property, since issues are always tied to a specific listing. Signed-in **landlords** see a status dropdown on each issue instead of the read-only badge, so they can move it through Open → In Progress → Resolved themselves.

Each issue has a collapsible **Tenders** section (visible only to landlords and tradespeople). A **tradesperson** can tender a quote — amount + message — on any issue they haven't already quoted on; the quote is submitted alongside a snapshot of their services/areas from their trader profile, so a landlord sees who's bidding without needing to look anyone up separately. A **landlord** sees every tender on an issue and can **Accept** any pending one; accepting automatically rejects every other still-pending tender on that same issue (only one trader can do the job), while tenders on other issues are left untouched. A trader can't tender twice on the same issue — once they have one (any status), the form is replaced with a note instead.

Clicking a listing on the **Saved** page opens its **property detail page** (`/property/:id`): every photo (main image + a tap-to-switch thumbnail strip), the full address/price/specs/description, any viewings you've already requested for that listing, and a form to **arrange a viewing** (date, time, optional note). A requested viewing always starts as **Pending** (no backend/owner to confirm it) and persists in `localStorage`, reappearing on that listing's page. "Remove" on the Saved page stays a separate control from the link, so removing a listing never accidentally opens it and vice versa.

A **Viewings** tab (`/viewings`) lists every viewing you've requested, across all properties, split into two sections: **Upcoming** (soonest first) and **Past** (most recent first, at the bottom) — so what's coming up is always at the top and history fades toward the bottom. Each entry shows the property, date/time, and a **Confirmed**/**Pending** status badge, and the whole row links through to that property's detail page. A few example viewings are seeded (covering all four combinations of past/upcoming × confirmed/pending) so the page demonstrates every state on first load. Signed-in **landlords** get a "Confirm viewing" button on every Pending entry (upcoming or past) to mark it Confirmed themselves.

The nav bar is responsive: Discover is always a direct link; Saved, Viewings, Issues, Settings, and Log in/Log out are one set of items shown two ways depending on width — an inline row on wider screens, or collapsed behind a single "More" button below 640px so the bar doesn't crowd on mobile. The "More" button is styled to match the other nav links (same text, weight, active underline, no button chrome, just a small chevron) so it reads as part of the nav rather than a distinct control, and shows the active route's name in place of "More" when relevant. Its menu (not a native `<select>`, so it's fully themed) closes on selection, on Escape, or on an outside click. Folding Log in/Log out into this same system (rather than a separate always-visible control) means login state doesn't add a second thing to the nav bar.

A **Settings** tab holds:
- **Theme** — System / Light / Dark, defaulting to System (follows the OS preference live, including if it changes while the app is open). The whole app is re-themed via CSS custom properties in `src/index.css`, not just the settings page — colors, borders, and status badges all switch. Listing photo cards intentionally stay black/white-on-photo in both themes (readability over real photos, not app chrome).
- **Reduce motion** — turns off the swipe/spring animations on the Discover screen (durations drop to 0 and the card-stack transition is disabled) for motion-sensitive users. Drag-to-swipe itself still works; only the animated transitions are removed.
- **Your data** — reset saved/passed properties, or clear everything you've reported on the Issues tab. Both are local-only (no account/server) and ask for confirmation first since they can't be undone.

**Log in** and **Register** screens (`/login`, `/register`) provide real account creation/authentication within the constraints of a backend-less app: registering hashes the password (salted SHA-256 via the Web Crypto API — never stores the raw password) and creates an account + session; logging in verifies against that hash. Both screens redirect straight to Discover if you're already signed in. Accounts have a **role** (`user` / `landlord` / `tradesperson`) — self-registration always creates a plain `user`; the other roles exist on the three seeded test accounts below. Signed-in status, email, and role are visible on the **Settings** page's Account section (with its own Log out), and "Log in"/"Log out" live as an entry inside the nav bar's **More** menu/dropdown alongside Saved, Viewings, Issues, and Settings, rather than as a separate always-visible control. Be clear-eyed about what this is: accounts and sessions live only in this browser's `localStorage` (no server, so no real security boundary and no cross-device sync) and don't yet gate or scope any of the app's data — Saved/Issues/Viewings/Settings remain shared across whoever uses this browser, regardless of who's logged in. Wiring real per-user data is the "real accounts" phase of the backend plan in `docs/architecture/0001-backend-for-existing-features.md`.

Three test accounts are seeded so login can be exercised immediately, all sharing the password **`password123`**:

| Email | Role |
|---|---|
| `usera@abc.com` | user |
| `landlorda@abc.com` | landlord |
| `tradea@abc.com` | tradesperson |

A **landlord** has every ability a regular user has, plus three more: confirming viewing requests (Viewings tab), updating an issue's status (Issues tab), and full control over the listing catalog via **Manage listings** — a landlord-only nav entry (also folded into the More system) linking to `/manage-listings`, where a landlord can edit or delete any existing property or add a brand-new one (`/manage-listings/new`, `/manage-listings/:id/edit`), choosing **For Sale** or **For Rent** on the same form — the price field's label switches between "Price ($)" and "Monthly rent ($)" to match. "Upload" here means entering one photo URL per line — there's no file storage in a client-only app, so this is the honest equivalent of the mock-photo approach already used everywhere else. Listings created or edited this way flow through the exact same live catalog every other screen reads from (Discover, Saved, Issues, Viewings, property detail), persisted in `localStorage`; deleting a listing someone has bookmarked or has open makes it vanish from the deck/saved list and fall back to "Unknown property"/"not found" wherever it's still referenced, the same fallback already used for any dangling reference. Like the rest of the role system, there's no ownership model — any landlord account can manage every listing, not just ones they created, since the app has no concept of "which landlord owns which property" without a backend.

A **tradesperson** ("trader") likewise keeps every regular-user ability, plus a **Trader profile** — a tradesperson-only nav entry linking to `/trader-profile` — where they set a short bio, the services they offer, and the areas they cover (both one-per-line lists, same input pattern as everywhere else in the app), which is what gets attached to every tender they submit, plus the ability to tender quotes on issues (see above).

**Stack:** React 19 + TypeScript, Vite, React Router, Framer Motion (drag/swipe gestures), Vitest + React Testing Library for tests.

### Structure

```
src/
  types/property.ts        Property (incl. listingType) / PropertyInput / ListingType, PropertyFilters shapes
  types/issue.ts            Issue / IssueStatus / NewIssueInput shapes
  types/settings.ts          Theme / ResolvedTheme shapes
  types/viewing.ts            ViewingRequest (incl. confirmed) / NewViewingInput shapes
  types/auth.ts                AuthUser (incl. role) / StoredUser / AuthResult / UserRole shapes
  types/tender.ts               Tender (incl. status) / NewTenderInput / TenderStatus shapes
  types/traderProfile.ts         TraderProfile (services / areas / bio) shape
  data/properties.ts       Seed listing data (12 properties, 4 placeholder photos each; 8 for sale, 4 for rent)
  data/issues.ts            Seed issues shown on first load
  data/viewings.ts           Seed viewings (one of each past/upcoming x confirmed/pending)
  data/authUsers.ts           Three seed test accounts (user/landlord/tradesperson, password123)
  data/traderProfiles.ts        Seed profile for the seeded tradesperson account
  data/tenders.ts                Seed tenders covering pending/accepted/rejected
  hooks/usePropertyCatalog.ts Seed listings + landlord-added/edited/deleted overrides, persisted in localStorage;
                              the single live "properties" list every other screen reads from
  hooks/usePropertyDeck.ts Deck/saved state (takes the live catalog as an argument) + localStorage persistence (+ reset)
  hooks/useIssues.ts        Seed issues + user-reported issues + landlord status overrides, persisted in
                              localStorage (+ clearAddedIssues, updateIssueStatus)
  hooks/useSettings.ts       Theme (+ system-preference resolution) and reduceMotion, persisted in localStorage;
                              applies data-theme to <html> so CSS variables re-theme the app
  hooks/useViewings.ts        Seed viewings + user-requested viewings + landlord confirmations, persisted in
                              localStorage (+ confirmViewing)
  hooks/useAuth.ts             Seed test accounts + user-registered accounts (salted-hash password) + session,
                                persisted in localStorage
  hooks/useTenders.ts           Seed tenders + user-added tenders + status overrides (accept/auto-reject
                                siblings), persisted in localStorage
  hooks/useTraderProfile.ts      Current signed-in trader's profile, keyed per user id so switching accounts
                                in the same browser doesn't clobber another trader's profile
  components/
    PropertyCard.tsx       Swipeable card (drag + programmatic swipe) with tap-to-browse photos
    SwipeDeck.tsx           Stacked deck + like/pass buttons
    ActionButtons.tsx       Like/pass buttons
    FilterBar.tsx           Listing type / location / price / bedrooms filter controls
    IssueForm.tsx            Collapsible report-an-issue form (property picker + title + description)
    IssueList.tsx            Reported issues list, newest first; status badge (or a select for landlords);
                              renders IssueTenders per item
    StatusBadge.tsx          Open / In Progress / Resolved badge
    IssueTenders.tsx          Collapsible per-issue tender list + landlord Accept + trader quote form
    TenderStatusBadge.tsx     Pending / Accepted / Rejected badge (reuses the Issue status color tokens)
    ListingTypeBadge.tsx      For Sale / For Rent badge, used on every card/row/detail view
    ViewingForm.tsx           Date/time/note form to request a viewing for one property
    ViewingList.tsx           A property's requested viewings, soonest first
    PropertyForm.tsx          Shared create/edit listing fields (address/city/listing type/price or monthly
                              rent/beds/baths/sqft/description/photo URLs), used by both the create and edit routes
    NavBar.tsx              Discover always visible; Saved/Viewings/Issues/Manage listings (landlord only)/
                              Trader profile (tradesperson only)/Settings/Log in-Log out live in the "More" system
                              (inline row on desktop, dropdown menu under 640px)
  pages/
    Discover.tsx            Swipe deck screen ("/") — owns filter state, derives the filtered deck
    Saved.tsx                Saved listings screen ("/saved") — each item links to its detail page
    PropertyDetail.tsx        Full listing details + photo gallery + arrange-a-viewing ("/property/:id")
    Viewings.tsx               All requested viewings, Upcoming/Past sections, status badges + landlord
                              Confirm button ("/viewings")
    Issues.tsx                Report/track issues screen ("/issues")
    ManageListings.tsx         Landlord-only listing catalog: edit/delete each property, add a new one
                              ("/manage-listings")
    PropertyFormPage.tsx       Landlord-only create/edit page wrapping PropertyForm
                              ("/manage-listings/new", "/manage-listings/:id/edit")
    TraderProfilePage.tsx      Tradesperson-only bio/services/areas edit form ("/trader-profile")
    Settings.tsx              Account (signed-in email/role or log in/register prompt), theme, reduce motion,
                              and data-reset controls ("/settings")
    Login.tsx                 Sign-in form ("/login")
    Register.tsx               Account-creation form ("/register")
  utils/filterProperties.ts Pure filter predicate incl. listing type (unit tested independent of the UI)
  utils/sortViewings.ts       Pure past/upcoming split + sort (unit tested with an injectable "now")
  utils/formatViewingTime.ts   Shared date/time formatting for ViewingList and the Viewings page
  utils/formatPrice.ts         Shared price formatting - total for sale, "/mo" suffix for rent
  utils/passwordHash.ts        Salted SHA-256 password hashing (Web Crypto API)
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

### Progressive Web App

The app is installable and works offline once loaded, via [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/) (Workbox under the hood):

- **Manifest** (`vite.config.ts`) — name "Bridge", `theme_color`/`background_color` matching the app's accent and light background, `display: "standalone"` (launches without browser chrome), and both a regular and a **maskable** 512×512 icon (the maskable one keeps the logo mark safely inside the ~60% "safe zone" so Android's adaptive-icon masks — circle, squircle, etc. — don't clip it). Icons were generated from `logo/short-logo.png` (the bridge/houses mark, not the full text lockup, which would be illegible at icon sizes) onto a white square canvas; the source PNGs live in `public/` (`pwa-192x192.png`, `pwa-512x512.png`, `pwa-maskable-512x512.png`, `apple-touch-icon.png`).
- **`start_url`/`scope` are `"."`** (relative to the manifest's own location) rather than absolute `/` paths — required for the same reason `vite.config.ts` uses `base: './'`: this has to resolve correctly under whatever subpath GitHub Pages serves it from, without hardcoding the repo name.
- **Service worker** — `registerType: "autoUpdate"` (Workbox `generateSW` strategy): precaches the built JS/CSS/HTML/icons for offline use and updates silently in the background on new deploys, no manual "reload to update" prompt. Its navigation fallback routes any request back to `index.html`, which needs no special handling here since the app already uses `HashRouter` (see above) — every route is the same document with a different URL fragment, so there's no server-side-routing mismatch for the service worker to work around.
- **`index.html`** also carries `theme-color`, `apple-touch-icon`, and the `apple-mobile-web-app-*` meta tags directly, since iOS historically leans on these more than the manifest for "Add to Home Screen."
- Service workers require a secure context (HTTPS or `localhost`) — both `npm run dev`/`npm run preview` and the eventual GitHub Pages deployment (always HTTPS) satisfy this.

Verified via `npm run build` + a `vite preview` smoke test: `manifest.webmanifest`, `sw.js`, `registerSW.js`, and all four icon files build with correct relative (`./`) paths and serve with 200s. This session did **not** include an actual "Add to Home Screen" / Lighthouse install-prompt check in a real browser — do that pass before treating installability itself as verified, the same caveat as the rest of the UI.

### Verified

- `tsc -b` — typechecks clean
- `vitest run` — 271 tests passing, including: `useTenders` (add, accept-rejects-siblings-on-the-same-issue-only, persistence), `useTraderProfile` (per-user isolation, re-reads on a user-id change, seed fallback), `IssueTenders` (role-gated visibility, expand/collapse, tender details rendering, landlord Accept only on pending tenders, trader form vs. "already tendered" note, validation), `TraderProfilePage` (role-gated redirect, pre-fill, parsed-list submission), an end-to-end report→tender→accept flow across role switches on the Issues page, and the tradesperson-only "Trader profile" nav entry — plus: `formatPrice` and `ListingTypeBadge` (sale vs. rent formatting/labels), the Discover/FilterBar listing-type filter, and the For Sale/For Rent badge + formatted price rendering on PropertyCard, PropertyDetail, Saved, and Manage Listings — plus: `usePropertyCatalog` (add/edit/delete for both seed and landlord-created listings, persistence), landlord-only status control on Issues and Confirm control on Viewings (visible only for the landlord role, hidden for a generic user and when logged out, calling the right hook function with the right id), `PropertyForm`/`ManageListings`/`PropertyFormPage` (validation incl. the required-at-least-one-photo-URL and positive-price checks, pre-fill on edit, redirect-to-home for non-landlords and redirect-to-list for an unknown edit id, delete-after-confirmation, navigate-to-detail-page on save), the landlord-only "Manage listings" nav entry, password hashing (deterministic, salted, never leaks the raw password), `useAuth` (register/login/logout validation and error cases, session/account persistence, and logging into all three seed accounts incl. case-insensitive email and rejecting a duplicate/seed-colliding email), the Login/Register pages (redirect-if-already-signed-in, validation, error display, navigate-on-success), the Settings page's Account section, and the nav bar's Log in/Log out entry in both the desktop row and the mobile More menu — plus everything from prior features: deck/save logic, swipe button interactions, photo tap-navigation and its boundaries, location/price/bedroom filtering and the collapse/expand toggle, issue reporting/listing/persistence, the issue form's own collapse/expand toggle, the saved-property-required empty state, theme resolution incl. live system-preference changes and persistence, reduce-motion's effect on the swipe animations, the settings page's confirm-before-reset actions, nav bar tab counts/logo/links plus the mobile "More" menu's active-label button, open/select/navigate, and close-on-Escape/outside-click behavior, the Saved page's link-vs-remove separation, property detail rendering/photo-switching/not-found state, viewing scheduling/persistence/per-property filtering, and the Viewings page's past/upcoming split, sort order, status badges, and click-through link to the property
- `npm run build` — production build succeeds; confirmed the emitted `dist/index.html` references assets with relative (`./assets/...`) paths as expected from the `base: './'` change; also emits `manifest.webmanifest`, `sw.js`, `registerSW.js`, and the four PWA icon files with correct relative paths (see "Progressive Web App" above) — not a real-browser install/Lighthouse check
- Dev server confirmed serving the app and `main.tsx` loading (200 OK) — not manually clicked through in a browser in this session, so do a visual pass (`npm run dev`) before treating the UI itself as verified.
- `npm run deploy` itself was **not** run — no git remote is configured on this repo yet (see "Deploying to GitHub Pages" below).

### Notes / next steps

- Listing photos are placeholder images (picsum.photos, seeded per listing) — swap for real photos/CDN when there's real data.
- No backend: the property catalog, decisions, issues, and viewings all live in `localStorage`. Landlord edits/creates/deletes are stored as an id-keyed override layer on top of the seed data (`usePropertyCatalog`) rather than mutating it, mirroring the seed+overrides pattern already used for issues/viewings. A backend architecture plan for storing/processing all of this (stack, data model, API surface, and a low-risk migration path that keeps every hook's interface unchanged) is written up in [`docs/architecture/0001-backend-for-existing-features.md`](docs/architecture/0001-backend-for-existing-features.md) — not implemented, decision/plan only, and predates the landlord role work.
- The landlord role has no ownership model: any landlord account can manage every listing, confirm any viewing, and update any issue's status — there's no "which landlord owns which property" concept without a backend and real per-user data (see the ADR above).
- Tenders are denormalized: a tender snapshots the trader's services/areas at submission time rather than looking them up live from a shared profile registry (which this app doesn't have). If a trader edits their profile afterward, their past tenders keep showing the services/areas as they were when quoted — arguably correct (a quote reflects who you were then), but worth knowing.
- Tendering has no per-property or per-area matching — any tradesperson can tender on any issue anywhere, regardless of the "areas serviced" they've listed on their own profile. Areas/services are informational for the landlord's review, not an enforced eligibility filter.
- "Uploading" a listing photo means pasting a URL (one per line) — there's no file storage in a client-only app, so this matches the placeholder-photo approach already used for the seed listings.
- Min/max price filtering applies to whatever's currently shown, sale or rent mixed — since rent prices are monthly (hundreds-to-low-thousands) and sale prices are totals (hundreds of thousands+), a min/max price range only makes sense once you've also picked a listing type. This isn't specially handled; select a listing type first if you want a meaningful price range.
- Login/Register are real client-side auth (salted-hash accounts, real session state) but **not real account security** — there's no server, so anyone with devtools access to the browser can read `localStorage`. It also doesn't yet scope any app data per-user; that requires the backend described in the architecture ADR. `crypto.subtle` (used for hashing) needs a "secure context," which `localhost` and GitHub Pages (HTTPS) both satisfy, so this works in dev and once deployed.
