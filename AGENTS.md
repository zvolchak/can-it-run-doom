# Project overview

Can It Run Doom? powers **canitrundoom.org**, an archive dedicated to preserving
and celebrating Doom ports across unusual devices, platforms, and environments.
The goal is to document the community's projects, credit their authors, and make
supporting media and source code easy to discover.

Visitors can browse and search the archive, filter entries by attributes such as
tags, authors, and year, and inspect individual projects. The application also
provides accounts, entry submissions, and a moderation workflow for reviewing
contributions before publication.

## Architecture

- **Web application:** Next.js with React and TypeScript, using the Pages Router,
  Redux Toolkit for client state, and SCSS and Tailwind CSS for styling.
- **API:** A separate Express application written in TypeScript, with routes
  under `/api/v1` for Doom ports, authors, tags, and users.
- **Backend services:** Firebase Firestore stores archive records and authors;
  Firebase Authentication handles accounts and sessions; Firebase Storage holds
  uploaded images. Pending submissions use a separate incoming collection.
- **Deployment:** Firebase Functions and Hosting configuration supports the API
  and server-rendered web application. Doppler supplies environment configuration
  through the package scripts.

## Repository structure

```text
api/                         Express API package
  index.ts                   App setup and Firebase Function export
  server.ts                  Standalone HTTP server entry point
  routes/                    Doom port, author, tag, and user endpoints
  middleware/                Request authentication and access checks
  utils/                     Firebase setup, database queries, and helpers
  @types/                    API data models and Express type extensions
webapp/                      Next.js frontend package
  src/pages/                 Pages, account flows, and entry submission/review
  src/components/            UI components, archive views, and forms
  src/layouts/               Shared page layout
  src/api/                   HTTP client and API request helpers
  src/store/                 Redux state for entries, filters, users, and settings
  src/types/                 Frontend data and API response types
  src/utils/                 Filtering, routing, and other frontend helpers
  src/styles/                SCSS styles
  public/                    Static assets, sitemaps, and bundled JSON datasets
  scripts/                   Production build helper
  ssr.js                     Custom server and Firebase SSR Function entry point
storage/images/              Repository image assets for archive entries
.github/workflows/           Deployment automation
firebase.json                Root Firebase deployment and emulator configuration
.firebaserc                  Firebase project aliases
firestore.indexes.json       Firestore index definitions
storage.rules                Firebase Storage access rules
package.json                 Root build, deployment, and configuration scripts
README.md                    Project introduction
```

## Working in this repository

- `api/` and `webapp/` have separate `package.json` and lock files. Install and
  run dependencies within the relevant package; the root scripts coordinate
  builds and deployment.
- Both packages declare Node.js 20. Their `npm run dev` scripts use Doppler;
  local development also depends on the appropriate Firebase configuration.
- The frontend fetches live archive entries through `webapp/src/api/`; Firestore
  queries live in `api/utils/queries.ts`. Bundled JSON files in `webapp/public/db/`
  are separate from that live request path.
- Entry and user types exist in both packages. When changing API contracts,
  check the corresponding frontend types and callers as well as the API models.

## Commands

`api/` and `webapp/` are independent npm packages (Node 20). Run commands from inside the package directory.

**API (`api/`)**
- `npm run dev`: runs `tsx server.ts` under nodemon via `doppler run` (needs Doppler access)
- `npm run build`: `tsc` into `dist/` (`build:staging` / `build:prod` first write `.env` from Doppler)
- `npm test`: `node --test tests/*.test.cjs`
- Single test file: `node --test tests/publication.test.cjs`; single test by name: add `--test-name-pattern "<name>"`

**Webapp (`webapp/`)**
- `npm run dev`: `next dev --turbopack` via Doppler
- `npm run build`: `next build`; `npm run lint`: `next lint`
- `npm run test:archive`: runs all `tests/*.test.mjs`
- Single test file: `node --test tests/archiveSearch.test.mjs`

**Deploy (repo root)**: `npm run deploy-{api,webapp}:{dev,prod}` builds the package and runs `firebase deploy --only functions:<api|webapp>`. `sync-*` scripts push Doppler secrets into Firebase functions config.

## Tests

Neither package uses a test framework or a TS loader. Tests use the built-in `node:test` and transpile the real TypeScript sources at runtime with `ts.transpileModule`:
- Webapp: `tests/compileModules.mjs` compiles the listed `src/...` files to CommonJS in a temp directory that has a symlink to `node_modules`. Each test lists every source file it transitively imports, including types and store slices. When a tested util gains a new relative import, add that file to the test's `compileModules([...])` list.
- API: `tests/publication.test.cjs` runs the real writer/approval modules against an in-memory fake Firestore (transactions, `Timestamp`, `doc`). It makes no Firebase or network calls.

## Architecture details

**API request pipeline** (`api/index.ts`): rate limiting is global at 10 requests/min per IP. Routers mount at `/api/v1`. The JSON and urlencoded body parsers are skipped for `/doom_ports/add` because that route parses multipart image uploads itself with busboy (`utils/bodyParsers.ts`). The same Express app is exported as the Firebase function `api` and served standalone by `server.ts`.

**Auth** (`api/middleware/index.ts`): `authenticate` verifies the Firebase `session` cookie. `authorizeByRole` checks the user's role claim, or a UID listed in `FB_ROOT_UID`. Both are bypassed when the request comes from localhost and `NODE_ENV=development`.

**Submission → publication flow**: new submissions go to the incoming collection (`doomPortsIncomingCollection`). `reviewEntries.ts` approves them into the public `doomPorts` collection inside a Firestore transaction. Server-owned date fields (`createdAt`, `updatedAt`, `addedAt`, `publicationState`) are computed only in `api/utils/publication.ts` and stripped from client input. `addedAt` is never invented for legacy records that lack it. Entry statuses are `pending`, `published`, `approved`, `rejected`, and `hidden`.

**Webapp data flow**: `src/api/index.ts` is the only HTTP client. Its axios instance uses `NEXT_PUBLIC_API_BASE_URL` with credentials, and published entries are fetched with cursor pagination (`utils/archiveRetrieval.ts`). After fetching, search, filtering, facets, and sorting run client-side in `src/utils/archive*.ts`. Filter state lives in the Redux `filters` slice. `archiveUrlCoordinator.ts` and `projectNavigation.ts` keep it in sync with the URL query, so archive views and the project modal can be shared by link and work with Back/Forward. Session state is read from a `user` cookie (`js-cookie`).

**Webapp hosting**: `next.config.mjs` uses `output: "standalone"`. `scripts/build_prod.sh` copies static assets into `.next/_next` and `.next/standalone`. `ssr.js` is both a custom local server and the `nextServer` Firebase function. Hosting rewrites all paths to that function (`firebase.json`).

**Path aliases**: in both packages, `@/*` maps to the package root. The webapp imports look like `@/src/types`. The API imports look like `@/utils` and resolve at runtime through `module-alias` (`dist`).

## Planning docs

`.planning/*.md` holds implementation plans for in-progress and completed frontend work, such as tag-first filters and the project modal. Each plan records its status, product decisions, and outstanding QA. Read the relevant plan before changing archive filtering, layout, or the recently-added homepage section.
