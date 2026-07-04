# Interclub

Interclub is an Angular and Firebase project for browsing Belgian chess
interclub results. It visualizes clubs, teams, players, divisions, round
results, venues, rankings, and public feedback using data stored in Firestore.

The data pipeline lives in Firebase Functions. It reads the season division CSV,
fetches live interclub data from the FRBE/KBSB APIs, enriches the raw results
with player and team statistics, and writes the documents consumed by the
Angular frontend.

## Tech stack

- Angular 22 with standalone components and lazy-loaded routes
- Angular Material, RxJS, and ngx-toastr
- Firebase Hosting and Firestore
- Firebase Functions on Node.js 20
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
|   |-- division.csv             Active season division input
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
| `/fullRound` | Redirect to `/round/11` |
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

At the time of writing, several code paths are hard-coded to the `2025` season,
notably the Functions writers in `functions/src/populateDb.ts` and some frontend
round/last-update reads in `DataBaseService`.

## Data import pipeline

The scheduled Function is exported from `functions/src/index.ts` as
`updateRoundTimed`.

- Region: `europe-west1`
- Schedule: every 15 minutes
- Time zone: `Europe/Brussels`
- Runtime: Node.js 20
- Function options: 540 second timeout and 8 GB memory

The pipeline in `functions/src/script.ts` works as follows:

1. Read `functions/division.csv`.
2. Parse division headers and team rows in `readCSV.ts`.
3. Generate the 11-round pairing schedule in `transformationsMethods.ts`.
4. Fetch results, club players, and playing halls from FRBE/KBSB.
5. Calculate team standings, player scores, TPR, round overviews, and club data.
6. Write changed documents to Firestore through `populateDb.ts`.

External API endpoints used by `functions/src/frbeGatewayCalls.ts`:

```text
https://www.frbe-kbsb-ksb.be/api/v1/interclubs/anon/icseries?round={round}
https://www.frbe-kbsb-ksb.be/api/v1/interclubs/anon/icclub/{clubId}
https://www.frbe-kbsb-ksb.be/api/v1/interclubs/anon/venue/{clubId}
```

`executeEveryRound(...)` is currently called by the scheduled pipeline.
`executeOncePerYear(...)` exists for annual setup data such as division
overviews, club overview, round dates, and the simple player search index, but
it is currently commented out in `script.ts`.

## Local development

Install frontend dependencies:

```bash
npm install
```

Install Functions dependencies:

```bash
cd functions
npm install
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
- The Functions import code initializes Firestore with the Firebase client SDK
  in `functions/src/initiateDB.ts` instead of using the Admin SDK for writes.
- `functions/division.csv` is format-sensitive. Division headers must match the
  parser's expected `Division {number}{letter}` pattern, and team rows must look
  like `NNN Club Name TeamNumber`.
- `functions/src/populateDb.ts` uses a hard-coded season value. Update it before
  importing a new season.
- `executeOncePerYear(...)` currently launches async writers without awaiting
  them if it is re-enabled.
- `generateTeamDocs(...)` calls `updateIfChanged(...)` without awaiting each
  team write.
- `overviews/simplelayers` appears to be the player search index path used by
  the frontend. The name is likely a typo but is part of the current data
  contract.

