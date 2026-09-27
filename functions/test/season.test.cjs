const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readAndProcessCsv, validateResultCoverage, main } = require('../lib/script');
const { csvToJsonObject, convertToDivisions } = require('../lib/readCSV');
const { populateRounds, createRoundOverviews, groupTeamsByClub, fillTeamsAndPlayersWithInfoFromJson } = require('../lib/transformationsMethods');
const { mergeResults, getAllResults, getPlayers } = require('../lib/frbeGatewayCalls');
const { ROUND_DATES, DIVISION_SIX_DATES, defaultRound } = require('../lib/season');

const sourceRound = (division, index, round) => ({ division, index, teams: [], rounds: [{
  round, rdate: (division === 6 ? DIVISION_SIX_DATES : ROUND_DATES)[round - 1], encounters: [],
}] });
const sourceCalendar = () => ({
  rounds11: Object.fromEntries(ROUND_DATES.map((date, i) => [i + 1, date])),
  rounds9: Object.fromEntries(DIVISION_SIX_DATES.map((date, i) => [i + 1, date])),
});

test('default round follows Brussels match days and keeps archives at their last round', () => {
  assert.equal(defaultRound('2026', new Date('2026-09-01T12:00Z')), 1);
  assert.equal(defaultRound('2026', new Date('2026-12-20T12:00Z')), 5);
  assert.equal(defaultRound('2026', new Date('2027-02-13T23:30Z')), 7);
  assert.equal(defaultRound('2025', new Date('2026-09-27T12:00Z')), 11);
});

test('official V4 input has 38 series, 416 real teams, 14 byes and 106 clubs', async () => {
  const divisions = await readAndProcessCsv();
  const teams = divisions.flatMap(d => d.teams);
  assert.equal(divisions.length, 38);
  assert.equal(teams.filter(t => t.clubId !== 0).length, 416);
  assert.equal(teams.filter(t => t.clubId === 0).length, 14);
  assert.equal(groupTeamsByClub(teams).length, 106);
  assert.ok(groupTeamsByClub(teams).every(c => c.id !== 0));
  assert.deepEqual([1, 2, 3, 4, 5, 6].map(n => divisions.filter(d => d.class === n).length), [1, 2, 4, 8, 10, 13]);
});

test('D1–5 have eleven pairings; ordinary D6 teams meet all nine opponents once', async () => {
  for (const div of await readAndProcessCsv()) {
    if (div.class === 6 && div.division === 'J') continue;
    const rounds = div.class === 6 ? 9 : 11;
    for (const team of div.teams) {
      assert.equal(team.rounds.length, rounds);
      const opponents = team.rounds.map(r => r.teamHome.pairingsNumber === team.pairingsNumber ? r.teamAway.pairingsNumber : r.teamHome.pairingsNumber);
      assert.equal(new Set(opponents).size, rounds);
      assert.ok(!opponents.includes(team.pairingsNumber));
    }
  }
});

test('D6 pairing number 7 is away in round 4; local round 5 is February 14', async () => {
  const div = (await readAndProcessCsv()).find(d => d.class === 6 && d.division === 'A');
  assert.equal(div.teams[6].rounds[3].teamAway.pairingsNumber, 7);
  assert.equal(div.teams[6].rounds[4].calendarRound, 7);
  assert.equal(DIVISION_SIX_DATES[4], '2027-02-14');
});

test('6J uses its twelve official encounters, six per real team, including returns', async () => {
  const div = (await readAndProcessCsv()).find(d => d.class === 6 && d.division === 'J');
  const teams = div.teams.filter(t => t.clubId !== 0);
  assert.equal(teams.length, 4);
  assert.ok(teams.every(t => t.rounds.length === 6 && t.resultsNote));
  const homeGames = teams.flatMap(t => t.rounds.filter(r => r.teamHome.pairingsNumber === t.pairingsNumber));
  assert.equal(homeGames.length, 12);
  assert.equal(new Set(homeGames.map(r => `${r.teamHome.pairingsNumber}-${r.teamAway.pairingsNumber}`)).size, 12);
  assert.deepEqual(teams.find(t => t.pairingsNumber === 2).rounds.map(r => r.id), [1, 3, 4, 6, 7, 8]);
  assert.ok(!homeGames.some(r => r.id === 9));
});

