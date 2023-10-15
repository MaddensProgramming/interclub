import { setDoc, doc } from 'firebase/firestore';
import {
  Division,
  ClassOverview,
  TeamView,
  ClubView,
  ClubOverview,
  ProvinceOverview,
  Player,
  RoundOverview,
} from './models';
import { store } from './initiateDB';
import { getPlayingHall } from './frbeGatewayCalls';

const year = '2024';
//generates the standings
export function generateDivisions(divisions: Division[]): void {
  divisions.forEach((originalDiv) => {
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

    setDoc(
      doc(store, 'years', year, 'divisions', div.class + div.division),
      div
    )
      .then(() => {
        console.log(div.class + div.division);
      })
      .catch((err) => {
        console.error(err.message);
      });
  });
}
//generates the hall of fame
export function generateHallOfFameOverview(players: Player[]): void {
  const playersHallOfFame = players
    .map((player) => ({
      ...player,
      games: [],
    }))
    .sort((a, b) => b.tpr - a.tpr);

  setDoc(doc(store, 'years', year, 'overviews', 'players'), {
    players: playersHallOfFame,
  })
    .then(() => {
      console.log('done players');
    })
    .catch((err) => {
      console.error(err.message);
    });
}

//generates the personal player page
export function generatePlayerOverview(players: Player[]): void {
  let count = 1;
  players.forEach((player) => {
    setDoc(doc(store, 'years', year, 'players', player.id.toString()), player)
      .then(() => {
        if (count % 100 === 1) console.log(count++);
      })
      .catch((err) => {
        console.error(err.message);
      });
  });
}

//generates the personal player page
export function generateLastUpdated(): void {
  setDoc(doc(store, 'years', year, 'lastUpdate'), {
    lastUpdate: new Date(),
  })
    .then(() => {
      console.log('updated date');
    })
    .catch((err) => {
      console.error(err.message);
    });
}

//generates the club page (updating players)
export function generateClubDocs(clubs: ClubView[]): void {
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

  copiedClubs.forEach(async (copiedClub) => {
    copiedClub.venues = await getPlayingHall(copiedClub.id);
    setDoc(
      doc(store, 'years', year, 'club', copiedClub.id.toString()),
      copiedClub
    )
      .then(() => console.log(copiedClub.name))
      .catch((err) => console.error(err.message, copiedClub.name));
  });
}

//generates the team page
export function generateTeamDocs(clubs: ClubView[]): void {
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

  clubs.forEach(async (club) => {
    club.teams.forEach((team) =>
      setDoc(
        doc(
          store,
          'years',
          year,
          'club',
          club.id.toString(),
          'team',
          team.id.toString()
        ),
        team
      )
        .then(() => console.log(club.name, team.id))
        .catch((err) => console.log(err, club.name, team.id))
    );
  });
}
//generates the round results page
export function generateRoundOverview(roundOverview: RoundOverview): void {
  setDoc(doc(store, 'years', year, 'roundOverview', '1'), roundOverview)
    .then(() => console.log('succes'))
    .catch((err) => console.error(err.message));
}

//Once per year
export function generateRoundDates() {
  var dates = {
    dates: [
      new Date(2023, 8, 24), // 24/09/2023
      new Date(2023, 9, 15), // 15/10/2023
      new Date(2023, 9, 22), // 22/10/2023
      new Date(2023, 10, 19), // 19/11/2023
      new Date(2023, 11, 3), // 3/12/2023
      new Date(2024, 0, 28), // 28/01/2024
      new Date(2024, 1, 4), // 4/02/2024
      new Date(2024, 1, 18), // 18/02/2024
      new Date(2024, 2, 10), // 10/03/2024
      new Date(2024, 2, 24), // 24/03/2024
      new Date(2024, 3, 21), // 21/04/2024
    ],
  };

  setDoc(doc(store, 'years', year, 'dates', 'dates'), dates)
    .then(() => {
      console.log('done dates');
    })
    .catch((err) => {
      console.error(err.message);
    });
}
export function generateClassOverview(divisions: Division[]): void {
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

  setDoc(doc(store, 'years', year, 'overviews', 'divisions'), classOverview)
    .then(() => {
      console.log('done division overview');
    })
    .catch((err) => {
      console.error(err.message);
    });
}
export function generateClubOverview(clubs: ClubView[]): void {
  setDoc(
    doc(store, 'years', year, 'clubOverview', 'overview'),
    generateOverview(clubs)
  )
    .then(() => console.log('succes'))
    .catch((err) => console.error(err.message));
}
export function generatePlayerSearchIndexOverview(players: Player[]): void {
  const playersOverview = players
    .map((player) => {
      return { name: player.firstName + ' ' + player.name, id: player.id };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  setDoc(doc(store, 'years', year, 'overviews', 'simplelayers'), {
    players: playersOverview,
  })
    .then(() => {
      console.log('done players');
    })
    .catch((err) => {
      console.error(err.message);
    });
}
function generateOverview(clubs: ClubView[]): ClubOverview {
  const overview: ClubOverview = { provinces: [] };

  clubs
    .filter((club) => club.id !== 0)
    .forEach((club) => addToProvince(club, overview));
  console.log(overview);
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
