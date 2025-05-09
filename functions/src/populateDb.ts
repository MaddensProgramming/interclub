import { setDoc, doc, DocumentReference, getDoc } from 'firebase/firestore';
import { RoundOverview } from './models/RoundOverview';
import { ProvinceOverview } from './models/ProvinceOverview';
import { ClubOverview } from './models/ClubOverview';
import { ClubView } from './models/ClubView';
import { ClassOverview } from './models/ClassOverview';
import { Player } from './models/Player';
import { Division } from './models/Division';
import { TeamView } from './models/TeamView';
import { store } from './initiateDB';
import { isEqual } from 'lodash';

const year = '2024';

export const executeOncePerYear = (
  divisions: Division[],
  clubs: ClubView[],
  players: Player[]
) => {
  generateClassOverview(divisions);
  generateRoundDates();
  generateClubOverview(clubs);
  generatePlayerSearchIndexOverview(players);
};
export const executeEveryRound = async (
  divisions: Division[],
  roundOverview: RoundOverview[],
  players: Player[],
  clubs: ClubView[]
): Promise<void> => {
  await generateDivisions(divisions);
  console.log('Divisions done');

  await generateHallOfFameOverview(players);
  console.log('Hall Of fame done');

  await generatePlayerOverview(players);
  console.log('Player overview done');

  await generateTeamDocs(clubs);
  console.log('Teamdocs done');

  await generateClubDocs(clubs);
  console.log('Clubdocs done');

  await generateLastUpdated();
  console.log('Date set');

  await generateRoundOverviews(roundOverview);
  console.log('Roundoverview done');
};

//generates the standings
export async function generateDivisions(divisions: Division[]): Promise<void> {
  for (const originalDiv of divisions) {
    // Making a shallow copy of the division
    const div: Division = {
      ...originalDiv,
      teams: originalDiv.teams.map((team) => ({
        ...team,
        players: [], // setting players to an empty list
        rounds: team.rounds?.map((round) => ({
          ...round,
          games: [], // setting games to an empty list
        })),
      })),
    };

    const ref = doc(
      store,
      'years',
      year,
      'divisions',
      div.class + div.division
    );
    await updateIfChanged(ref, div);
  }
}
//generates the hall of fame
export async function generateHallOfFameOverview(
  players: Player[]
): Promise<void> {
  const playersHallOfFame = players
    .map((player) => {
      const filteredPlayer = {
        id: player.id,
        firstName: player.firstName,
        name: player.name,
        rating: player.rating,
        tpr: player.tpr,
        diff: player.diff,
        score: player.score,
        numberOfGames: player.numberOfGames,
      };

      // Remove properties with undefined values
      Object.keys(filteredPlayer).forEach((key) => {
        if (filteredPlayer[key] === undefined) {
          delete filteredPlayer[key];
        }
      });

      return filteredPlayer;
    })
    .sort((a, b) => b.tpr - a.tpr);

  const ref = doc(store, 'years', year, 'overviews', 'players');
  await updateIfChanged(ref, { players: playersHallOfFame });
}
//generates the personal player page
export async function generatePlayerOverview(players: Player[]): Promise<void> {
  for (const player of players) {
    const ref = doc(store, 'years', year, 'players', player.id.toString());
    await updateIfChanged(ref, player);
  }
}
//generates the personal player page
export async function generateLastUpdated(): Promise<void> {
  try {
    await setDoc(doc(store, 'years', year), {
      lastUpdate: new Date(),
    });
  } catch (err) {
    console.error(err.message);
  }
}
export async function generateClubDocs(clubs: ClubView[]): Promise<void> {
  const copiedClubs = clubs.map((club) => {
    return {
      ...club,
      players: club.players
        .map((player) => ({
          ...player,
          games: [],
        }))
        .sort((a, b) => b.rating - a.rating),
      teams: club.teams
        .map((team) => ({
          ...team,
          players: [],
          rounds: [],
        }))
        .sort((a, b) => a.id - b.id),
    };
  });

  for (const copiedClub of copiedClubs) {
    const ref = doc(store, 'years', year, 'club', copiedClub.id.toString());
    await updateIfChanged(ref, copiedClub);
  }
}
//generates the team page
export async function generateTeamDocs(clubs: ClubView[]): Promise<void> {
  clubs = clubs.map((club) => {
    return {
      id: club.id,
      name: club.name,
      players: club.players
        .map((player) => ({
          ...player,
          games: [],
        }))
        .sort((a, b) => b.rating - a.rating),
      teams: club.teams.sort((a, b) => a.id - b.id),
    };
  });

  for (const club of clubs) {
    for (const team of club.teams) {
      const ref = doc(
        store,
        'years',
        year,
        'club',
        club.id.toString(),
        'team',
        team.id.toString()
      );
      updateIfChanged(ref, team);
    }
  }
}
//generates the round results page
export async function generateRoundOverviews(
  roundOverviews: RoundOverview[]
): Promise<void> {
  const promises = roundOverviews.map(async (roundOverview, index) => {
    const roundNumber = index + 1;
    const ref = doc(store, 'years', year, 'roundOverview', `${roundNumber}`);
    await updateIfChanged(ref, roundOverview);
  });

  try {
    await Promise.all(promises);
    console.log('All rounds saved successfully');
  } catch (err) {
    console.error('Error saving rounds:', err.message);
  }
}

