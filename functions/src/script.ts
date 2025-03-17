import { csvToJsonObject, convertToDivisions } from './readCSV';
import {
  populateRounds,
  groupTeamsByClub,
  fillTeamsAndPlayersWithInfoFromJson,
  createRoundOverviews,
  addPlayersToClubs,
  readCsvFile,
} from './transformationsMethods';
import { getAllResults, getPlayingHall } from './frbeGatewayCalls';
import { executeEveryRound, executeOncePerYear } from './populateDb';

export const main = async () => {
  try {
    // Read and transform CSV data
    const divisions = await readAndProcessCsv();

    // Fetch and process results data
    const { clubs, players } = await fetchAndProcessResults(divisions);

    // Generate round overviews
    const roundOverview = createRoundOverviews(divisions);

    console.log('All info read. Starting to write to DB.');
    //await executeOncePerYear(divisions, clubs, players);
    await executeEveryRound(divisions, roundOverview, players, clubs);
  } catch (error) {
    console.error('Error executing the main function:', error);
  }
};

const readAndProcessCsv = async () => {
  const csvData = await readCsvFile('./division.csv');
  const jsonData = csvToJsonObject(csvData);
  const divisions = convertToDivisions(jsonData);
  divisions.forEach(populateRounds);
  return divisions;
};

const fetchAndProcessResults = async (divisions) => {
  const allTeams = divisions.flatMap((div) => div.teams);
  const clubs = groupTeamsByClub(allTeams);
  for (const club of clubs) {
    club.venues = await getPlayingHall(club.id);
  }
  const resultsJson = await getAllResults();
  await addPlayersToClubs(clubs);
  const players = clubs.flatMap((club) => club.players);
  fillTeamsAndPlayersWithInfoFromJson(resultsJson, allTeams, players);
  return { clubs, players };
};
