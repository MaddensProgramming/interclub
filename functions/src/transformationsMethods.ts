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
export function createRoundOverview(divisions: Division[]): RoundOverview {
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
export function extractInfoFromResultsJson(
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
