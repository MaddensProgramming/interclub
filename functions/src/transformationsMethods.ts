import * as fs from 'fs';
import { getPlayers } from './frbeGatewayCalls';
import { DivisionRound } from './models/DivisionRound';
import { RoundOverview } from './models/RoundOverview';
import { ClubView } from './models/ClubView';
import { Player } from './models/Player';
import { Division } from './models/Division';
import { ResultEnum } from './models/ResultEnum';
import { Game } from './models/Game';
import { Round } from './models/Round';
import { TeamView } from './models/TeamView';
import { DivisionFrbe } from './modelsFRBE';
import {
  revertResult,
  getGameResult,
  getScoreWhite,
  getScoreBlack,
  GetTpr,
} from './utility';

export function populateRounds(division: Division) {
  const matchups = [
    ['1-12', '2-11', '3-10', '4-9', '5-8', '6-7'],
    ['12-7', '8-6', '9-5', '10-4', '11-3', '1-2'],
    ['2-12', '3-1', '4-11', '5-10', '6-9', '7-8'],
    ['12-8', '9-7', '10-6', '11-5', '1-4', '2-3'],
    ['3-12', '4-2', '5-1', '6-11', '7-10', '8-9'],
    ['12-9', '10-8', '11-7', '1-6', '2-5', '3-4'],
    ['4-12', '5-3', '6-2', '7-1', '8-11', '9-10'],
    ['12-10', '11-9', '1-8', '2-7', '3-6', '4-5'],
    ['5-12', '6-4', '7-3', '8-2', '9-1', '10-11'],
    ['12-11', '1-10', '2-9', '3-8', '4-7', '5-6'],
    ['6-12', '7-5', '8-4', '9-3', '10-2', '11-1'],
  ];

  matchups.forEach((roundMatchups, index) => {
    const roundId = index + 1;

    roundMatchups.forEach((matchup) => {
      const [homePairingNumber, awayPairingNumber] = matchup
        .split('-')
        .map(Number);

      const teamHome = division.teams.find(
        (team) => team.pairingsNumber === homePairingNumber
      )!;

      const teamAway = division.teams.find(
        (team) => team.pairingsNumber === awayPairingNumber
      )!;

      const { rounds: _, ...simpleTeamHome } = teamHome;
      const { rounds: __, ...simpleTeamAway } = teamAway;

      const round: Round = {
        id: roundId,
        teamHome: simpleTeamHome,
        scoreHome: 0,
        teamAway: simpleTeamAway,
        scoreAway: 0,
        games: [],
      };

      teamHome.rounds.push({ ...round });
      teamAway.rounds.push({ ...round });
    });
  });
}
export const groupTeamsByClub = (teams: TeamView[]): ClubView[] => {
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
export const updateClubWithPlayers = async (club: any) => {
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
        games: [],
        acccumulatedRating: 0,
        team: lastNumberMatch != null ? parseInt(lastNumberMatch[0], 10) : null,
      };
    });
    club.teams.forEach(
      (team: TeamView) =>
        (team.players = club.players.filter(
          (player: Player) => player.team === team.id
        ))
    );
  } else {
    console.log('No players for ', club.id);
  }
};
export function createRoundOverviews(divisions: Division[]): RoundOverview[] {
  let allRoundOverviews: RoundOverview[] = [];

  // Deep copy the input parameter using JSON serialization/deserialization
  const copiedDivisions: Division[] = JSON.parse(JSON.stringify(divisions));

  const numRounds = copiedDivisions[0]?.teams[0]?.rounds?.length || 0;

  for (let i = 0; i < numRounds; i++) {
    let roundOverview: RoundOverview = {
      divisions: copiedDivisions.map((div) => {
        const matches: Round[] = div.teams.map((teams) => teams.rounds[i]);
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
          match.averageRatingAway = 0;
          match.averageRatingHome = 0;
          match.games.forEach((game) => {
            match.averageRatingAway += game.playerAway.rating;
            match.averageRatingHome += game.playerHome.rating;
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
    allRoundOverviews.push(roundOverview);
  }

  return allRoundOverviews;
}
export function fillTeamsAndPlayersWithInfoFromJson(
  json: DivisionFrbe[],
  allTeams: TeamView[],
  players: Player[]
) {
  json.forEach((div) => {
    div.rounds.forEach((round, roundIndex) => {
      round.encounters.forEach((encounter) => {
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
            teamHome.rounds[roundIndex].games = [];
            teamAway.rounds[roundIndex].games = [];

            encounter.games.forEach((game, index) => {
              const playerHome = players.find(
                (player) => player.id === game.idnumber_home
              );
              const playerAway = players.find(
                (player) => player.id === game.idnumber_visit
              );
              const result = getGameResult(game.result);

              switch (result) {
                case ResultEnum.WhiteFF:
                case ResultEnum.WhiteWins:
                  teamHome.rounds[roundIndex].scoreHome++;
                  teamAway.rounds[roundIndex].scoreHome++;
                  break;
                case ResultEnum.BlackFF:
                case ResultEnum.BlackWins:
                  teamHome.rounds[roundIndex].scoreAway++;
                  teamAway.rounds[roundIndex].scoreAway++;
                  break;
                case ResultEnum.Draw:
                  teamHome.rounds[roundIndex].scoreAway += 0.5;
                  teamAway.rounds[roundIndex].scoreAway += 0.5;
                  teamHome.rounds[roundIndex].scoreHome += 0.5;
                  teamAway.rounds[roundIndex].scoreHome += 0.5;
                  break;
                case ResultEnum.BothFF:
                  break;
              }

              const gameForDb: Game = {
                playerHome: { ...playerHome, games: [] },
                playerAway: { ...playerAway, games: [] },
                teamAway: { ...teamAway, rounds: [], players: [] },
                teamHome: { ...teamHome, rounds: [], players: [] },
                board: index + 1,
                result: result,
                round: roundIndex + 1,
              };
              if (playerHome && playerAway) {
                UpdateGameForPlayers(playerHome, gameForDb, playerAway);
              } else {
                if (game.idnumber_home != 0 && game.idnumber_visit != 0)
                  console.log(game.idnumber_home, game.idnumber_visit);
              }

              teamHome.rounds[roundIndex].games.push(gameForDb);

              teamHome.boardPoints += getScoreWhite(result);
              teamAway.boardPoints += getScoreBlack(result);
              teamAway.rounds[roundIndex].games.push(gameForDb);
            });
            if (teamAway.boardPoints + teamHome.boardPoints > 0) {
              if (
                teamAway.rounds[roundIndex].scoreAway >
                teamHome.rounds[roundIndex].scoreHome
              ) {
                teamAway.matchPoints += 2;
              }
              if (
                teamAway.rounds[roundIndex].scoreAway ===
                teamHome.rounds[roundIndex].scoreHome
              ) {
                teamAway.matchPoints += 1;
                teamHome.matchPoints += 1;
              }
              if (
                teamAway.rounds[roundIndex].scoreAway <
                teamHome.rounds[roundIndex].scoreHome
              ) {
                teamHome.matchPoints += 2;
              }
            }
          }
        }
      });
    });
  });
}
function UpdateGameForPlayers(
  playerHome: Player,
  gameForDb: Game,
  playerAway: Player
) {
  playerHome.games.push(gameForDb);
  playerAway.games.push(gameForDb);
  playerHome.numberOfGames += 1;
  playerAway.numberOfGames += 1;

  playerHome.score += getScoreWhite(gameForDb.result);
  playerAway.score += getScoreBlack(gameForDb.result);

  if (!playerHome.accumulatedRatings) playerHome.accumulatedRatings = 0;
  if (!playerAway.accumulatedRatings) playerAway.accumulatedRatings = 0;

  playerHome.accumulatedRatings += playerAway.rating;
  playerAway.accumulatedRatings += playerHome.rating;

  const averageRatingWhite = Math.round(
    playerHome.accumulatedRatings / playerHome.numberOfGames
  );
  const averageRatingBlack = Math.round(
    playerAway.accumulatedRatings / playerAway.numberOfGames
  );

  const percentageWhite = Math.round(
    (playerHome.score / playerHome.numberOfGames) * 100
  );
  const percentageBlack = Math.round(
    (playerAway.score / playerAway.numberOfGames) * 100
  );

  playerHome.tpr = averageRatingWhite + GetTpr(percentageWhite);
  playerAway.tpr = averageRatingBlack + GetTpr(percentageBlack);
  playerHome.diff = playerHome.tpr - playerHome.rating;
  playerAway.diff = playerAway.tpr - playerAway.rating;
}
export const addPlayersToClubs = async (clubs: ClubView[]) => {
  for (const club of clubs) {
    await updateClubWithPlayers(club);
  }
};
export const readCsvFile = (path: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) reject(`Error reading the file: ${err}`);
      else resolve(data);
    });
  });
};