test('overviews join by match day, remove byes and never invent D6 games on days 5/6', async () => {
  const overviews = createRoundOverviews(await readAndProcessCsv());
  assert.equal(overviews.length, 11);
  assert.ok(overviews[4].divisions.every(d => d.class < 6));
  assert.ok(overviews[5].divisions.every(d => d.class < 6));
  assert.ok(overviews[6].divisions.filter(d => d.class === 6).every(d => d.matches.every(r => r.id === 5)));
  for (const overview of overviews) for (const div of overview.divisions) for (const match of div.matches) {
    assert.notEqual(match.teamHome.clubId, 0);
    assert.notEqual(match.teamAway.clubId, 0);
    assert.ok(Number.isFinite(match.averageRatingHome));
  }
  assert.equal(overviews[10].divisions.some(d => d.class === 6 && d.division === 'J'), false);
});

test('parser accepts division 1 without a letter and Bye N, rejects malformed teams', () => {
  const data = convertToDivisions(csvToJsonObject('Division 1 Afdeling\n601 CRELEL 1\nBye 1\n'));
  assert.equal(data[0].division, 'A');
  assert.equal(data[0].teams[1].clubId, 0);
  assert.throws(() => csvToJsonObject('Division 6A Afdeling\ninvalid\n'), /Invalid team/);
  assert.throws(() => populateRounds(data[0]), /pairing slots/);
});

test('results merge by series and round even when series are reordered or initially absent', () => {
  const data = mergeResults([
    [sourceRound(1, '', 1)],
    [sourceRound(6, 'A', 5), sourceRound(1, '', 2)],
    [sourceRound(6, 'A', 1), sourceRound(1, '', 1)],
  ]);
  assert.deepEqual(data.find(d => d.division === 1).rounds.map(r => r.round), [1, 2]);
  assert.deepEqual(data.find(d => d.division === 6).rounds.map(r => r.round), [1, 5]);
});

test('invalid/stale result dates and conflicting duplicate rounds stop the import', () => {
  const stale = sourceRound(1, '', 1);
  stale.rounds[0].rdate = '2025-09-28';
  assert.throws(() => mergeResults([[stale]]), /Invalid date/);
  assert.throws(() => mergeResults([[sourceRound(6, 'A', 10)]]), /Invalid date/);
  assert.throws(() => mergeResults([{}]), /must be an array/);
  const a = sourceRound(1, '', 1), b = sourceRound(1, '', 1);
  b.rounds[0].encounters = [{ played: false }];
  assert.throws(() => mergeResults([[a], [b]]), /Conflicting/);
});

test('a sparse result for D6 round 5 updates round 5, not array position 0', async () => {
  const div = (await readAndProcessCsv()).find(d => d.class === 6 && d.division === 'A');
  const round = div.teams[2].rounds.find(r => r.id === 5); // 3-10
  const players = [1, 2].map(id => ({ id, firstName: '', name: `P${id}`, rating: 1600, score: 0, numberOfGames: 0, games: [] }));
  const data = sourceRound(6, 'A', 5);
  data.rounds[0].encounters.push({
    icclub_home: round.teamHome.clubId, icclub_visit: round.teamAway.clubId,
    pairingnr_home: 3, pairingnr_visit: 10, played: true,
    boardpoint2_home: 2, boardpoint2_visit: 0, matchpoint_home: 2, matchpoint_visit: 0,
    games: [{ idnumber_home: 1, idnumber_visit: 2, result: '1-0', overruled: 'NOR' }],
  });
  fillTeamsAndPlayersWithInfoFromJson([data], div.teams, players);
  assert.equal(round.scoreHome, 1);
  assert.equal(round.games[0].round, 5);
  assert.equal(div.teams[2].rounds[0].games.length, 0);
  assert.equal(div.teams[2].matchPoints, 2);
  assert.equal(players[0].score, 1);
});

