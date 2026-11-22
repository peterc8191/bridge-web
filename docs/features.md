# Features and behaviour

Reference for what the app does and why it behaves the way it does. For setup and scripts, see the [README](../README.md).

## Roles

| | Guest | User (tenant) | Landlord | Tradesperson |
|---|---|---|---|---|
| Swipe and save listings | ✓ (one shared guest list per browser) | ✓ | ✓ | ✓ |
| Request, see and cancel own viewings | – | ✓ | ✓ | ✓ |
| Report issues | – | On properties they rent | On properties they rent | On properties they rent |
| See issues | – | Their own reports | Reports on their own listings | Unresolved issues in their service areas, plus any they've quoted on |
| Change issue status | – | – | Own listings only | – |
| Quote (tender) on issues | – | – | – | Issues in their areas, one quote per issue |
| See quotes | – | – | All quotes on their own listings | Only their own |
| Accept a quote | – | – | Own listings only | – |
| Confirm or decline viewing requests | – | – | Own listings only | – |
| Add, edit and delete listings | – | – | Own listings only | – |

These rules are pure functions in [`src/lib/permissions.ts`](../src/lib/permissions.ts). `AppDataProvider` uses them in two ways: it filters every list down to what the user may see, and it refuses any action the user may not take. Pages never check roles themselves. Route-level access (signed-in only, landlord only, tradesperson only) is declared once in [`App.tsx`](../src/App.tsx) with `<RequireAuth>`. A signed-out visitor who opens a guarded page goes to Log in and is sent back to that page afterwards.

## Screens

**Discover (`/`)** shows listings one at a time. Swipe or tap ♥ to save, swipe or tap ✕ to pass, and tap ↺ to undo the last swipe (as many times as you like within the session). Tap the left or right side of a card to step through its photos. The collapsible filter bar narrows the deck by listing type, location, price and bedrooms. The price range only unlocks once you choose For Sale or For Rent, because sale totals and monthly rents can't be compared. It's labelled "$/mo" for rentals and clears whenever the listing type changes.

**Saved (`/saved`)** lists saved listings. Each one links to its detail page, and Remove is a separate button. Saved lists are per account, and guests share one list in each browser.

**Property detail (`/property/:id`)** shows a photo gallery, the full details, your own viewing requests for that listing (with Cancel), and a form to request a viewing. The landlord who owns the listing sees an Edit link instead of the form.

**Viewings (`/viewings`)** splits requests into Upcoming (soonest first) and Past (most recent first). Each request has a status: Pending, Confirmed, Declined or Cancelled. Requesters can cancel upcoming requests. Landlords see who asked and can Confirm or Decline pending requests on their own listings. To reschedule, cancel and request a new time.

**Issues (`/issues`)** is where tenants report problems on the properties they rent. A landlord makes someone a tenant by adding their email to a rental listing. Landlords manage status (Open → In Progress → Resolved) and review quotes. Accepting one quote rejects the other pending quotes on that issue. Tradespeople see issues in their service areas, matched exactly against the listing's "City, ST", and quote on them.

**Manage listings (`/manage-listings`, landlord only)** lets a landlord create, edit and delete their own listings. Photos can be uploaded (up to 6 per listing; resized to JPEG and stored with the listing) or pasted as URLs. Rentals also take a list of tenant emails.

**Trader profile (`/trader-profile`, tradesperson only)** holds a bio, services and service areas. Each quote stores a copy of the profile as it was when submitted, so later profile edits don't change past quotes.

**Settings (`/settings`)** shows account details and Log out. It also has the theme setting (System, Light or Dark, applied to this device), Reduce motion (turns off swipe animations), and two data resets that ask for confirmation first: saved/passed listings, and issues you've reported.

**Nav badges** count what needs your attention:

- **Landlords:** pending viewing requests and open issues on their listings
- **Tradespeople:** issues they can still quote on
- **Everyone else:** upcoming viewings and their own unresolved reports

Until there's a backend to send email or push notifications, these badges stand in for them.

## Data and storage

- All reads and writes go through [`src/lib/storage.ts`](../src/lib/storage.ts). Keys are versioned (`bridge:v2:*`) and IDs are UUIDs (`crypto.randomUUID`), so they stay unique across reloads, tabs and accounts.
- Each data type is one list in storage, seeded from `src/data/` on first visit. Seed viewing dates are relative to that first visit, so there are always upcoming and past examples.
- [`useStoredState`](../src/hooks/useStoredState.ts) listens for the browser's `storage` event. Changes made in one tab, including logging in or out, show up in other open tabs straight away.
- If a write fails (storage full, which uploaded photos can cause, or storage blocked), a banner tells the user the change wasn't saved.
- **Migration from v1:** on startup, data saved by the old version is removed. That data had no owner information, and its IDs came from a counter that restarted on every page load, so they could collide. Accounts, the current session and appearance settings are kept, and any account IDs that collided are given new ones.

## Routing and deployment

- `BrowserRouter` runs under the base path `/bridge-web/`. GitHub Pages can't route single-page apps itself, so the build emits a `404.html` that redirects `/bridge-web/some/route` to `/bridge-web/?/some/route`, and a script in `index.html` turns that back into the clean URL before the app starts. This technique comes from [spa-github-pages](https://github.com/rafgraph/spa-github-pages).
- Old `#/route` links from the earlier HashRouter build redirect to the clean URL.
- The service worker serves the app shell offline, answers any navigation with `index.html`, and caches listing photos as they're viewed, so listings you've already seen keep their photos offline. Photos that fail to load show a neutral placeholder.

## Accessibility

Playwright runs [axe](https://github.com/dequelabs/axe-core) on every main screen in light and dark themes, on both desktop and mobile viewports, and CI fails on serious or critical WCAG 2.1 AA violations. Colour tokens in `src/index.css` are chosen to meet 4.5:1 contrast. The accent is a deeper coral (`#d6283a`) than the logo's `#ff5864`, which is still the PWA theme colour.

## Limitations

These all need the backend described in [ADR 0001](architecture/0001-backend-for-existing-features.md):

- **No real security.** Accounts, roles and permissions are enforced only in the UI. Anyone with browser devtools can edit `localStorage`, including their own role. Passwords are salted and hashed, but that isn't a security boundary here.
- **One browser only.** There's no sync across devices, and two people only "share" data if they use the same browser.
- **No notifications.** Landlords and tenants aren't emailed about new requests, quotes or status changes. The nav badges are the in-app substitute.
- **No landlord-offered viewing slots.** Renters propose a time, and the landlord confirms or declines it.
- **Limited photo storage.** Uploaded photos are kept in `localStorage`, which holds about 5 MB per browser, so only a handful of listings can carry uploaded photos.
- Tenancy is just a list of emails on a listing. There are no invitations, lease dates or move-outs.
