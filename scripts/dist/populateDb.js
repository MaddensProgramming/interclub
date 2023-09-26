"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRoundDates = exports.addToProvince = exports.generateOverview = exports.generateRoundOverview = exports.generateClubOverview = exports.generateTeamDocs = exports.generateClubDocs = exports.generatePlayerOverview = exports.generateClassOverview = exports.generateDivisions = void 0;
const firestore_1 = require("firebase/firestore");
const initiateDB_1 = require("./initiateDB");
const frbeGatewayCalls_1 = require("./frbeGatewayCalls");
function generateDivisions(divisions) {
    divisions.forEach((div) => {
        (0, firestore_1.setDoc)((0, firestore_1.doc)(initiateDB_1.store, 'years', '2023', 'divisions', div.class + div.division), div)
            .then(() => {
            console.log(div.class + div.division);
        })
            .catch((err) => {
            console.error(err.message);
        });
    });
}
exports.generateDivisions = generateDivisions;
function generateClassOverview(divisions) {
    const classMap = {};
    divisions.forEach((div) => {
        if (!classMap[div.class]) {
            classMap[div.class] = [];
        }
        classMap[div.class].push(div.division);
    });
    const classOverview = {
        classes: Object.keys(classMap).map((key) => ({
            class: parseInt(key, 10),
            divisions: classMap[key],
        })),
    };
    (0, firestore_1.setDoc)((0, firestore_1.doc)(initiateDB_1.store, 'years', '2023', 'overviews', 'divisions'), classOverview)
        .then(() => {
        console.log('done division overview');
    })
        .catch((err) => {
        console.error(err.message);
    });
}
exports.generateClassOverview = generateClassOverview;
function generatePlayerOverview(players) {
    // const playersOverview = players
    //   .map((player) => {
    //     return { name: player.firstName + ' ' + player.name, id: player.id };
    //   })
    //   .sort((a, b) => a.name.localeCompare(b.name));
    // setDoc(doc(store, 'years', '2023', 'overviews', 'simplelayers'), {
    //   players: playersOverview,
    // })
    //   .then(() => {
    //     console.log('done players');
    //   })
    //   .catch((err) => {
    //     console.error(err.message);
    //   });
    // const playersHallOfFame = players
    //   .map((player) => {
    //     player.games = [];
    //     return player;
    //   })
    //   .sort((a, b) => b.tpr - a.tpr);
    let count = 1;
    // setDoc(doc(store, 'years', '2023', 'overviews', 'players'), {
    //   players: playersHallOfFame,
    // })
    //   .then(() => {
    //     console.log('done players');
    //   })
    //   .catch((err) => {
    //     console.error(err.message);
    //   });
    players.forEach((player) => {
        (0, firestore_1.setDoc)((0, firestore_1.doc)(initiateDB_1.store, 'years', '2023', 'players', player.id.toString()), player)
            .then(() => {
            console.log(count++);
        })
            .catch((err) => {
            console.error(err.message);
        });
    });
}
exports.generatePlayerOverview = generatePlayerOverview;
function generateClubDocs(clubs) {
    clubs = clubs.map((club) => {
        return {
            id: club.id,
            name: club.name,
            players: club.players
                .map((player) => {
                player.games = [];
                return player;
            })
                .sort((a, b) => b.rating - a.rating),
            teams: club.teams
                .map((team) => {
                team.players = [];
                team.rounds = [];
                return team;
            })
                .sort((a, b) => a.id - b.id),
        };
    });
    clubs.forEach(async (club) => {
        club.venues = await (0, frbeGatewayCalls_1.getPlayingHall)(club.id);
        (0, firestore_1.setDoc)((0, firestore_1.doc)(initiateDB_1.store, 'years', '2023', 'club', club.id.toString()), club)
            .then(() => console.log(club.name))
            .catch((err) => console.error(err.message, club.name));
    });
}
exports.generateClubDocs = generateClubDocs;
function generateTeamDocs(clubs) {
    clubs = clubs.map((club) => {
        return {
            id: club.id,
            name: club.name,
            players: club.players
                .map((player) => {
                player.games = [];
                return player;
            })
                .sort((a, b) => b.rating - a.rating),
            teams: club.teams.sort((a, b) => a.id - b.id),
        };
    });
    clubs.forEach(async (club) => {
        club.teams.forEach((team) => (0, firestore_1.setDoc)((0, firestore_1.doc)(initiateDB_1.store, 'years', '2023', 'club', club.id.toString(), 'team', team.id.toString()), team)
            .then(() => console.log(club.name, team.id))
            .catch((err) => console.log(err, club.name, team.id)));
    });
}
exports.generateTeamDocs = generateTeamDocs;
function generateClubOverview(clubs) {
    (0, firestore_1.setDoc)((0, firestore_1.doc)(initiateDB_1.store, 'years', '2023', 'clubOverview', 'overview'), generateOverview(clubs))
        .then(() => console.log('succes'))
        .catch((err) => console.error(err.message));
}
exports.generateClubOverview = generateClubOverview;
function generateRoundOverview(roundOverview) {
    (0, firestore_1.setDoc)((0, firestore_1.doc)(initiateDB_1.store, 'years', '2023', 'roundOverview', '1'), roundOverview)
        .then(() => console.log('succes'))
        .catch((err) => console.error(err.message));
}
exports.generateRoundOverview = generateRoundOverview;
function generateOverview(clubs) {
    const overview = { provinces: [] };
    clubs
        .filter((club) => club.id !== 0)
        .forEach((club) => addToProvince(club, overview));
    console.log(overview);
    return overview;
}
exports.generateOverview = generateOverview;
function addToProvince(club, overview) {
    const provinceId = Math.floor(club.id / 100);
    const province = overview.provinces.find((prov) => prov.id === provinceId);
    if (!province)
        overview.provinces.push({
            id: provinceId,
            clubs: [{ id: club.id, name: club.name }],
        });
    else
        province.clubs.push({ id: club.id, name: club.name });
}
exports.addToProvince = addToProvince;
function generateRoundDates() {
    var dates = {
        dates: [
            new Date(2023, 8, 24),
            new Date(2023, 9, 15),
            new Date(2023, 9, 22),
            new Date(2023, 10, 19),
            new Date(2023, 11, 3),
            new Date(2024, 0, 28),
            new Date(2024, 1, 4),
            new Date(2024, 1, 18),
            new Date(2024, 2, 10),
            new Date(2024, 2, 24),
            new Date(2024, 3, 21), // 21/04/2024
        ],
    };
    (0, firestore_1.setDoc)((0, firestore_1.doc)(initiateDB_1.store, 'years', '2023', 'dates', 'dates'), dates)
        .then(() => {
        console.log('done dates');
    })
        .catch((err) => {
        console.error(err.message);
    });
}
exports.generateRoundDates = generateRoundDates;
