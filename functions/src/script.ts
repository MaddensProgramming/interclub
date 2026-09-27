import { join } from 'path';
import { csvToJsonObject, convertToDivisions } from './readCSV';
import { DIVISION_FILE, ROUND_DATES, DIVISION_SIX_DATES, isRoundOpen, isImportSeason } from './season';
import { Division } from './models/Division';
import { DivisionFrbe } from './modelsFRBE';
import {
  populateRounds,
  groupTeamsByClub,
  fillTeamsAndPlayersWithInfoFromJson,
  createRoundOverviews,
  addPlayersToClubs,
  readCsvFile,
} from './transformationsMethods';
import { getAllResults, getPlayingHall } from './frbeGatewayCalls';

export const main = async (now = new Date()) => {
  if (!isImportSeason(now)) {
    console.log('INTERCLUB_IDLE: outside the configured season window');
    return;
  }
  const results = await getAllResults(now);
  if (!results.length && isRoundOpen(1, 1, now)) {
    console.warn('INTERCLUB_WAITING: FRBE has not published results; existing data retained');
    return;
  }
  const { publishSeason } = await import('./populateDb');
  if (!results.length) {
    const { seasonExists } = await import('./populateDb');
    if (await seasonExists()) {
      console.log('INTERCLUB_WAITING: season initialized; waiting for the first round');
      return;
    }
  }
  const { divisions, clubs, players, roundOverview } = await prepareImport(now, results, !results.length);
  const publication = await publishSeason(divisions, clubs, players, roundOverview);
  console.log(publication.unchanged ? 'INTERCLUB_UNCHANGED' : results.length ? 'INTERCLUB_UPDATED' : 'INTERCLUB_INITIALIZED: calendar and players; no results yet');
};

export const readAndProcessCsv = async () => {
  const csvData = await readCsvFile(join(__dirname, '..', DIVISION_FILE));
  const jsonData = csvToJsonObject(csvData);
  const divisions = convertToDivisions(jsonData);
  if (!divisions.length) throw new Error('No divisions in season CSV');
  divisions.forEach(populateRounds);
  return divisions;
};

export function validateResultCoverage(divisions: Division[], results: DivisionFrbe[], now = new Date()): void {
  for (const division of divisions) {
    // FRBE explicitly excludes 6J from its results manager.
    if (division.class === 6 && division.division === 'J') continue;
    const source = results.find((item) => item.division === division.class &&
      (item.index || 'A') === division.division);
    if (!source || !source.rounds.length) {
      throw new Error(`FRBE is missing series ${division.class}${division.division}; refusing partial import`);
    }
    const dates = division.class === 6 ? DIVISION_SIX_DATES : ROUND_DATES;
    for (let round = 1; round <= dates.length; round++) {
      if (!isRoundOpen(division.class, round, now)) continue;
      const published = source.rounds.find(item => item.round === round);
      if (!published) throw new Error(`FRBE is missing round ${round} in ${division.class}${division.division}; refusing partial import`);
      const expected = division.teams.flatMap(team => (team.rounds ?? []).filter(r =>
        r.id === round && r.teamHome.pairingsNumber === team.pairingsNumber &&
        r.teamHome.clubId !== 0 && r.teamAway.clubId !== 0));
      for (const match of expected) {
        const encounters = published.encounters.filter(e =>
          e.pairingnr_home === match.teamHome.pairingsNumber && e.pairingnr_visit === match.teamAway.pairingsNumber &&
          e.icclub_home === match.teamHome.clubId && e.icclub_visit === match.teamAway.clubId);
        if (encounters.length !== 1) throw new Error(`FRBE is missing or duplicating an encounter in ${division.class}${division.division}, round ${round}`);
      }
    }
  }
}

export const prepareImport = async (now = new Date(), resultsJson?: DivisionFrbe[], initialize = false) => {
  const divisions = await readAndProcessCsv();
  resultsJson = resultsJson ?? await getAllResults(now);
  if (!initialize) validateResultCoverage(divisions, resultsJson, now);
  else if (resultsJson.length || isRoundOpen(1, 1, now)) throw new Error('Calendar initialization is only allowed before the first round');
  const allTeams = divisions.flatMap((div) => div.teams);
  const clubs = groupTeamsByClub(allTeams);
  for (const club of clubs) {
    club.venues = await getPlayingHall(club.id);
  }
  await addPlayersToClubs(clubs);
  const players = clubs.flatMap((club) => club.players);
  // Ordinary 6J pairings cannot represent its official double round robin.
  fillTeamsAndPlayersWithInfoFromJson(
    resultsJson.filter((division) => !(division.division === 6 && division.index === 'J')),
    allTeams, players
  );
  return { divisions, clubs, players, roundOverview: createRoundOverviews(divisions) };
};
