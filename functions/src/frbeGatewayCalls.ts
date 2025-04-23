import { PlayingHall } from './models/PlayingHall';
import { PlayerFrbe } from './modelsFRBE';
import { DivisionFrbe } from './modelsFRBE';

export async function getAllResults(): Promise<DivisionFrbe[]> {
  const roundsToFetch = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // You can add more rounds to this array as needed

  try {
    // Fetch data for each round and store in an array
    const allFetchedData: DivisionFrbe[][] = [];
    for (const round of roundsToFetch) {
      const response = await fetch(
        `https://www.frbe-kbsb-ksb.be/api/v1/interclubs/anon/icseries?round=${round}`
      );
      const data = await response.json();
      allFetchedData.push(data);
    }

    // Initialize the final data with the results of the first round
    const finalData = allFetchedData[0];

    // Now, let's merge the rounds from all fetched data sets
    for (let i = 1; i < allFetchedData.length; i++) {
      finalData.forEach((division, index) => {
        if (
          allFetchedData[i][index] &&
          Array.isArray(allFetchedData[i][index].rounds)
        ) {
          division.rounds.push(...allFetchedData[i][index].rounds);
        }
      });
    }

    return finalData;
  } catch (err) {
    console.error('Error fetching JSON', err);
    throw err;
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
