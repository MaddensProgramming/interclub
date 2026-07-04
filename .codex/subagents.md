# Interclub Subagent Playbook

This repo is small enough to keep subagents lightweight, but it has two clear work areas: the Angular app in `src/` and Firebase/data-loading code in `functions/`. Prefer a few focused agents over a large standing team.

## Core Subagents

### Angular App Builder

Use for user-facing Angular work: standalone components, templates, SCSS, routes, pipes, and services under `src/app/`.

Owns:
- `src/app/components/**`
- `src/app/services/**`
- `src/app/pipes/**`
- `src/app/app.routes.ts`
- `src/styles.scss`

Expected checks:
- `npm run build`
- `npm test -- --watch=false --browsers=ChromeHeadless` when tests are touched or behavior changes.
- For UI/layout changes, start `npm start` and inspect the affected route in a browser.

Notes:
- Keep components standalone and follow the current Angular 22 style.
- Do not edit Firebase functions unless the feature needs a backend/data change.
- Smoke-check affected lazy routes such as `/`, `/round/:id`, `/division/:id/:class`, `/club/:id`, `/player/:id`, `/feedback`, and `/reviews`.

### Firebase Data Pipeline Builder

Use for Firestore population, FRBE gateway calls, CSV parsing, domain models, and callable/scheduled functions.

Owns:
- `functions/src/**`
- `functions/*.csv`
- `functions/package.json`
- `functions/tsconfig.json`
- Shared model contracts imported by the Angular app from `functions/src/models/**`
- Firebase config only when required by the backend change.

Expected checks:
- `npm --prefix functions run build`
- If emulator behavior matters, use `npm --prefix functions run serve`.

Notes:
- Treat deployment commands as explicit user actions only.
- Keep data transformations testable and separate from Firebase side effects when practical.
- Be careful with `functions/src/models/**`: many Angular components and services import those types directly.

### Tester And Verification Agent

Use before merging larger changes, after migrations, or when behavior touches multiple routes/services/functions.

Owns:
- New or updated specs in `src/**/*.spec.ts`
- Test harness/config suggestions in `tsconfig.spec.json` and Angular test setup
- Verification reports for root and functions builds

Expected checks:
- `npm run build`
- `npm test -- --watch=false --browsers=ChromeHeadless`
- `npm --prefix functions run build`

Notes:
- The current test suite is minimal, so prioritize high-value specs for pipes, pure transformations, and service behavior.
- Report failures with the smallest useful reproduction and the owning area.

## Optional Review Modes

Use these as short-lived reviewer prompts, not standing agents, unless a change is broad or risky.

### Data Domain Reviewer

Use when changes affect Belgian interclub standings, rounds, team/player views, CSV inputs, or FRBE-derived models.

Owns:
- Read-only review by default
- `functions/src/transformationsMethods.ts`
- `functions/src/models/**`
- Angular views that display standings, rounds, players, and teams

Expected checks:
- Compare representative transformed data before and after the change when possible.
- Confirm labels, round numbers, team/player identity, and result/color handling stay consistent.

Notes:
- This role is valuable because data correctness is the product, even when the code change looks small.

### Release And Firebase Config Gatekeeper

Use before deploys or when Firebase config, Firestore rules, hosting targets, scheduled functions, or production build settings change.

Owns:
- `firebase.json`
- `.firebaserc`
- `firestore.rules`
- `firestore.indexes.json`
- Angular production build/deploy settings in `angular.json` and root `package.json`
- Functions deploy/predeploy behavior

Expected checks:
- `npm run build`
- `npm --prefix functions run build`
- Only run `npm run deploy-test`, `npm run deploy-prod`, or `npm --prefix functions run deploy` when deployment is explicitly requested.

Notes:
- Root `npm run deploy` chains build, test hosting deploy, and prod hosting deploy, so use it deliberately.

### PR Reviewer

Use as a final pass on risky or broad changes.

Owns:
- Review only unless explicitly asked to patch
- Regression risks, missing tests, accidental deploy/config changes, and Angular/Firebase boundary mistakes

Expected checks:
- Inspect `git diff --stat` and targeted diffs.
- Confirm the right builder/tester checks ran for the touched areas.

## Suggested Usage

- Small single-area change: use the relevant builder only.
- UI plus backend/data change: run Angular App Builder and Firebase Data Pipeline Builder with disjoint ownership, then Tester And Verification Agent.
- Data transformation change: use Firebase Data Pipeline Builder plus Data Domain Reviewer.
- Before a release or deploy: use Tester And Verification Agent plus Release And Firebase Config Gatekeeper.

Avoid spawning agents for tiny one-file edits where the validation command is obvious. The most useful pattern here is one implementation agent plus one verification/review agent.