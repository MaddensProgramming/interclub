import * as fs from 'fs';
import { PAIRINGS_12, PAIRINGS_10, PAIRINGS_6J, ROUND_DATES, calendarRound } from './season';
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
  isForfeit,
} from './utility';

export function populateRounds(division: Division) {
  const matchups = division.class === 6
    ? (division.division === 'J' ? PAIRINGS_6J : PAIRINGS_10)
    : PAIRINGS_12;
  const expectedSlots = division.class === 6 ? 10 : 12;
  const slots = new Set(division.teams.map((team) => team.pairingsNumber));
  if (division.teams.length !== expectedSlots || slots.size !== expectedSlots ||
      [...slots].some((slot) => !Number.isInteger(slot) || slot < 1 || slot > expectedSlots)) {
    throw new Error(`Invalid pairing slots in ${division.class}${division.division}`);
  }
  division.teams.forEach((team) => { team.rounds = []; });
  if (division.class === 6 && division.division === 'J') {
    division.resultsNote = 'Voor 6J toont deze site de kalender. FRBE verwerkt de uitslagen per e-mail; ze worden hier nog niet automatisch bijgewerkt.';
    division.teams.forEach((team) => { team.resultsNote = division.resultsNote; });
  }

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

      if (!teamHome || !teamAway) throw new Error(`Missing team for ${matchup}`);
      const { rounds: _, ...simpleTeamHome } = teamHome;
      const { rounds: __, ...simpleTeamAway } = teamAway;

      const round: Round = {
        id: roundId,
        calendarRound: calendarRound(division.class, roundId),
        played: false,
        teamHome: simpleTeamHome,
        scoreHome: 0,
        teamAway: simpleTeamAway,
        scoreAway: 0,
        games: [],
      };

      teamHome.rounds.push({ ...round, games: [] });
      teamAway.rounds.push({ ...round, games: [] });
    });
  });
}
export const groupTeamsByClub = (teams: TeamView[]): ClubView[] => {
  const clubMap: { [key: number]: ClubView } = {};

  for (const team of teams) {
    if (team.clubId === 0) continue;
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
        ratingNat: player.natrating ?? 0,
        ratingFide: player.fiderating ?? 0,
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

  const numRounds = ROUND_DATES.length;

  for (let i = 0; i < numRounds; i++) {
    let roundOverview: RoundOverview = {
      divisions: copiedDivisions.map((div) => {
        const matches: Round[] = div.teams.flatMap((team) =>
          team.rounds.filter((round) => (round.calendarRound ?? round.id) === i + 1)
        ).filter((round) => round.teamHome.clubId !== 0 && round.teamAway.clubId !== 0);
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
            match.averageRatingAway / (match.games.length || 1)
          );
          match.averageRatingHome = Math.round(
            match.averageRatingHome / (match.games.length || 1)
          );
        });

        return newDiv;
      }).filter((division) => division.matches.length > 0),
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
    div.rounds.forEach((round) => {
      round.encounters.forEach((encounter) => {
        if (encounter.played === true) {
          if (![encounter.boardpoint2_home, encounter.boardpoint2_visit, encounter.matchpoint_home, encounter.matchpoint_visit]
            .every(value => Number.isFinite(value) && value >= 0) || !Array.isArray(encounter.games)) {
            throw new Error(`Invalid FRBE score in ${div.division}${div.index}, round ${round.round}`);
          }
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

          if (!teamAway || !teamHome) {
            throw new Error(`Unknown result teams in ${div.division}${div.index}, round ${round.round}`);
          }
          const homeRound = teamHome.rounds.find((item) => item.id === round.round);
          const awayRound = teamAway.rounds.find((item) => item.id === round.round);
          if (!homeRound || !awayRound ||
              homeRound.teamAway.pairingsNumber !== teamAway.pairingsNumber ||
              homeRound.teamHome.pairingsNumber !== teamHome.pairingsNumber) {
            throw new Error(`Result does not match calendar in ${div.division}${div.index}, round ${round.round}`);
          }
          {
            homeRound.games = [];
            awayRound.games = [];
            homeRound.played = true;
            awayRound.played = true;
            homeRound.scoreHome = awayRound.scoreHome = encounter.boardpoint2_home / 2;
            homeRound.scoreAway = awayRound.scoreAway = encounter.boardpoint2_visit / 2;
            teamHome.boardPoints += homeRound.scoreHome;
            teamAway.boardPoints += homeRound.scoreAway;
            teamHome.matchPoints += encounter.matchpoint_home;
            teamAway.matchPoints += encounter.matchpoint_visit;

            encounter.games.forEach((game, index) => {
              const playerHome = players.find(
                (player) => player.id === game.idnumber_home
              );
              const playerAway = players.find(
                (player) => player.id === game.idnumber_visit
              );
              const result = getGameResult(game);

              const gameForDb: Game = {
                playerHome: { ...playerHome, games: [] },
                playerAway: { ...playerAway, games: [] },
                teamAway: { ...teamAway, rounds: [], players: [] },
                teamHome: { ...teamHome, rounds: [], players: [] },
                board: index + 1,
                result: result,
                round: round.round,
              };
              if (playerHome && playerAway) {
                UpdateGameForPlayers(playerHome, gameForDb, playerAway);
              } else {
                if (game.idnumber_home != 0 && game.idnumber_visit != 0)
                  console.log(game.idnumber_home, game.idnumber_visit);
              }

              homeRound.games.push(gameForDb);

              awayRound.games.push(gameForDb);
            });
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
  // Update general game statistics
  updateBasicStats(playerHome, gameForDb, true);
  updateBasicStats(playerAway, gameForDb, false);

  // If the game isn't a forfeit, update additional statistics
  if (!isForfeit(gameForDb.result)) {
    updateAdvancedStats(playerHome, playerAway.rating, gameForDb.result, true);
    updateAdvancedStats(playerAway, playerHome.rating, gameForDb.result, false);
  }
}

function updateBasicStats(player: Player, game: Game, isWhite: boolean) {
  player.games.push(game);
  player.numberOfGames += 1;

  const score = isWhite
    ? getScoreWhite(game.result)
    : getScoreBlack(game.result);
  player.score += score;
}

function updateAdvancedStats(
  player: Player,
  opponentRating: number,
  gameResult: ResultEnum,
  isWhite: boolean
) {
  // Update scores excluding forfeits
  const validScore = isWhite
    ? getScoreWhite(gameResult)
    : getScoreBlack(gameResult);
  player.validScore = (player.validScore || 0) + validScore;

  // Update count of valid games
  player.validNumberOfGames = (player.validNumberOfGames || 0) + 1;

  // Update accumulated ratings
  player.accumulatedRatings = (player.accumulatedRatings || 0) + opponentRating;

  // Calculate and update derived statistics
  const averageRating = Math.round(
    player.accumulatedRatings / player.validNumberOfGames
  );
  const percentage = Math.round(
    (player.validScore / player.validNumberOfGames) * 100
  );

  player.tpr = averageRating + GetTpr(percentage);
  player.diff = player.tpr - player.rating;
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
