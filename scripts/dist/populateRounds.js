"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.populateRounds = void 0;
function populateRounds(division) {
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
            const teamHome = division.teams.find((team) => team.pairingsNumber === homePairingNumber);
            const teamAway = division.teams.find((team) => team.pairingsNumber === awayPairingNumber);
            const { rounds: _, ...simpleTeamHome } = teamHome;
            const { rounds: __, ...simpleTeamAway } = teamAway;
            const round = {
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
exports.populateRounds = populateRounds;
