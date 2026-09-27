import { getAllResults } from './frbeGatewayCalls';
import { readAndProcessCsv, validateResultCoverage, prepareImport } from './script';
import { isRoundOpen } from './season';

async function check() {
  const divisions = await readAndProcessCsv();
  const results = await getAllResults();
  if (!results.length) {
    console.log(isRoundOpen(1, 1)
      ? 'WAITING: FRBE feed is empty after the scheduled start; no import or writes.'
      : 'WAITING: FRBE opens round one after 14:00 Europe/Brussels; no result data expected yet.');
    if (process.argv.includes('--full') && !isRoundOpen(1, 1)) {
      const prepared = await prepareImport(new Date(), results, true);
      console.log(`Calendar initialization dry run passed: ${prepared.clubs.length} clubs, ${prepared.players.length} players. No Firestore writes.`);
    }
    return;
  }
  validateResultCoverage(divisions, results);
  if (process.argv.includes('--full')) {
    const prepared = await prepareImport(new Date(), results);
    console.log(`Full import dry run passed: ${prepared.clubs.length} clubs, ${prepared.players.length} players.`);
  }
  console.log(`FRBE source check passed: ${results.length} series. No Firestore writes.`);
}
check().catch((error) => { console.error(error.message); process.exitCode = 1; });
