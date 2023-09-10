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
const readCSV_1 = require("./readCSV");
const populateRounds_1 = require("./populateRounds");
const populateDb_1 = require("./populateDb");
fs.readFile('./division.csv', 'utf8', (err, csvData) => {
    if (err) {
        console.error(`Error reading the file: ${err}`);
        return;
    }
    const jsonData = (0, readCSV_1.csvToJsonObject)(csvData);
    const divisions = (0, readCSV_1.convertToDivisions)(jsonData);
    divisions.forEach((div) => (0, populateRounds_1.populateRounds)(div));
    const allTeams = divisions.flatMap((div) => div.teams);
    const clubs = groupTeamsByClub(allTeams);
    //generateClassOverview(divisions);
    //generateDivisions(divisions);
    //generatePlayerOverview();
    //generateClubDocs(clubs);
    //generateClubOverview(clubs);
    (0, populateDb_1.generateTeams)(clubs);
    (0, populateDb_1.generateRoundDates)();
    //console.log(JSON.stringify(divisions[0]));
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