//Once per year
export async function generateRoundDates() {
  var dates = {
    dates: [
      new Date(2024, 8, 29), // 24/09/2023
      new Date(2024, 9, 6), // 15/10/2023
      new Date(2024, 10, 3), // 22/10/2023
      new Date(2024, 10, 17), // 19/11/2023
      new Date(2024, 11, 1), // 3/12/2023
      new Date(2025, 0, 26), // 28/01/2024
      new Date(2025, 1, 2), // 4/02/2024
      new Date(2025, 1, 16), // 18/02/2024
      new Date(2025, 2, 16), // 10/03/2024
      new Date(2025, 2, 30), // 24/03/2024
      new Date(2025, 3, 27), // 21/04/2024
    ],
  };

  try {
    await setDoc(doc(store, 'years', year, 'dates', 'dates'), dates);
  } catch (err) {
    console.error(err.message);
  }
}
export async function generateClassOverview(
  divisions: Division[]
): Promise<void> {
  const classMap: Record<string, string[]> = {};

  divisions.forEach((div) => {
    if (!classMap[div.class]) {
      classMap[div.class] = [];
    }
    classMap[div.class].push(div.division);
  });

  const classOverview: ClassOverview = {
    classes: Object.keys(classMap).map((key) => ({
      class: parseInt(key, 10),
      divisions: classMap[key],
    })),
  };
  try {
    await setDoc(
      doc(store, 'years', year, 'overviews', 'divisions'),
      classOverview
    );
  } catch (err) {
    console.error(err.message);
  }
}
export async function generateClubOverview(clubs: ClubView[]): Promise<void> {
  try {
    await setDoc(
      doc(store, 'years', year, 'clubOverview', 'overview'),
      generateOverview(clubs)
    );
  } catch (err) {
    console.error(err.message);
  }
}
export async function generatePlayerSearchIndexOverview(
  players: Player[]
): Promise<void> {
  const playersOverview = players
    .map((player) => {
      return { name: player.firstName + ' ' + player.name, id: player.id };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  try {
    await setDoc(doc(store, 'years', year, 'overviews', 'simplelayers'), {
      players: playersOverview,
    });
  } catch (err) {
    console.error(err.message);
  }
}
function generateOverview(clubs: ClubView[]): ClubOverview {
  const overview: ClubOverview = { provinces: [] };

  clubs
    .filter((club) => club.id !== 0)
    .forEach((club) => addToProvince(club, overview));
  return overview;
}
function addToProvince(club: ClubView, overview: ClubOverview): void {
  const provinceId = Math.floor(club.id / 100);
  const province: ProvinceOverview = overview.provinces.find(
    (prov) => prov.id === provinceId
  );
  if (!province)
    overview.provinces.push({
      id: provinceId,
      clubs: [{ id: club.id, name: club.name }],
    });
  else province.clubs.push({ id: club.id, name: club.name });
}

// Utility function to set document only if data changed
async function updateIfChanged(
  ref: DocumentReference,
  data: any
): Promise<void> {
  try {
    const docSnapshot = await getDoc(ref);

    if (!docSnapshot.exists() || !isEqual(docSnapshot.data(), data)) {
      await setDoc(ref, data);
    }
  } catch (err) {
    console.error(err.message);
  }
}
