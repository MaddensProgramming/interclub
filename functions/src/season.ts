/** FRBE calendar V4, confirmed by the announcement of 25 September 2026. */
export const ACTIVE_SEASON = '2026';
export const SEASON_LABEL = '2026–2027';
export const DIVISION_FILE = 'division_2026.csv';

export const ROUND_DATES = [
  '2026-09-27', '2026-10-11', '2026-11-15', '2026-11-29',
  '2026-12-20', '2027-01-31', '2027-02-14', '2027-03-07',
  '2027-03-21', '2027-04-11', '2027-04-18',
];
export const DIVISION_SIX_CALENDAR_ROUNDS = [1, 2, 3, 4, 7, 8, 9, 10, 11];
export const DIVISION_SIX_DATES = DIVISION_SIX_CALENDAR_ROUNDS.map(
  (round) => ROUND_DATES[round - 1]
);

export function defaultRound(year: string, now = new Date()): number {
  if (year !== ACTIVE_SEASON) return ROUND_DATES.length;
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels' }).format(now);
  return Math.max(1, ROUND_DATES.filter((date) => date <= today).length);
}

/** Same strict 14:00 Brussels boundary as FRBE isRoundOpen, including DST. */
export function isRoundOpen(division: number, round: number, now = new Date()): boolean {
  const date = (division === 6 ? DIVISION_SIX_DATES : ROUND_DATES)[round - 1];
  if (!date) return false;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Brussels', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(now);
  const part = (type: string) => parts.find(p => p.type === type)!.value;
  const local = `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}:${part('second')}`;
  return local > `${date}T14:00:00` ||
    (local === `${date}T14:00:00` && now.getUTCMilliseconds() > 0);
}

/** Start a week before round one; allow two weeks for final corrections. */
export function isImportSeason(now = new Date()): boolean {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels' }).format(now);
  const shift = (date: string, days: number) => new Date(Date.parse(`${date}T12:00Z`) + days * 86400000).toISOString().slice(0, 10);
  return today >= shift(ROUND_DATES[0], -7) && today <= shift(ROUND_DATES[ROUND_DATES.length - 1], 14);
}

export function calendarRound(division: number, round: number): number {
  const result = division === 6 ? DIVISION_SIX_CALENDAR_ROUNDS[round - 1] : round;
  if (!Number.isInteger(round) || !result || result < 1 || result > ROUND_DATES.length) {
    throw new Error(`Invalid round ${round} in division ${division}`);
  }
  return result;
}

export const PAIRINGS_12 = [
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
export const PAIRINGS_10 = [
  ['1-10', '2-9', '3-8', '4-7', '5-6'],
  ['10-6', '7-5', '8-4', '9-3', '1-2'],
  ['2-10', '3-1', '4-9', '5-8', '6-7'],
  ['10-7', '8-6', '9-5', '1-4', '2-3'],
  ['3-10', '4-2', '5-1', '6-9', '7-8'],
  ['10-8', '9-7', '1-6', '2-5', '3-4'],
  ['4-10', '5-3', '6-2', '7-1', '8-9'],
  ['10-9', '1-8', '2-7', '3-6', '4-5'],
  ['5-10', '6-4', '7-3', '8-2', '9-1'],
];
// The separate 6J worksheet overrides the normal ten-slot pairing table.
// Results for this series are submitted to FRBE by email, outside its manager.
export const PAIRINGS_6J = [
  ['7-2', '4-3'], ['3-4'], ['3-2', '4-7'], ['2-3'], ['7-4'],
  ['3-7', '4-2'], ['7-3', '2-4'], ['2-7'], [],
];
