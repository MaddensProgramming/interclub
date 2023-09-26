import * as fs from 'fs';
import {
  ClubOverview,
  ClubView,
  Division,
  DivisionRound,
  Game,
  Player,
  PlayingHall,
  ProvinceOverview,
  ResultEnum,
  Round,
  RoundOverview,
  TeamView,
} from './models';
import { csvToJsonObject, convertToDivisions } from './readCSV';
import { populateRounds } from './populateRounds';
import {
  generateClassOverview,
  generateClubDocs,
  generateClubOverview,
  generateDivisions,
  generatePlayerOverview,
  generateRoundDates,
  generateRoundOverview,
} from './populateDb';
import {
  getGameResult,
  revertResult,
  getScoreWhite,
  getScoreBlack,
} from './utility';
import { GetTpr } from './utility';
import { getAllResults } from './frbeGatewayCalls';
import { getPlayers } from './frbeGatewayCalls';
import { DivisionFrbe } from './modelsFRBE';

export type DivisionMap = { [key: string]: TeamView[] };

const updateAllClubsSequentially = async (clubs) => {
  for (const club of clubs) {
    await updateClubWithPlayers(club);
  }
};

fs.readFile('./division.csv', 'utf8', (err, csvData) => {
  if (err) {
    console.error(`Error reading the file: ${err}`);
    return;
  }
  async function main() {
    const jsonData = csvToJsonObject(csvData);
    const divisions = convertToDivisions(jsonData);
    divisions.forEach((div) => populateRounds(div));

    const allTeams = divisions.flatMap((div) => div.teams);
    const clubs = groupTeamsByClub(allTeams);
    const json = await getAllResults();
    await updateAllClubsSequentially(clubs);
    const players = clubs.flatMap((club) => club.players);

    extractInfoFromResultsJson(json, allTeams, players);

    // players.forEach((player) => (player.games = []));
    // allTeams.forEach((team) => (team.players = []));

    const roundOverview: RoundOverview = createRoundOverview(divisions);

    generatePlayerOverview(players);
    //generateClassOverview(divisions);
    //generateDivisions(divisions);
    //generateClubDocs(clubs);
    //generateClubOverview(clubs);
    //generateRoundDates();
    //generateRoundOverview(roundOverview);
  }

  main();
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
const updateClubWithPlayers = async (club: any) => {
  const frbePlayer = await getPlayers(club.id);
  if (frbePlayer) {
    club.players = frbePlayer.map((player) => {
      let lastNumberMatch;
      if (player?.titular) lastNumberMatch = player.titular.match(/\d+$/);
      return {
        id: player.idnumber,
        rating: player.assignedrating,
        ratingNat: player.natrating,
        ratingFide: player.fiderating,
        firstName: player.first_name,
        name: player.last_name,
        clubId: club.id,
        clubName: club.name,
        score: 0,
        numberOfGames: 0,
        tpr: player.assignedrating,
        team: lastNumberMatch != null ? parseInt(lastNumberMatch[0], 10) : null,
      };
    });
    club.teams.forEach(
      (team) =>
        (team.players = club.players.filter(
          (player) => player.team === team.id
        ))
    );
  } else {
    console.log('No players for ', club.id);
  }
};
function createRoundOverview(divisions: Division[]): RoundOverview {
  return {
    divisions: divisions.map((div) => {
      const matches: Round[] = div.teams.map((teams) => teams.rounds[0]);
      const idsSeen = new Set();
      const uniqueMatches: Round[] = [];

      matches.forEach((match) => {
        if (!idsSeen.has(match.teamHome.pairingsNumber)) {
          idsSeen.add(match.teamHome.pairingsNumber);
          uniqueMatches.push(match);
        }
      });
      const newDiv: DivisionRound = {
        class: div.class,
        division: div.division,
        matches: uniqueMatches,
      };

      newDiv.matches.forEach((match) => {
        match.games.forEach((game) => {
          if (game.board % 2 === 0) {
            const white = { ...game.black };
            const black = { ...game.white };
            game.black = black;
            game.white = white;
            game.result = revertResult(game.result);
          }
        });
        match.averageRatingAway = 0;
        match.averageRatingHome = 0;
        match.games.forEach((game) => {
          match.averageRatingAway += game.black.rating;
          match.averageRatingHome += game.white.rating;
        });
        match.averageRatingAway = Math.round(
          match.averageRatingAway / match.games.length
        );
        match.averageRatingHome = Math.round(
          match.averageRatingHome / match.games.length
        );
      });

      return newDiv;
    }),
  };
}
function extractInfoFromResultsJson(
  json: DivisionFrbe[],
  allTeams: TeamView[],
  players: Player[]
) {
  json.forEach((div) => {
    div.rounds[0].encounters.forEach((encounter) => {
      if (encounter.games?.length > 0) {
        const teamHome = allTeams.find(
          (team) =>
            team.clubId === encounter.icclub_home &&
            team.pairingsNumber === encounter.pairingnr_home &&
            team.class === div.division &&
            team.division === (div.index === '' ? 'A' : div.index)
        );
        const teamAway = allTeams.find(
          (team) =>
            team.clubId === encounter.icclub_visit &&
            team.pairingsNumber === encounter.pairingnr_visit &&
            team.class === div.division &&
            team.division === (div.index === '' ? 'A' : div.index)
        );

        if (teamAway && teamHome) {
          teamHome.rounds[0].games = [];
          teamAway.rounds[0].games = [];
          teamAway.boardPoints = 0;
          teamHome.boardPoints = 0;
          teamAway.matchPoints = 0;
          teamHome.matchPoints = 0;
          let oddBoard = true;
          encounter.games.forEach((game, index) => {
            const playerHome = players.find(
              (player) => player.id === game.idnumber_home
            );
            const playerAway = players.find(
              (player) => player.id === game.idnumber_visit
            );
            const white = oddBoard ? playerHome : playerAway;
            const black = oddBoard ? playerAway : playerHome;
            const teamWhite = oddBoard ? teamHome : teamAway;
            const teamBlack = oddBoard ? teamAway : teamHome;
            const result = getGameResult(game.result);

            switch (result) {
              case ResultEnum.WhiteFF:
              case ResultEnum.WhiteWins:
                teamHome.rounds[0].scoreHome++;
                teamAway.rounds[0].scoreHome++;
                break;
              case ResultEnum.BlackFF:
              case ResultEnum.BlackWins:
                teamHome.rounds[0].scoreAway++;
                teamAway.rounds[0].scoreAway++;
                break;
              case ResultEnum.Draw:
                teamHome.rounds[0].scoreAway += 0.5;
                teamAway.rounds[0].scoreAway += 0.5;
                teamHome.rounds[0].scoreHome += 0.5;
                teamAway.rounds[0].scoreHome += 0.5;
                break;
              case ResultEnum.BothFF:
                break;
            }

            const gameForDb: Game = {
              white: { ...white, games: [] },
              black: { ...black, games: [] },
              teamBlack: { ...teamBlack, rounds: [], players: [] },
              teamWhite: { ...teamWhite, rounds: [], players: [] },
              board: index + 1,
              result: oddBoard ? result : revertResult(result),
              round: 1,
            };
            if (white && black) {
              white.games = [gameForDb];
              black.games = [gameForDb];
              white.numberOfGames = 1;
              black.numberOfGames = 1;

              white.score = getScoreWhite(gameForDb.result);
              black.score = getScoreBlack(gameForDb.result);

              const percentageWhite = Math.round(
                (white.score / white.numberOfGames) * 100
              );
              const percentageBlack = Math.round(
                (black.score / black.numberOfGames) * 100
              );

              white.tpr = black.rating + GetTpr(percentageWhite);
              black.tpr = white.rating + GetTpr(percentageBlack);
              white.diff = white.tpr - white.rating;
              black.diff = black.tpr - black.rating;
            } else console.log(game.idnumber_home, game.idnumber_visit);

            teamHome.rounds[0].games.push(gameForDb);
            teamHome.boardPoints += getScoreWhite(result);
            teamAway.boardPoints += getScoreBlack(result);
            teamAway.rounds[0].games.push(gameForDb);
            oddBoard = !oddBoard;
          });
          if (teamAway.boardPoints > teamHome.boardPoints)
            teamAway.matchPoints += 2;
          if (teamAway.boardPoints === teamHome.boardPoints) {
            teamAway.matchPoints += 1;
            teamHome.matchPoints += 1;
          }
          if (teamAway.boardPoints < teamHome.boardPoints)
            teamHome.matchPoints += 2;
        } else {
          console.log(
            encounter.icclub_visit,
            encounter.pairingnr_visit,
            div.division,
            div.index
          );
        }
      }
    });
  });
}
