import * as fs from 'fs';
import { ClubView, Division, Player, RoundOverview, TeamView } from './models';
import { csvToJsonObject, convertToDivisions } from './readCSV';
import {
  populateRounds,
  updateClubWithPlayers,
  groupTeamsByClub,
  extractInfoFromResultsJson,
  createRoundOverviews,
} from './transformationsMethods';
import {
  generateClassOverview,
  generateClubDocs,
  generateClubOverview,
  generateDivisions,
  generateHallOfFameOverview,
  generateLastUpdated,
  generatePlayerOverview,
  generatePlayerSearchIndexOverview,
  generateRoundDates,
  generateRoundOverviews,
  generateTeamDocs,
} from './populateDb';
import { getAllResults } from './frbeGatewayCalls';

const readCsvFile = (path: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) reject(`Error reading the file: ${err}`);
      else resolve(data);
    });
  });
};

const updateAllClubsSequentially = async (clubs: ClubView[]) => {
  for (const club of clubs) {
    await updateClubWithPlayers(club);
  }
};

const executeEveryRound = async (
  divisions: Division[],
  roundOverview: RoundOverview[],
  players: Player[],
  clubs: ClubView[]
): Promise<void> => {
  await generateDivisions(divisions);
  console.log('Divisions done');

  await generateHallOfFameOverview(players);
  console.log('Hall Of fame done');

  await generatePlayerOverview(players);
  console.log('Player overview done');

  await generateTeamDocs(clubs);
  console.log('Teamdocs done');

  await generateClubDocs(clubs);
  console.log('Clubdocs done');

  await generateLastUpdated();
  console.log('Date set');

  await generateRoundOverviews(roundOverview);
  console.log('Roundoverview done');
};

const executeOncePerYear = (
  divisions: Division[],
  clubs: ClubView[],
  players: Player[]
) => {
  generateClassOverview(divisions);
  generateRoundDates();
  generateClubOverview(clubs);
  generatePlayerSearchIndexOverview(players);
};

export const main = async () => {
  try {
    const csvData = await readCsvFile('./division.csv');
    const jsonData = csvToJsonObject(csvData);
    const divisions = convertToDivisions(jsonData);
    divisions.forEach(populateRounds);

    const allTeams = divisions.flatMap((div) => div.teams);
    const clubs = groupTeamsByClub(allTeams);
    const json = await getAllResults();
    await updateAllClubsSequentially(clubs);
    const players = clubs.flatMap((club) => club.players);

    extractInfoFromResultsJson(json, allTeams, players);
    const roundOverview = createRoundOverviews(divisions);

    console.log('All info read starting to write');

    await executeEveryRound(divisions, roundOverview, players, clubs);
    //executeOncePerYear(divisions, clubs, players);
  } catch (error) {
    console.error(error);
  }
};

main();
