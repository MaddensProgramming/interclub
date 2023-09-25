import * as fs from 'fs';
import {
  ClubOverview,
  ClubView,
  DivisionRound,
  FRBEPlayer,
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

    players.forEach((player) => (player.games = []));
    allTeams.forEach((team) => (team.players = []));

    const roundOverview: RoundOverview = {
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

    //generatePlayerOverview(players);
    //generateClassOverview(divisions);
    //generateDivisions(divisions);
    //generateClubDocs(clubs);
    //generateClubOverview(clubs);
    //generateRoundDates();
    generateRoundOverview(roundOverview);
  }

  main();
});

function getGameResult(result: string): ResultEnum {
  switch (result) {
    case '1-0':
      return ResultEnum.WhiteWins;
    case '0-1':
      return ResultEnum.BlackWins;
    case '½-½':
      return ResultEnum.Draw;
    case '1-0 FF':
      return ResultEnum.WhiteFF;
    case '0-1 FF':
      return ResultEnum.BlackFF;
    default:
      return ResultEnum.BothFF;
  }
}

function revertResult(result: ResultEnum): ResultEnum {
  switch (result) {
    case ResultEnum.WhiteFF:
      return ResultEnum.BlackFF;
    case ResultEnum.BlackFF:
      return ResultEnum.WhiteFF;
    case ResultEnum.BlackWins:
      return ResultEnum.WhiteWins;
    case ResultEnum.WhiteWins:
      return ResultEnum.BlackWins;
    case ResultEnum.BothFF:
      return ResultEnum.BothFF;
    case ResultEnum.Draw:
      return ResultEnum.Draw;
  }
}

function getScoreWhite(result: ResultEnum): number {
  switch (result) {
    case ResultEnum.WhiteFF:
    case ResultEnum.WhiteWins:
      return 1;
    case ResultEnum.BlackFF:
    case ResultEnum.BlackWins:
    case ResultEnum.BothFF:
      return 0;
    case ResultEnum.Draw:
      return 0.5;
  }
}

function getScoreBlack(result: ResultEnum): number {
  switch (result) {
    case ResultEnum.WhiteFF:
    case ResultEnum.WhiteWins:
    case ResultEnum.BothFF:
      return 0;
    case ResultEnum.BlackFF:
    case ResultEnum.BlackWins:
      return 1;
    case ResultEnum.Draw:
      return 0.5;
  }
}

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

async function getPlayers(clubId: number): Promise<FRBEPlayer[]> {
  try {
    const response = await fetch(
      `https://www.frbe-kbsb-ksb.be/api/v1/interclubs/anon/icclub/${clubId}`
    );
    const data = await response.json();
    return data.players; // assuming the response contains a "playingHall" property
  } catch (err) {
    console.error('Error fetching players:', err);
    return null;
  }
}

const updateClubWithPlayers = async (club: any) => {
  const frbePlayer = await getPlayers(club.id);
  if (frbePlayer) {
    club.players = frbePlayer.map((player) => {
      let lastNumberMatch;
      if (player?.titular) lastNumberMatch = player.titular.match(/\d+$/);
      return {
        id: player.idnumber,
        rating: player.assignedrating,
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

async function getAllResults(): Promise<DivisionFrbe[]> {
  try {
    const response = await fetch(
      `https://www.frbe-kbsb-ksb.be/api/v1/interclubs/anon/icseries`
    );
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Error fetching josn', err);
    return null;
  }
}

function GetTpr(percentage: number): number {
  switch (percentage) {
    case 0:
      return -800;
    case 1:
      return -677;
    case 2:
      return -589;
    case 3:
      return -538;
    case 4:
      return -501;
    case 5:
      return -470;
    case 6:
      return -444;
    case 7:
      return -422;
    case 8:
      return -401;
    case 9:
      return -383;
    case 10:
      return -366;
    case 11:
      return -351;
    case 12:
      return -336;
    case 13:
      return -322;
    case 14:
      return -309;
    case 15:
      return -296;
    case 16:
      return -284;
    case 17:
      return -273;
    case 18:
      return -262;
    case 19:
      return -251;
    case 20:
      return -240;
    case 21:
      return -230;
    case 22:
      return -220;
    case 23:
      return -211;
    case 24:
      return -202;
    case 25:
      return -193;
    case 26:
      return -184;
    case 27:
      return -175;
    case 28:
      return -166;
    case 29:
      return -158;
    case 30:
      return -149;
    case 31:
      return -141;
    case 32:
      return -133;
    case 33:
      return -125;
    case 34:
      return -117;
    case 35:
      return -110;
    case 36:
      return -102;
    case 37:
      return -95;
    case 38:
      return -87;
    case 39:
      return -80;
    case 40:
      return -72;
    case 41:
      return -65;
    case 42:
      return -57;
    case 43:
      return -50;
    case 44:
      return -43;
    case 45:
      return -36;
    case 46:
      return -29;
    case 47:
      return -21;
    case 48:
      return -14;
    case 49:
      return -7;
    case 50:
      return 0;
    default:
      return -1 * GetTpr(100 - percentage);
  }
}
