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
