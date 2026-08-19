# ADR 0001: Backend to store and process existing app functionality

## Context

bridge-web is currently a fully client-side React SPA (Vite + TypeScript). Every piece of state lives in the browser:

| Concern | Current implementation |
|---|---|
| Property catalog | Hardcoded array, `src/data/properties.ts` (12 mock listings) |
| Swipe decisions (pass/save) | `usePropertyDeck` — two id arrays in `localStorage` (`bridge:decided-property-ids`, `bridge:saved-property-ids`) |
| Reported issues | `useIssues` — seed data (`src/data/issues.ts`) + user-added issues in `localStorage` (`bridge:added-issues`) |
| Viewing requests | `useViewings` — seed data (`src/data/viewings.ts`) + user-added in `localStorage` (`bridge:viewing-requests`) |
| Theme / reduce-motion | `useSettings` — `localStorage` (`bridge:theme`, `bridge:reduce-motion`) |

There is **no concept of a user** — everything is scoped to one anonymous browser. Nothing survives a cleared cache, a new device, or a second person using the app. There is also no owner-facing surface at all: issue status and viewing confirmation are set once (seed data) and never change, because nothing outside the browser can change them.

The request is to design a backend that stores and processes this same functionality — not to invent new product scope.

## Decision

### Stack

| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript (Node.js) | Matches the frontend; request/response types can be shared via a `packages/shared` types package instead of hand-duplicated. |
| API style | REST, JSON | The app's data shape is simple CRUD-on-a-handful-of-resources, not deeply nested or query-flexible. GraphQL would add tooling cost this app doesn't need. |
| Framework | Fastify | Lightweight, typed, good defaults; Express would work equally well if the team already knows it better. |
| Database | PostgreSQL | Every entity below is genuinely relational (foreign keys to `users` and `properties`). No document/graph shape anywhere in the current feature set. |
| ORM | Prisma | Type-safe queries matching the TS-everywhere stack; migrations are simple enough for this schema size. |
| Auth | Session cookie via a managed auth library (Lucia, or Auth.js if session storage in Postgres is preferred) | See "Identity" below — this is new scope, kept intentionally minimal (email+password or magic link; no OAuth/social login unless asked for). |
| Image storage | Unchanged for now — `Property.images` stays a list of URLs | No upload UI exists in the app. Object storage (S3/R2) is a follow-up, not part of "existing functionality." |
| Hosting | Small managed Node host (Render/Fly.io) + managed Postgres (Neon/Supabase/RDS) | Matches current scale — a handful of tables, no high-throughput requirement. Avoids serverless cold-start/connection-pooling complexity this app doesn't need yet. |

### Data model

```
User            id, email, password_hash | auth_provider_id, created_at

Property        id, address, city, price, beds, baths, sqft, description
PropertyImage   id, property_id (fk), url, position

PropertyDecision  id, user_id (fk), property_id (fk), direction ('left'|'right'), decided_at
                  — append-only swipe log. Source of truth for "already decided, exclude from deck."

SavedProperty     id, user_id (fk), property_id (fk), saved_at
                  — separate from PropertyDecision so "Remove" from Saved can delete this row
                    without erasing swipe history (mirrors today's two-localStorage-key design exactly).

Issue           id, user_id (fk, reporter), property_id (fk), title, description,
                status ('open'|'in_progress'|'resolved'), created_at

ViewingRequest  id, user_id (fk), property_id (fk), date, time, note,
                confirmed (bool), created_at

UserSettings    user_id (fk, pk), theme ('system'|'light'|'dark'), reduce_motion (bool)
```

`PropertyDecision` vs `SavedProperty` as two tables (not one row with a `removed` flag) is the one non-obvious modeling call here — it's required to reproduce the current behavior exactly: removing a saved property must **not** make it reappear in the swipe deck.

### API surface

Endpoints map 1:1 onto what the four data hooks already do — this is deliberate, see "Frontend migration" below.

