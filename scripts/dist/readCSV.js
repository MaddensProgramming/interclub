"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToDivisions = exports.csvToJsonObject = void 0;
const csvToJsonObject = (csv) => {
    const lines = csv.split('\n');
    const divisions = {};
    let currentDivisionNames = [];
    let pairingsNumber = 0;
    lines.forEach((line) => {
        const row = line.split(',');
        if (row.some((item) => item.includes('Afdeling'))) {
            // This row contains division names
            pairingsNumber = 0;
            currentDivisionNames = row.map((item) => item.trim());
            currentDivisionNames.forEach((divisionName) => {
                if (divisionName) {
                    divisions[divisionName] = [];
                }
            });
        }
        else if (row.some((item) => item.trim())) {
            // This row contains team names
            pairingsNumber++;
            row.forEach((team, index) => {
                const divisionName = currentDivisionNames[index];
                if (divisionName && divisions[divisionName]) {
                    const trimmedTeam = team.trim();
                    if (trimmedTeam) {
                        const division = extractMiddleValues(divisionName);
                        divisions[divisionName].push(convertStringToTeam(trimmedTeam, division.classs, division.division, pairingsNumber));
                    }
                }
            });
        }
    });
    return divisions;
};
exports.csvToJsonObject = csvToJsonObject;
function convertStringToTeam(club, classs, division, pairingsNumber) {
    // Use a regular expression to match the input string
    const match = /^(\d{3})\s+(.+)\s+(\d{1,2})$/.exec(club);
    // Validate the match
    if (!match) {
        return null;
    }
    // Extract the components from the regular expression match
    const [, clubIdStr, clubName, idStr] = match;
    // Convert the string components to their respective types
    const clubId = parseInt(clubIdStr, 10);
    const id = parseInt(idStr, 10);
    // Create the object and return
    const teamView = {
        id,
        clubName,
        clubId,
        class: classs,
        division,
        pairingsNumber,
        rounds: [],
        boardPoints: 0,
        matchPoints: 0,
    };
    return teamView;
}
function extractMiddleValues(inputString) {
    const regex = /Division (\d+)([A-Z])\s/;
    const match = inputString.match(regex);
    if (match && match.length === 3) {
        const number = +match[1];
        const letter = match[2];
        return { classs: number, division: letter };
    }
    return null;
}
function convertToDivisions(divisionMap) {
    const divisions = [];
    const divisionIndexMap = {};
    for (const key in divisionMap) {
        const result = extractMiddleValues(key);
        if (result) {
            const { classs, division } = result;
            const indexKey = `${classs}-${division}`;
            // Check if this class-division combination already exists in the divisions array
            if (divisionIndexMap.hasOwnProperty(indexKey)) {
                divisions[divisionIndexMap[indexKey]].teams.push(...divisionMap[key]);
            }
            else {
                // Create a new Division object and push it to divisions array
                const newDivision = {
                    teams: divisionMap[key],
                    class: classs,
                    division: division,
                };
                divisionIndexMap[indexKey] = divisions.length;
                divisions.push(newDivision);
            }
        }
    }
    return divisions;
}
exports.convertToDivisions = convertToDivisions;
