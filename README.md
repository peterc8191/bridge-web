# Bridge (web)

A property app prototype: swipe through listings, save the ones you like, arrange viewings, and — for renters, landlords and tradespeople — report maintenance issues, quote on them, and accept quotes.

React 19 + TypeScript + Vite, installable as a PWA, deployed to GitHub Pages. **There is no backend yet**: all data lives in the browser's `localStorage` (see [Limitations](docs/features.md#limitations)).

## Quick start

```sh
npm install
npm run dev          # http://localhost:5173
```

Sign in with any seeded account (password **`password123`**):

| Email | Role | Notes |
|---|---|---|
| `usera@abc.com` | user | Tenant of 27 Elm Court (p3) and 64 Birchwood Ln (p7) |
| `landlorda@abc.com` | landlord | Owns listings p1–p6 |
| `landlordb@abc.com` | landlord | Owns listings p7–p12 |
| `tradea@abc.com` | tradesperson | Serves Denver, Minneapolis and Portland |

You can also browse and save listings as a guest without signing in.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm test` | Unit and component tests (Vitest + Testing Library) |
| `npm run test:e2e` | Builds, then runs browser tests and accessibility scans (Playwright + axe) against a local GitHub Pages stand-in |
| `npm run lint` / `npm run typecheck` | oxlint / `tsc -b` |
| `npm run build` | Production build into `dist/` (base path `/bridge-web/`; override with `BASE_PATH=/`) |

First time running e2e tests locally: `npx playwright install chromium`.

## Deployment

Pushing to `main` runs [CI](.github/workflows/ci.yml): lint, typecheck, unit tests, build, Playwright. If everything passes, it publishes `dist/` to the `gh-pages` branch, which GitHub Pages serves at `https://<user>.github.io/bridge-web/`. Pull requests run the same checks without deploying.

`npm run deploy` still pushes a local build to `gh-pages` manually if you ever need to bypass CI.

## Project layout

```
src/
  context/      AppDataProvider - all app state, scoped to the signed-in user
  lib/          storage (localStorage access), permissions (who can see/do what), nav counts
  hooks/        one store hook per data type (properties, issues, viewings, tenders, …)
  pages/        one component per route; read data via useAppData()
  components/   presentational pieces + RequireAuth route guard
  data/         seed data loaded on first visit
  test/         shared test fixtures and render helpers
e2e/            Playwright specs + GitHub Pages stand-in server
docs/           feature reference and architecture decisions
```

More detail:

- [docs/features.md](docs/features.md): what each screen and role can do, how data is stored, and known limitations
- [docs/architecture/0001-backend-for-existing-features.md](docs/architecture/0001-backend-for-existing-features.md): the planned backend
