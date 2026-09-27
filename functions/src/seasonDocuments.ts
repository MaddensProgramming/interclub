import { Division } from './models/Division';
import { ClubView } from './models/ClubView';
import { Player } from './models/Player';
import { RoundOverview } from './models/RoundOverview';
import { ACTIVE_SEASON, ROUND_DATES, DIVISION_SIX_DATES } from './season';

/** One final value per document, including players appearing in multiple lists. */
export function buildSeasonDocuments(divisions: Division[], clubs: ClubView[], players: Player[], rounds: RoundOverview[]) {
  const documents = new Map<string, any>();
  const put = (path: string, data: any) => documents.set(`years/${ACTIVE_SEASON}/${path}`, data);
  const classMap: Record<string, string[]> = {};
  for (const div of divisions) {
    (classMap[div.class] ??= []).push(div.division);
    put(`divisions/${div.class}${div.division}`, {
      ...div, teams: div.teams.filter(team => team.clubId !== 0).map(team => ({
        ...team, players: [], rounds: team.rounds.map(round => ({ ...round, games: [] })),
      })),
    });
  }
  put('overviews/divisions', { classes: Object.keys(classMap).map(key => ({ class: Number(key), divisions: classMap[key] })) });
  const toDate = (date: string) => new Date(`${date}T12:00:00Z`);
  put('dates/dates', { dates: ROUND_DATES.map(toDate), datesByDivision: { '6': DIVISION_SIX_DATES.map(toDate) } });
  const provinces: { id: number; clubs: { id: number; name: string }[] }[] = [];
  for (const club of clubs.filter(club => club.id !== 0)) {
    const id = Math.floor(club.id / 100);
    let province = provinces.find(item => item.id === id);
    if (!province) { province = { id, clubs: [] }; provinces.push(province); }
    province.clubs.push({ id: club.id, name: club.name });
  }
  put('clubOverview/overview', { provinces });
  put('overviews/simplelayers', { players: players.map(player => ({
    name: `${player.firstName} ${player.name}`, id: player.id,
  })).sort((a, b) => a.name.localeCompare(b.name)) });
  put('overviews/players', { players: players.map(player => Object.fromEntries(Object.entries({
    id: player.id, firstName: player.firstName, name: player.name, rating: player.rating,
    tpr: player.tpr, diff: player.diff, score: player.score, numberOfGames: player.numberOfGames,
  }).filter(([, value]) => value !== undefined))).sort((a, b) => Number(b.tpr) - Number(a.tpr)) });
  // Preserve the previous final record for duplicate IDs, but write it only once.
  for (const player of players) put(`players/${player.id}`, player);
  for (const club of clubs) {
    for (const team of club.teams) put(`club/${club.id}/team/${team.id}`, team);
    put(`club/${club.id}`, {
      ...club,
      players: club.players.map(player => ({ ...player, games: [] })).sort((a, b) => b.rating - a.rating),
      teams: club.teams.map(team => ({ ...team, players: [], rounds: [] })).sort((a, b) => a.id - b.id),
    });
  }
  rounds.forEach((round, i) => put(`roundOverview/${i + 1}`, round));
  return documents;
}
