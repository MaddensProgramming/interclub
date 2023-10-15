import * as fs from 'fs';
import { ClubView, Division, Player, RoundOverview, TeamView } from './models';
import { csvToJsonObject, convertToDivisions } from './readCSV';
import {
  populateRounds,
  updateClubWithPlayers,
  groupTeamsByClub,
  extractInfoFromResultsJson,
  createRoundOverview,
} from './transformationsMethods';
import {
  generateClassOverview,
  generateClubDocs,
  generateClubOverview,
  generateDivisions,
  generateHallOfFameOverview,
  generatePlayerOverview,
  generatePlayerSearchIndexOverview,
  generateRoundDates,
  generateRoundOverview,
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

const executeEveryRound = (
  divisions: Division[],
  roundOverview: RoundOverview,
  players: Player[],
  clubs: ClubView[]
): void => {
  generateDivisions(divisions);
  generateRoundOverview(roundOverview);
  generateHallOfFameOverview(players);
  generatePlayerOverview(players);
  generateTeamDocs(clubs);
  generateClubDocs(clubs);
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
    const roundOverview = createRoundOverview(divisions);

    executeEveryRound(divisions, roundOverview, players, clubs);
    //executeOncePerYear(divisions, clubs, players);
  } catch (error) {
    console.error(error);
  }
};

main();