test('unplayed encounters do not turn empty boards into forfeits/statistics', async () => {
  const div = (await readAndProcessCsv())[0];
  const data = sourceRound(1, '', 1);
  data.rounds[0].encounters.push({ played: false, games: [{}] });
  fillTeamsAndPlayersWithInfoFromJson([data], div.teams, []);
  assert.ok(div.teams.every(t => t.matchPoints === 0 && t.rounds.every(r => !r.played)));
});

test('official match and board totals survive administrative decisions without board games', async () => {
  const div = (await readAndProcessCsv())[0];
  const home = div.teams[0], away = div.teams[11];
  const data = sourceRound(1, '', 1);
  data.rounds[0].encounters.push({
    icclub_home: home.clubId, icclub_visit: away.clubId, pairingnr_home: 1, pairingnr_visit: 12,
    played: true, games: [], boardpoint2_home: 0, boardpoint2_visit: 16,
    matchpoint_home: 0, matchpoint_visit: 0,
  });
  fillTeamsAndPlayersWithInfoFromJson([data], div.teams, []);
  assert.equal(home.rounds[0].played, true);
  assert.equal(home.rounds[0].scoreAway, 8);
  assert.equal(away.boardPoints, 8);
  assert.equal(away.matchPoints, 0); // do not infer two match points from 0-8
});

test('partial result coverage is rejected; 6J may be absent from the regular API', async () => {
  const divisions = await readAndProcessCsv();
  const now = new Date('2026-09-27T12:15Z');
  assert.throws(() => validateResultCoverage(divisions, [], now), /missing series/);
  const results = divisions.filter(d => !(d.class === 6 && d.division === 'J')).map(d => sourceRound(d.class, d.division, 1));
  for (const source of results) {
    const div = divisions.find(d => d.class === source.division && d.division === source.index);
    source.rounds[0].encounters = div.teams.flatMap(t => t.rounds.filter(r => r.id === 1 &&
      r.teamHome.pairingsNumber === t.pairingsNumber && r.teamHome.clubId && r.teamAway.clubId).map(r => ({
        icclub_home: r.teamHome.clubId, icclub_visit: r.teamAway.clubId,
        pairingnr_home: r.teamHome.pairingsNumber, pairingnr_visit: r.teamAway.pairingsNumber,
        played: false, games: [],
      })));
  }
  assert.doesNotThrow(() => validateResultCoverage(divisions, results, now));
  assert.throws(() => validateResultCoverage(divisions, results, new Date('2026-10-11T12:15Z')), /missing round 2/);
  results[0].rounds[0].encounters.pop();
  assert.throws(() => validateResultCoverage(divisions, results, now), /missing or duplicating an encounter/);
});

test('empty live feed after opening is a successful no-op before Firebase is initialized', async t => {
  const calls = [];
  t.mock.method(global, 'fetch', async url => {
    calls.push(url);
    return { ok: true, json: async () => url.endsWith('/icdata') ? sourceCalendar() : [] };
  });
  await main(new Date('2026-09-27T12:15Z'));
  assert.equal(calls.length, 2);
  assert.equal(require.cache[require.resolve('../lib/populateDb')], undefined);
});

test('stale season and HTTP failures propagate instead of overwriting player data', async t => {
  t.mock.method(global, 'fetch', async () => ({ ok: true, json: async () => ({ rounds11: {} }) }));
  await assert.rejects(getAllResults(), /does not match season/);
  global.fetch = async () => ({ ok: false, status: 503 });
  await assert.rejects(getPlayers(401), /HTTP 503/);
});
