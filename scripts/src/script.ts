import * as fs from 'fs';
import { ClubOverview, ClubView, ProvinceOverview, TeamView } from './models';
import { csvToJsonObject, convertToDivisions } from './readCSV';
import { populateRounds } from './populateRounds';
import {
  generateClubDocs,
  generateClubOverview,
  generateDivisions,
  generatePlayerOverview,
  generateRoundDates,
  generateTeams,
} from './populateDb';

export type DivisionMap = { [key: string]: TeamView[] };

fs.readFile('./division.csv', 'utf8', (err, csvData) => {
  if (err) {
    console.error(`Error reading the file: ${err}`);
    return;
  }

  const jsonData = csvToJsonObject(csvData);
  const divisions = convertToDivisions(jsonData);
  divisions.forEach((div) => populateRounds(div));

  const allTeams = divisions.flatMap((div) => div.teams);
  const clubs = groupTeamsByClub(allTeams);

  //generateClassOverview(divisions);
  //generateDivisions(divisions);
  //generatePlayerOverview();
  //generateClubDocs(clubs);
  //generateClubOverview(clubs);
  generateTeams(clubs);
  generateRoundDates();

  //console.log(JSON.stringify(divisions[0]));
});

const groupTeamsByClub = (teams: TeamView[]): ClubView[] => {
  const clubMap: { [key: number]: ClubView } = {};

  for (const team of teams) {
    if (!clubMap[team.clubId]) {
      clubMap[team.clubId] = {
        id: team.clubId,
        name: team.clubName,
        players: [],
        teams: [],
      };
    }
    clubMap[team.clubId].teams.push(team);
  }

  return Object.values(clubMap);
};
