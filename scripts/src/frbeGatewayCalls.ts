import { PlayingHall } from './models';
import { PlayerFrbe } from './modelsFRBE';
import { DivisionFrbe } from './modelsFRBE';

export async function getAllResults(): Promise<DivisionFrbe[]> {
  try {
    const response = await fetch(
      `https://www.frbe-kbsb-ksb.be/api/v1/interclubs/anon/icseries`
    );
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Error fetching josn', err);
    return null;
  }
}
export async function getPlayers(clubId: number): Promise<PlayerFrbe[]> {
  try {
    const response = await fetch(
      `https://www.frbe-kbsb-ksb.be/api/v1/interclubs/anon/icclub/${clubId}`
    );
    const data = await response.json();
    return data.players;
  } catch (err) {
    console.error('Error fetching players:', err);
    return null;
  }
}
export async function getPlayingHall(clubId: number): Promise<PlayingHall[]> {
  try {
    const response = await fetch(
      `https://www.frbe-kbsb-ksb.be/api/v1/interclubs/anon/venue/${clubId}`
    );
    const data = await response.json();
    return data.venues;
  } catch (err) {
    console.error('Error fetching playing hall:', err);
    return null;
  }
}
