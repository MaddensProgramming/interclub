"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayingHall = exports.getPlayers = exports.getAllResults = void 0;
async function getAllResults() {
    try {
        const response = await fetch(`https://www.frbe-kbsb-ksb.be/api/v1/interclubs/anon/icseries`);
        const data = await response.json();
        return data;
    }
    catch (err) {
        console.error('Error fetching josn', err);
        return null;
    }
}
exports.getAllResults = getAllResults;
async function getPlayers(clubId) {
    try {
        const response = await fetch(`https://www.frbe-kbsb-ksb.be/api/v1/interclubs/anon/icclub/${clubId}`);
        const data = await response.json();
        return data.players;
    }
    catch (err) {
        console.error('Error fetching players:', err);
        return null;
    }
}
exports.getPlayers = getPlayers;
async function getPlayingHall(clubId) {
    try {
        const response = await fetch(`https://www.frbe-kbsb-ksb.be/api/v1/interclubs/anon/venue/${clubId}`);
        const data = await response.json();
        return data.venues;
    }
    catch (err) {
        console.error('Error fetching playing hall:', err);
        return null;
    }
}
exports.getPlayingHall = getPlayingHall;