| Endpoint | Replaces |
|---|---|
| `GET /properties` | `import { properties }` |
| `GET /properties/:id` | `properties.find(...)` in `PropertyDetail` |
| `GET /me/decisions` | initial `decidedIds`/`savedIds` read |
| `POST /me/decisions` `{propertyId, direction}` | `usePropertyDeck.decide` |
| `DELETE /me/saved/:propertyId` | `usePropertyDeck.removeSaved` |
| `DELETE /me/decisions` (bulk) | `usePropertyDeck.reset` |
| `GET /me/issues` | `useIssues` combined (seed+added) list |
| `POST /me/issues` `{propertyId, title, description}` | `useIssues.addIssue` |
| `DELETE /me/issues` (bulk, own issues only) | `useIssues.clearAddedIssues` |
| `PATCH /issues/:id` `{status}` | **not built in the frontend yet** — reserved for an owner-facing surface |
| `GET /me/viewings` | `useViewings` combined list |
| `POST /me/viewings` `{propertyId, date, time, note}` | `useViewings.scheduleViewing` |
| `PATCH /viewings/:id` `{confirmed}` | **not built in the frontend yet** — reserved for an owner-facing surface |
| `GET/PUT /me/settings` | `useSettings` (optional — see below) |
| `POST /auth/login`, `/auth/logout`, `GET /auth/session` | new — required for `/me/*` to mean anything |

Seed data (`data/issues.ts`, `data/viewings.ts`, the current mock property list) becomes a one-time database seed script instead of a module import.

### Identity is the actual gap, not the CRUD

The four feature hooks are simple CRUD against four tables — that part is mechanical. The real decision this ADR is making is: **a backend only produces value here if there's a user to key data on.** Two options:

1. **Real accounts now** (recommended path, described above) — enables cross-device sync and is a prerequisite for any future owner-facing portal (confirming viewings, resolving issues).
2. **Anonymous device-id cookie, no login** — server-side stand-in for what `localStorage` already does, just moved server-side. Lower effort, but doesn't actually solve "a second device/person doesn't see the same data," which is the main reason to want a backend at all.

Given the app has zero auth UI today, recommend **phasing** rather than deciding this in one step (see Rollout).

### Frontend migration

The existing hook *interfaces* should not change:

```ts
usePropertyDeck() -> { deck, saved, decide, removeSaved, reset }
useIssues()       -> { issues, addIssue, clearAddedIssues }
useViewings()     -> { viewings, scheduleViewing }
useSettings()     -> { theme, setTheme, resolvedTheme, reduceMotion, setReduceMotion }
```

Only their *internals* change, from synchronous `localStorage` reads to `fetch` calls (with optimistic updates so `decide`/`addIssue`/`scheduleViewing` still feel instant). Every page and component (`Discover`, `SwipeDeck`, `Saved`, `Issues`, `Viewings`, `PropertyDetail`, `Settings`) keeps its current props and needs no changes beyond handling a loading state on first mount, where today they render instantly. This is the main thing that keeps this migration low-risk: the boundary between "UI" and "state source" was already clean before this ADR.

`useSettings` is the one hook that can reasonably stay `localStorage`-only indefinitely — theme/reduce-motion have no cross-device requirement stated anywhere in the current product. Migrate it only if/when account settings need to follow the user across devices.

## Consequences

- New scope beyond today's app: authentication (however minimal), a database, a deployed API service, and a seed/migration step for the current mock data. This is real infrastructure the project doesn't have yet — hosting cost and an ops surface (deploys, migrations, backups) that didn't exist when everything lived in `localStorage`.
- Components gain loading/error states they don't have today (current reads are synchronous and can't fail; API reads can).
- `Issue.status` and `ViewingRequest.confirmed` become genuinely changeable for the first time — the backend should expose `PATCH` endpoints for both even though no frontend UI calls them yet, so the "owner confirms/updates" gap called out in the main README's Notes section has somewhere to attach to later without a second migration.
- Anonymous users who used the app pre-backend have their `localStorage` data stranded — out of scope for this ADR (a one-time client-side "import your local data" flow would be the way to handle it, decide separately if needed).

## Rollout

1. Properties catalog + decisions/saved, keyed by an anonymous device-id cookie (server-side equivalent of today's `localStorage`, no login yet). Lowest risk, ships the core swipe/save loop against a real database.
2. Issues + viewings endpoints, same device-id identity.
3. Real accounts/auth; migrate device-id data to accounts on first login.
4. Owner-facing endpoints get a UI (confirm viewings, update issue status) — new product surface, out of scope for "existing functionality" but the schema above already supports it without rework.
