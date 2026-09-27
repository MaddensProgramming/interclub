# Interclub

Interclub is an Angular and Firebase project for browsing Belgian chess
interclub results. It visualizes clubs, teams, players, divisions, round
results, venues, rankings, and public feedback using data stored in Firestore.

The data pipeline lives in Firebase Functions. It reads the season division CSV,
fetches live interclub data from the FRBE/KBSB APIs, enriches the raw results
with player and team statistics, and writes the documents consumed by the
Angular frontend.

## Season 2026–2027

The new season was deployed and initialized on 27 September 2026. See [the season report](docs/season-2026-2027.md)
for official sources, the D6/6J calendar, validation and activation requirements.
FRBE opens each round after 14:00 Brussels time. The function initializes a
missing season before round one, then waits safely for published results.
6J currently has calendar support only. Follow the
[deployment runbook](docs/deploy-2026-2027.md) for restarting the scheduler.

## Tech stack

- Angular 22 with standalone components and lazy-loaded routes
- Angular Material, RxJS, and ngx-toastr
- Firebase Hosting and Firestore
- Firebase Functions on Node.js 22
- TypeScript for both frontend and Functions code

## Repository layout

```text
.
|-- src/                         Angular frontend
|   |-- app/
|   |   |-- components/          Pages and feature components
|   |   |-- services/            Firestore and shared UI state services
|   |   |-- pipes/               Display helpers for results, provinces, etc.
|   |   `-- models/              Frontend-only models
|   |-- environments/            Firebase config per Angular build target
|   `-- assets/                  Icons and images
|-- functions/                   Firebase Functions and data import pipeline
|   |-- src/
|   |   |-- models/              Shared DTOs also imported by the frontend
|   |   |-- script.ts            Main import/update pipeline
|   |   |-- populateDb.ts        Firestore document writers
|   |   |-- transformationsMethods.ts
|   |   |-- frbeGatewayCalls.ts  FRBE/KBSB API calls
|   |   `-- readCSV.ts           Division CSV parser
|   |-- division_2026.csv        Active season division input
|   |-- division.csv             Previous season input
|   |-- division_2023.csv        Historical input, not used by current script
|   `-- division_2024.csv        Historical input, not used by current script
|-- firebase.json                Hosting, Firestore, and Functions config
|-- firestore.rules              Firestore rules
|-- angular.json                 Angular project config
`-- package.json                 Frontend scripts and dependencies
```

## Frontend

The Angular app starts in `src/main.ts` and bootstraps `AppComponent` with the
router, animations, Toastr, and HttpClient. The root component provides the
toolbar, navigation, year selector, and `router-outlet`.

Routes are defined in `src/app/app.routes.ts`:

| Route | Purpose |
| --- | --- |
| `/` | Home page with club search, player search, and province club tree |
| `/feedback` | Feedback form |
| `/reviews` | Public feedback list |
| `/round/:id` | Full results for one round |
| `/fullRound` | Latest scheduled match day; round 11 for archived seasons |
| `/division/:id/:class` | Division standings |
| `/division` | Redirect to `/division/1/A` |
| `/club/:id` | Club page shell |
| `/club/:id/players` | Club player list |
| `/club/:id/location` | Club venue information |
| `/club/:id/:id/:tab` | Team page tabs for results, players, and rounds |
| `/player/:id` | Player detail page |
| `/hallOfFame` | Player ranking |
| `**` | Not-found page |

`src/app/services/database.service.ts` is the main data gateway. It initializes
Firebase, stores the selected season in `year$`, reads Firestore documents with
`getDoc`, caches loaded documents, and redirects to the not-found page when
required data is missing.

`src/app/services/review.service.ts` handles feedback. It writes messages to the
top-level `messages` collection and live-listens to recent public messages where
`showOthers == true`.

Several frontend components import shared data transfer objects directly from
`functions/src/models`. Keep this coupling in mind when changing model fields:
updates in Functions models can affect both the import job and the Angular app.

## Firebase data model

Most frontend data is scoped below a season document:

```text
years/{year}
years/{year}/clubOverview/overview
years/{year}/club/{clubId}
years/{year}/club/{clubId}/team/{teamId}
years/{year}/players/{playerId}
years/{year}/divisions/{classDivision}
years/{year}/overviews/divisions
years/{year}/overviews/players
years/{year}/overviews/simplelayers
years/{year}/dates/dates
years/{year}/roundOverview/{roundNumber}
messages/{messageId}
```

`functions/src/season.ts` selects the active season (`2026`, the starting year).
Frontend reads follow the selected year, including round results and last update.
Season dates are stored in `dates`, with optional `datesByDivision` overrides.

## Data import pipeline

The scheduled Function is exported from `functions/src/index.ts` as
`updateRoundTimed`.

- Region: `europe-west1`
- Schedule: every 15 minutes
- Time zone: `Europe/Brussels`
- Runtime: Node.js 22
- Function options: 540 second timeout, 8 GB memory, maximum one instance
- Import window: 20 September 2026 through 2 May 2027; idle outside this season

The pipeline in `functions/src/script.ts` works as follows:

1. Read the season CSV selected in `functions/src/season.ts`.
2. Parse division headers and team rows in `readCSV.ts`.
3. Generate eleven rounds for D1–5, nine for D6 and the special 6J encounters.
4. Verify the source season and results, then fetch club players and venues from FRBE/KBSB.
5. Calculate team standings, player scores, TPR, round overviews, and club data.
6. Write changed documents to Firestore through `populateDb.ts`.

External API endpoints used by `functions/src/frbeGatewayCalls.ts`:

```text
https://www.frbe-kbsb-ksb.be/api/v1/interclubs/anon/icseries?round={round}
https://www.frbe-kbsb-ksb.be/api/v1/interclubs/anon/icclub/{clubId}
https://www.frbe-kbsb-ksb.be/api/v1/interclubs/anon/venue/{clubId}
```

Every successful import awaits `publishSeason(...)`, which builds one final
value per document for overviews, calendars, clubs, teams, players and results.
An unchanged completed import uses one root read and zero writes. Changed
imports compare each document and write only differences; `Date` and Firestore
`Timestamp` values are compared at stored precision. Duplicate player IDs are
written once. The last-update timestamp advances only when data changes or an
interrupted import completes. See the deployment guide for recovery details.
Refreshing the search index also admits players added later in the season.
`preview:season` checks the calendar offline; `check:source` checks live results
without importing or initializing Firebase.
Use `npm --prefix functions run check:source -- --full` for a full read-only
preparation. `npm --prefix functions run check:published` checks the completed
season marker and representative documents using public frontend permissions.

## Local development

Use Node 22.23.3 (see `.nvmrc`). Install Firebase CLI separately with
`npm install -g firebase-tools@15.31.0` for emulator/deployment commands.
The project's `.npmrc` preserves compatibility with ngx-toastr's current peer
metadata; see the season report for that existing dependency limitation.

Install frontend dependencies:

```bash
npm ci
```

Install Functions dependencies:

```bash
cd functions
npm ci
cd ..
```

Run the Angular dev server:

```bash
npm start
```

Build the Angular app:

```bash
npm run build
```

Run the Angular test suite:

```bash
npm test
```

Build Functions:

```bash
cd functions
npm run build
```

Run Functions in the emulator:

```bash
cd functions
npm run serve
```

## Deployment

The default Firebase project is `interclub-668f3`.

Hosting targets in `.firebaserc`:

- `test` deploys to `interclub-668f3`
- `prod` deploys to `interclub`

Root deployment scripts:

```bash
npm run deploy-test
npm run deploy-prod
npm run deploy
```

For the new season, prefer these explicitly scoped commands in order:

```bash
npm run deploy-season:function
# Verify/resume the scheduler and wait for successful initialization first.
npm run deploy-season:test
npm run deploy-season:prod
```

The season hosting commands build the frontend and first refuse deployment if
the new season has no completed-import marker or its representative documents
are not publicly readable. Both hosting targets share the same Firestore
database. These commands do not deploy database rules or other functions.

`npm run deploy` builds the Angular app and deploys both hosting targets. It
does not deploy Functions.

Deploy Functions separately:

```bash
cd functions
npm run deploy
```

## Operational notes

- `firestore.rules` currently denies all reads and writes. The frontend expects
  to read Firestore directly, so deployed rules must match the intended public
  read and feedback-write behavior.
- Functions use the Admin SDK and the runtime service account; local writes
  would require Application Default Credentials, separately from Firebase CLI login.
- Season CSVs are format-sensitive: headers use `Division {number}{letter}`;
  team rows use `NNN Club Name TeamNumber` or `Bye N`. Preserve pairing slots.
- Active season, dates and pairing tables are configured in `functions/src/season.ts`.
- The public API is unversioned. Imports validate its calendar, opened rounds
  and encounters. Empty results wait without overwriting existing data.
- The import is not atomic across all documents. Use a test environment and a
  backup before production initialization.
- `overviews/simplelayers` appears to be the player search index path used by
  the frontend. The name is likely a typo but is part of the current data
  contract.

