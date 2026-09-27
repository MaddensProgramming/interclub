import { readAndProcessCsv } from './script';
import { createRoundOverviews, groupTeamsByClub } from './transformationsMethods';
import { ACTIVE_SEASON, ROUND_DATES, DIVISION_SIX_DATES } from './season';

readAndProcessCsv().then((divisions) => {
  const teams = divisions.flatMap((division) => division.teams);
  console.log(JSON.stringify({
    season: ACTIVE_SEASON,
    series: divisions.length,
    teams: teams.filter((team) => team.clubId !== 0).length,
    clubs: groupTeamsByClub(teams).length,
    byes: teams.filter((team) => team.clubId === 0).length,
    roundDates: ROUND_DATES,
    divisionSixDates: DIVISION_SIX_DATES,
    matchesPerMatchDay: createRoundOverviews(divisions).map((overview, index) => ({
      matchDay: index + 1,
      matches: overview.divisions.reduce((total, division) => total + division.matches.length, 0),
    })),
    note: 'Offline calendar preview. No network requests or Firestore writes. 6J results require a separate official source.',
  }, null, 2));
}).catch((error) => { console.error(error.message); process.exitCode = 1; });
