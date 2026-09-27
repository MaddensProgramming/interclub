const { test } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const { isRoundOpen, isImportSeason, ROUND_DATES, DIVISION_SIX_DATES } = require('../lib/season');
const { getAllResults } = require('../lib/frbeGatewayCalls');
const { getGameResult, getScoreWhite, getScoreBlack, isForfeit, revertResult } = require('../lib/utility');
const calendar = () => ({
  rounds11: Object.fromEntries(ROUND_DATES.map((date, i) => [i + 1, date])),
  rounds9: Object.fromEntries(DIVISION_SIX_DATES.map((date, i) => [i + 1, date])),
});

test('release boundary follows Brussels summer/winter time and D6 local rounds', () => {
  assert.equal(isRoundOpen(1, 1, new Date('2026-09-27T11:59:59Z')), false);
  assert.equal(isRoundOpen(1, 1, new Date('2026-09-27T12:00:00Z')), false);
  assert.equal(isRoundOpen(1, 1, new Date('2026-09-27T12:00:00.001Z')), true);
  assert.equal(isRoundOpen(1, 5, new Date('2026-12-20T12:59:59Z')), false);
  assert.equal(isRoundOpen(1, 5, new Date('2026-12-20T13:00:01Z')), true);
  assert.equal(isRoundOpen(6, 5, new Date('2026-12-20T13:00:01Z')), false);
  assert.equal(isRoundOpen(6, 5, new Date('2027-02-14T13:00:01Z')), true);
  assert.equal(isImportSeason(new Date('2026-09-19T12:00Z')), false);
  assert.equal(isImportSeason(new Date('2027-05-02T12:00Z')), true);
  assert.equal(isImportSeason(new Date('2027-05-03T12:00Z')), false);
});

test('future D6 responses are discarded even if upstream releases them with D1 round 5', async t => {
  const requested = [];
  t.mock.method(global, 'fetch', async url => {
    requested.push(url);
    return { ok: true, json: async () => url.endsWith('/icdata') ? calendar() : [{
      division: 6, index: 'A', teams: [], rounds: [{ round: 5, rdate: DIVISION_SIX_DATES[4], encounters: [] }],
    }] };
  });
  assert.deepEqual(await getAllResults(new Date('2026-12-20T13:15Z')), []);
  assert.equal(requested.length, 6); // calendar plus the five opened D1 rounds
  requested.length = 0;
  assert.deepEqual(await getAllResults(new Date('2026-09-27T11:00Z')), []);
  assert.equal(requested.length, 1);
});

test('all official result codes and corrections preserve scores without invented forfeits', () => {
  for (const [code, home, away, administrative] of [
    ['1-0', 1, 0, false], ['0-1', 0, 1, false], ['½-½', .5, .5, false],
    ['1-0 FF', 1, 0, true], ['0-1 FF', 0, 1, true], ['0-0 FF', 0, 0, true],
    ['½-0', .5, 0, true], ['0-½', 0, .5, true], ['Team FF', 0, 0, true],
  ]) {
    const result = getGameResult({ result: code, overruled: 'NOR' });
    assert.equal(getScoreWhite(result), home);
    assert.equal(getScoreBlack(result), away);
    assert.equal(getScoreWhite(revertResult(result)), away);
    assert.equal(isForfeit(result), administrative);
  }
  assert.equal(getScoreWhite(getGameResult({ result: '1-0', overruled: '0-½' })), 0);
  assert.equal(getScoreWhite(getGameResult({ result: '1-0', overruled: '' })), 1);
  assert.throws(() => getGameResult({ result: 'new-code' }), /Unknown FRBE/);
});

test('scheduled restart initializes once, waits safely, and stays idle in summer', async t => {
  let exists = false;
  const writes = [];
  const original = Module._load;
  Module._load = function(name, parent, ...args) {
    if (parent?.filename.endsWith('script.js') && name === './populateDb') return {
      seasonExists: async () => exists,
      publishSeason: async (divisions, clubs, players, overviews) => {
        assert.equal(divisions.length, 38);
        assert.equal(clubs.length, 106);
        assert.equal(players.length, 106);
        writes.push('metadata');
        assert.equal(overviews.length, 11);
        assert.ok(divisions.every(d => d.teams.every(team => team.rounds.every(r => !r.played))));
        writes.push('calendar');
        exists = true;
        return { unchanged: false };
      },
    };
    return original.call(this, name, parent, ...args);
  };
  t.after(() => { Module._load = original; });
  const { main } = require('../lib/script');
  let requests = 0;
  t.mock.method(global, 'fetch', async url => {
    requests++;
    const id = Number(url.split('/').pop());
    return { ok: true, json: async () => {
      if (url.endsWith('/icdata')) return calendar();
      if (url.includes('/venue/')) return { venues: [] };
      if (url.includes('/icclub/')) return { idclub: id, players: [{
        idnumber: id, first_name: 'Test', last_name: 'Player', assignedrating: 1500,
      }] };
      return [];
    } };
  });
  await main(new Date('2026-09-27T10:00Z'));
  assert.deepEqual(writes, ['metadata', 'calendar']);
  requests = 0;
  await main(new Date('2026-09-27T10:15Z'));
  assert.equal(requests, 1);
  assert.equal(writes.length, 2);
  await main(new Date('2026-09-27T12:15Z'));
  assert.equal(writes.length, 2);
  requests = 0;
  await main(new Date('2027-07-01T12:15Z'));
  assert.equal(requests, 0);
  assert.equal(writes.length, 2);
});
