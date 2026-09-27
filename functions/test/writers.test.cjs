const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Timestamp } = require('firebase-admin/firestore');
const { writeDocuments, documentHash } = require('../lib/documentWriter');
const { buildSeasonDocuments } = require('../lib/seasonDocuments');
const root = 'years/2026';
function stored(value) {
  if (value instanceof Date) return Timestamp.fromDate(value);
  if (value instanceof Timestamp) return value;
  if (Array.isArray(value)) return value.map(stored);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,stored(v)]));
  return value;
}
function database() {
  const data = new Map(), writes = [];
  let failPath, holdPath, release;
  const db = { doc: path => ({
    get: async () => ({ exists: data.has(path), data: () => data.get(path) }),
    set: async (value, options) => {
      if (path === failPath) throw new Error('write failed');
      if (path === holdPath) await new Promise(resolve => { release = resolve; });
      writes.push(path);
      data.set(path, stored(options?.merge ? { ...data.get(path), ...value } : value));
    },
  }) };
  return { db, data, writes, fail: path => { failPath = path; }, hold: path => { holdPath = path; }, release: () => release() };
}
const plan = score => new Map([
  [root+'/dates/dates', { dates:[new Date('2026-09-27T12:00Z')] }],
  [root+'/players/1', { id:1, score }],
]);

test('identical complete imports cost zero writes and one read; timestamp stays unchanged', async () => {
  const fake = database();
  await writeDocuments(fake.db, root, plan(0), {now:new Date('2026-09-27T12:00Z')});
  const before = fake.writes.length;
  const timestamp = fake.data.get(root).lastUpdate;
  const result = await writeDocuments(fake.db, root, plan(0), {now:new Date('2026-09-27T12:15Z')});
  assert.deepEqual(result, {reads:1,writes:0,unchanged:true});
  assert.equal(fake.writes.length, before);
  assert.equal(fake.data.get(root).lastUpdate, timestamp);
  const audit = await writeDocuments(fake.db, root, plan(0), {verifyDocuments:true});
  assert.equal(audit.writes, 0);
  assert.equal(audit.reads, 3);
});

test('a changed score writes only its document and the pending/completion markers', async () => {
  const fake = database();
  await writeDocuments(fake.db, root, plan(0));
  fake.writes.length = 0;
  await writeDocuments(fake.db, root, plan(1));
  assert.deepEqual(fake.writes, [root, root+'/players/1',root]);
  assert.equal(fake.data.get(root).importPending, false);
});

test('Date/Timestamp, map key order and microsecond storage precision compare equally', () => {
  const date = new Date('2026-09-27T12:00Z');
  assert.equal(documentHash({b:2,a:[date]}), documentHash({a:[Timestamp.fromDate(date)],b:2}));
  assert.equal(documentHash(new Timestamp(1,1001)),documentHash(new Timestamp(1,1999)));
  assert.notEqual(documentHash([1,2]),documentHash([2,1]));
  assert.notEqual(documentHash({a:null}),documentHash({}));
});

test('existing records adopt the fingerprint once without rewriting data or the old timestamp', async () => {
  const fake = database();
  for (const [path,value] of plan(0)) fake.data.set(path,stored(value));
  const date = Timestamp.fromDate(new Date('2026-09-27T10:00Z'));
  fake.data.set(root,{lastUpdate:date,custom:'retained'});
  await writeDocuments(fake.db, root, plan(0));
  assert.deepEqual(fake.writes,[root]);
  assert.equal(fake.data.get(root).lastUpdate,date);
  assert.equal(fake.data.get(root).custom,'retained');
});

test('failed partial writes cannot mark success or fool the fast path when input reverts', async () => {
  const fake = database();
  const original = new Map([[root+'/players/1',{score:0}],[root+'/players/2',{score:0}]]);
  await writeDocuments(fake.db,root,original);
  const completed = fake.data.get(root).importFingerprint;
  fake.fail(root+'/players/2');
  await assert.rejects(writeDocuments(fake.db,root,new Map([[root+'/players/1',{score:1}],[root+'/players/2',{score:1}]])),/write failed/);
  assert.equal(fake.data.get(root).importPending,true);
  assert.equal(fake.data.get(root).importFingerprint,completed);
  fake.fail(undefined);
  await writeDocuments(fake.db,root,original);
  assert.equal(fake.data.get(root+'/players/1').score,0);
  assert.equal(fake.data.get(root).importPending,false);
});

test('all writes finish before the completion marker; invalid plans write nothing', async () => {
  const fake = database();
  fake.hold(root+'/players/1');
  const pending = writeDocuments(fake.db,root,plan(0));
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(fake.data.get(root).lastUpdate,undefined);
  fake.release();
  await pending;
  assert.ok(fake.data.get(root).lastUpdate);
  const writes = fake.writes.length;
  await assert.rejects(writeDocuments(fake.db,root,new Map([['years/2025/players/1',{score:1}]])),/outside target/);
  await assert.rejects(writeDocuments(fake.db,root,new Map([[root+'/players/1',{score:undefined}]])),/Undefined/);
  assert.equal(fake.writes.length,writes);
});

test('document plan deduplicates player IDs and preserves calendar, clubs, teams and source objects', () => {
  const first = {id:1,firstName:'A',name:'B',rating:1500,tpr:1500,score:0,numberOfGames:0,games:[],clubId:401};
  const last = {...first,clubId:402};
  const team = {id:1,clubId:401,rounds:[],players:[]};
  const clubs = [{id:401,name:'Club',players:[first],teams:[team]}];
  const before = JSON.stringify(clubs);
  const documents = buildSeasonDocuments([],clubs,[first,last],[]);
  assert.equal([...documents.keys()].filter(p=>p.includes('/players/')).length,1);
  assert.equal(documents.get(root+'/players/1').clubId,402);
  assert.equal(documents.get(root+'/dates/dates').dates.length,11);
  assert.equal(documents.get(root+'/dates/dates').datesByDivision['6'][4].toISOString().slice(0,10),'2027-02-14');
  assert.deepEqual(documents.get(root+'/club/401/team/1'),team);
  assert.equal(JSON.stringify(clubs),before);
});
