import { store } from './initiateDB';
import { ACTIVE_SEASON } from './season';
import { buildSeasonDocuments } from './seasonDocuments';
import { writeDocuments } from './documentWriter';
import { Division } from './models/Division';
import { ClubView } from './models/ClubView';
import { Player } from './models/Player';
import { RoundOverview } from './models/RoundOverview';

export async function seasonExists(): Promise<boolean> {
  const snapshot = await store.doc(`years/${ACTIVE_SEASON}`).get();
  return !!snapshot.data()?.lastUpdate && !snapshot.data()?.importPending;
}

export async function publishSeason(divisions: Division[], clubs: ClubView[], players: Player[], rounds: RoundOverview[]) {
  const result = await writeDocuments(store, `years/${ACTIVE_SEASON}`, buildSeasonDocuments(divisions, clubs, players, rounds));
  console.log('INTERCLUB_WRITES', JSON.stringify(result));
  return result;
}
