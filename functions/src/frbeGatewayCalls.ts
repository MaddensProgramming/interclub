import { PlayingHall } from './models/PlayingHall';
import { PlayerFrbe, DivisionFrbe } from './modelsFRBE';
import { ROUND_DATES, DIVISION_SIX_DATES, isRoundOpen } from './season';

const API = 'https://www.frbe-kbsb-ksb.be/api/v1/interclubs';

async function getJson(path: string): Promise<any> {
  const response = await fetch(`${API}/${path}`, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`FRBE ${path}: HTTP ${response.status}`);
  return response.json();
}

/** The public API is unversioned. Never import another season into this year. */
export async function verifySourceSeason(): Promise<void> {
  const data = await getJson('icdata');
  for (const [key, dates] of [['rounds11', ROUND_DATES], ['rounds9', DIVISION_SIX_DATES]] as const) {
    if (Object.keys(data[key] ?? {}).length !== dates.length ||
        dates.some((date, index) => data[key][index + 1] !== date)) {
      throw new Error(`FRBE ${key} calendar does not match season 2026–2027`);
    }
  }
}

/** Join by division/series and actual round, never by response array position. */
export function mergeResults(responses: DivisionFrbe[][]): DivisionFrbe[] {
  const series = new Map<string, DivisionFrbe>();
  for (const response of responses) {
    if (!Array.isArray(response)) throw new Error('FRBE results must be an array');
    for (const division of response) {
      if (!Number.isInteger(division.division) || division.division < 1 || division.division > 6 ||
          typeof division.index !== 'string' || !Array.isArray(division.rounds)) {
        throw new Error('Invalid FRBE series response');
      }
      const key = `${division.division}${division.index || 'A'}`;
      let target = series.get(key);
      if (!target) {
        target = { ...division, rounds: [] };
        series.set(key, target);
      }
      const dates = division.division === 6 ? DIVISION_SIX_DATES : ROUND_DATES;
      for (const round of division.rounds) {
        if (!Number.isInteger(round.round) || !dates[round.round - 1] ||
            !Array.isArray(round.encounters) || round.rdate?.slice(0, 10) !== dates[round.round - 1]) {
          throw new Error(`Invalid date or round in FRBE ${key}: ${round.round}`);
        }
        const existing = target.rounds.find((item) => item.round === round.round);
        if (existing && JSON.stringify(existing) !== JSON.stringify(round)) {
          throw new Error(`Conflicting FRBE round ${round.round} in ${key}`);
        }
        if (!existing) target.rounds.push(round);
      }
    }
  }
  return [...series.values()].map((division) => ({
    ...division, rounds: division.rounds.sort((a, b) => a.round - b.round),
  }));
}

export async function getAllResults(now = new Date()): Promise<DivisionFrbe[]> {
  await verifySourceSeason();
  const responses: DivisionFrbe[][] = [];
  for (let round = 1; round <= ROUND_DATES.length; round++) {
    if (!isRoundOpen(1, round, now)) continue;
    responses.push(await getJson(`anon/icseries?round=${round}`));
  }
  // Upstream checks rounds11 without passing division=6; respect the D6 dates here.
  return mergeResults(responses).map(division => ({
    ...division, rounds: division.rounds.filter(round => isRoundOpen(division.division, round.round, now)),
  })).filter(division => division.rounds.length > 0);
}

export async function getPlayers(clubId: number): Promise<PlayerFrbe[]> {
  const data = await getJson(`anon/icclub/${clubId}`);
  if (data.idclub !== clubId || !Array.isArray(data.players) || !data.players.length) {
    throw new Error(`Missing FRBE player list for club ${clubId}`);
  }
  return data.players;
}

export async function getPlayingHall(clubId: number): Promise<PlayingHall[]> {
  const data = await getJson(`anon/venue/${clubId}`);
  if (!Array.isArray(data.venues)) throw new Error(`Missing FRBE venues for club ${clubId}`);
  return data.venues;
}
