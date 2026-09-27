import { ACTIVE_SEASON } from './season';

// Public reads exercise the same permissions as the website, without Admin SDK.
const base = `https://firestore.googleapis.com/v1/projects/interclub-668f3/databases/(default)/documents/years/${ACTIVE_SEASON}`;

async function check() {
  for (const path of ['', '/dates/dates', '/clubOverview/overview', '/overviews/divisions',
    '/overviews/simplelayers', '/divisions/1A', '/divisions/6A', '/divisions/6J',
    '/roundOverview/1', '/roundOverview/7', '/roundOverview/11', '/club/401', '/club/401/team/1']) {
    const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`Season ${ACTIVE_SEASON}${path} is not publicly readable (HTTP ${response.status}). Initialize and verify the function before hosting deployment.`);
    const data = await response.json() as { fields?: { lastUpdate?: { timestampValue?: string }; importPending?: { booleanValue?: boolean } } };
    if (!path && (!data.fields?.lastUpdate?.timestampValue || data.fields?.importPending?.booleanValue)) {
      throw new Error('Season has no completed import timestamp; do not switch hosting yet.');
    }
  }
  console.log(`Season ${ACTIVE_SEASON}: completed-import marker and representative frontend documents are publicly readable.`);
}

check().catch(error => { console.error(error.message); process.exitCode = 1; });
