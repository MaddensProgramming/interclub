"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const models_1 = require("./models");
const readCSV_1 = require("./readCSV");
const populateRounds_1 = require("./populateRounds");
const populateDb_1 = require("./populateDb");
const utility_1 = require("./utility");
const utility_2 = require("./utility");
const frbeGatewayCalls_1 = require("./frbeGatewayCalls");
const frbeGatewayCalls_2 = require("./frbeGatewayCalls");
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
        const jsonData = (0, readCSV_1.csvToJsonObject)(csvData);
        const divisions = (0, readCSV_1.convertToDivisions)(jsonData);
        divisions.forEach((div) => (0, populateRounds_1.populateRounds)(div));
        const allTeams = divisions.flatMap((div) => div.teams);
        const clubs = groupTeamsByClub(allTeams);
        const json = await (0, frbeGatewayCalls_1.getAllResults)();
        await updateAllClubsSequentially(clubs);
        const players = clubs.flatMap((club) => club.players);
        extractInfoFromResultsJson(json, allTeams, players);
        // players.forEach((player) => (player.games = []));
        // allTeams.forEach((team) => (team.players = []));
        const roundOverview = createRoundOverview(divisions);
        (0, populateDb_1.generatePlayerOverview)(players);
        //generateClassOverview(divisions);
        //generateDivisions(divisions);
        //generateClubDocs(clubs);
        //generateClubOverview(clubs);
        //generateRoundDates();
        //generateRoundOverview(roundOverview);
    }
    main();
});
const groupTeamsByClub = (teams) => {
    const clubMap = {};
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
const updateClubWithPlayers = async (club) => {
    const frbePlayer = await (0, frbeGatewayCalls_2.getPlayers)(club.id);
    if (frbePlayer) {
        club.players = frbePlayer.map((player) => {
            let lastNumberMatch;
            if (player === null || player === void 0 ? void 0 : player.titular)
                lastNumberMatch = player.titular.match(/\d+$/);
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
        club.teams.forEach((team) => (team.players = club.players.filter((player) => player.team === team.id)));
    }
    else {
        console.log('No players for ', club.id);
    }
};
function createRoundOverview(divisions) {
    return {
        divisions: divisions.map((div) => {
            const matches = div.teams.map((teams) => teams.rounds[0]);
            const idsSeen = new Set();
            const uniqueMatches = [];
            matches.forEach((match) => {
                if (!idsSeen.has(match.teamHome.pairingsNumber)) {
                    idsSeen.add(match.teamHome.pairingsNumber);
                    uniqueMatches.push(match);
                }
            });
            const newDiv = {
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
                        game.result = (0, utility_1.revertResult)(game.result);
                    }
                });
                match.averageRatingAway = 0;
                match.averageRatingHome = 0;
                match.games.forEach((game) => {
                    match.averageRatingAway += game.black.rating;
                    match.averageRatingHome += game.white.rating;
                });
                match.averageRatingAway = Math.round(match.averageRatingAway / match.games.length);
                match.averageRatingHome = Math.round(match.averageRatingHome / match.games.length);
            });
            return newDiv;
        }),
    };
}
function extractInfoFromResultsJson(json, allTeams, players) {
    json.forEach((div) => {
        div.rounds[0].encounters.forEach((encounter) => {
            var _a;
            if (((_a = encounter.games) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                const teamHome = allTeams.find((team) => team.clubId === encounter.icclub_home &&
                    team.pairingsNumber === encounter.pairingnr_home &&
                    team.class === div.division &&
                    team.division === (div.index === '' ? 'A' : div.index));
                const teamAway = allTeams.find((team) => team.clubId === encounter.icclub_visit &&
                    team.pairingsNumber === encounter.pairingnr_visit &&
                    team.class === div.division &&
                    team.division === (div.index === '' ? 'A' : div.index));
                if (teamAway && teamHome) {
                    teamHome.rounds[0].games = [];
                    teamAway.rounds[0].games = [];
                    teamAway.boardPoints = 0;
                    teamHome.boardPoints = 0;
                    teamAway.matchPoints = 0;
                    teamHome.matchPoints = 0;
                    let oddBoard = true;
                    encounter.games.forEach((game, index) => {
                        const playerHome = players.find((player) => player.id === game.idnumber_home);
                        const playerAway = players.find((player) => player.id === game.idnumber_visit);
                        const white = oddBoard ? playerHome : playerAway;
                        const black = oddBoard ? playerAway : playerHome;
                        const teamWhite = oddBoard ? teamHome : teamAway;
                        const teamBlack = oddBoard ? teamAway : teamHome;
                        const result = (0, utility_1.getGameResult)(game.result);
                        switch (result) {
                            case models_1.ResultEnum.WhiteFF:
                            case models_1.ResultEnum.WhiteWins:
                                teamHome.rounds[0].scoreHome++;
                                teamAway.rounds[0].scoreHome++;
                                break;
                            case models_1.ResultEnum.BlackFF:
                            case models_1.ResultEnum.BlackWins:
                                teamHome.rounds[0].scoreAway++;
                                teamAway.rounds[0].scoreAway++;
                                break;
                            case models_1.ResultEnum.Draw:
                                teamHome.rounds[0].scoreAway += 0.5;
                                teamAway.rounds[0].scoreAway += 0.5;
                                teamHome.rounds[0].scoreHome += 0.5;
                                teamAway.rounds[0].scoreHome += 0.5;
                                break;
                            case models_1.ResultEnum.BothFF:
                                break;
                        }
                        const gameForDb = {
                            white: { ...white, games: [] },
                            black: { ...black, games: [] },
                            teamBlack: { ...teamBlack, rounds: [], players: [] },
                            teamWhite: { ...teamWhite, rounds: [], players: [] },
                            board: index + 1,
                            result: oddBoard ? result : (0, utility_1.revertResult)(result),
                            round: 1,
                        };
                        if (white && black) {
                            white.games = [gameForDb];
                            black.games = [gameForDb];
                            white.numberOfGames = 1;
                            black.numberOfGames = 1;
                            white.score = (0, utility_1.getScoreWhite)(gameForDb.result);
                            black.score = (0, utility_1.getScoreBlack)(gameForDb.result);
                            const percentageWhite = Math.round((white.score / white.numberOfGames) * 100);
                            const percentageBlack = Math.round((black.score / black.numberOfGames) * 100);
                            white.tpr = black.rating + (0, utility_2.GetTpr)(percentageWhite);
                            black.tpr = white.rating + (0, utility_2.GetTpr)(percentageBlack);
                            white.diff = white.tpr - white.rating;
                            black.diff = black.tpr - black.rating;
                        }
                        else
                            console.log(game.idnumber_home, game.idnumber_visit);
                        teamHome.rounds[0].games.push(gameForDb);
                        teamHome.boardPoints += (0, utility_1.getScoreWhite)(result);
                        teamAway.boardPoints += (0, utility_1.getScoreBlack)(result);
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
                }
                else {
                    console.log(encounter.icclub_visit, encounter.pairingnr_visit, div.division, div.index);
                }
            }
        });
    });
}
