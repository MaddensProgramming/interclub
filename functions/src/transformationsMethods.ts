import { getPlayers } from './frbeGatewayCalls';
import {
  ClubView,
  Division,
  DivisionRound,
  Game,
  Player,
  ResultEnum,
  Round,
  RoundOverview,
  TeamView,
} from './models';
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
    allRoundOverviews.push(roundOverview);
  }

  return allRoundOverviews;
}

export function extractInfoFromResultsJson(
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
                white: { ...white, games: [] },
                black: { ...black, games: [] },
                teamBlack: { ...teamBlack, rounds: [], players: [] },
                teamWhite: { ...teamWhite, rounds: [], players: [] },
                board: index + 1,
                result: oddBoard ? result : revertResult(result),
                round: roundIndex + 1,
              };
              if (white && black && roundIndex < 2) {
                UpdateGameForPlayers(white, gameForDb, black);
              } else {
                if (game.idnumber_home != 0 && game.idnumber_visit != 0)
                  console.log(game.idnumber_home, game.idnumber_visit);
              }

              teamHome.rounds[roundIndex].games.push(gameForDb);

              teamHome.boardPoints += getScoreWhite(result);
              teamAway.boardPoints += getScoreBlack(result);
              teamAway.rounds[roundIndex].games.push(gameForDb);
              oddBoard = !oddBoard;
            });
            if (roundIndex < 2) {
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
function UpdateGameForPlayers(white: Player, gameForDb: Game, black: Player) {
  white.games.push(gameForDb);
  black.games.push(gameForDb);
  white.numberOfGames += 1;
  black.numberOfGames += 1;

  white.score += getScoreWhite(gameForDb.result);
  black.score += getScoreBlack(gameForDb.result);

  if (!white.accumulatedRatings) white.accumulatedRatings = 0;
  if (!black.accumulatedRatings) black.accumulatedRatings = 0;

  white.accumulatedRatings += black.rating;
  black.accumulatedRatings += white.rating;

  const averageRatingWhite = white.accumulatedRatings / white.numberOfGames;
  const averageRatingBlack = black.accumulatedRatings / black.numberOfGames;

  const percentageWhite = Math.round((white.score / white.numberOfGames) * 100);
  const percentageBlack = Math.round((black.score / black.numberOfGames) * 100);

  white.tpr = averageRatingWhite + GetTpr(percentageWhite);
  black.tpr = averageRatingBlack + GetTpr(percentageBlack);
  white.diff = white.tpr - white.rating;
  black.diff = black.tpr - black.rating;
}
