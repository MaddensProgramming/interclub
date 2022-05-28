import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  Firestore,
  getFirestore,
  collection,
  setDoc,
  doc,
} from 'firebase/firestore';
import clubs from 'src/assets/2020.json';
import { environment } from 'src/environments/environment';
import { ClubView, ClubOverview, ProvinceOverview, Year } from '../models/club';
import { Player } from '../models/player';

@Injectable({
  providedIn: 'root',
})
export class GenerateService {
  public store: Firestore;
  private players: Player[];
  private clubs: ClubView[];

  constructor() {
    initializeApp(environment.firebase);
    this.store = getFirestore();
    //this.getDataFromJson();
  }

  sendData(): void {}

  // private setYears(): void {
  //   let year: Year = { id: '2020', clubView: [] };

  //   const db = collection(this.store, 'years');

  //   setDoc(doc(db, '2020'), year)
  //     .then(() => console.log('done'))
  //     .catch((err) => console.error(err.message));
  // }

  // private generatePlayerDocs(): void {
  //   let failed: Player[] = [];

  //   console.log(this.players.length);

  //   let count: number = 0;

  //   this.players.forEach((player) => {
  //     setDoc(
  //       doc(this.store, 'years', '2020', 'players', player.id.toString()),
  //       player
  //     )
  //       .then(() => {
  //         console.log(count++);
  //       })
  //       .catch((err) => {
  //         console.error(err.message);
  //         failed.push(player);
  //       });
  //   });

  //   while (failed.length > 0) {
  //     let newFailed: Player[] = [];
  //     failed.forEach((player) => {
  //       setDoc(
  //         doc(this.store, 'years', '2020', 'players', player.id.toString()),
  //         player
  //       )
  //         .then(() => {
  //           console.log(count++);
  //         })
  //         .catch((err) => {
  //           console.error(err.message);
  //           newFailed.push(player);
  //         });
  //     });
  //     failed = newFailed;
  //   }
  // }

  // private generateTeams(): void {
  //   this.clubs.forEach((club) =>
  //     club.teams.forEach((team) =>
  //       setDoc(
  //         doc(
  //           this.store,
  //           'years',
  //           '2021',
  //           'club',
  //           club.id.toString(),
  //           'team',
  //           team.id.toString()
  //         ),
  //         team
  //       )
  //         .then(() => console.log(club.name, team.id))
  //         .catch((err) => console.log(err, club.name, team.id))
  //     )
  //   );
  // }

  // private getDataFromJson(): void {
  //   this.clubs = clubs;
  //   this.clubs = this.clubs.filter((club) => club.id !== 0);
  //   this.clubs.sort((club, club2) => club.id - club2.id);

  //   this.players = this.clubs.reduce(
  //     (acc: Player[], val: ClubView) => acc.concat(val.players),
  //     []
  //   );
  // }

  // private generateClubDocs(): void {
  //   this.clubs = this.clubs.map((club) => {
  //     return {
  //       id: club.id,
  //       name: club.name,
  //       numberOfTeams: club.teams.length,
  //       players: club.players.map((player) => {
  //         player.games = [];
  //         return player;
  //       }),
  //       teams: club.teams
  //         .map((team) => {
  //           team.players = [];
  //           team.rounds = [];
  //           return team;
  //         })
  //         .sort((a, b) => a.id - b.id),
  //     };
  //   });

  //   this.clubs.forEach((club) =>
  //     setDoc(doc(this.store, 'years', '2020', 'club', club.id.toString()), club)
  //       .then(() => console.log(club.name))
  //       .catch((err) => console.error(err.message, club.name))
  //   );
  // }

  // private setOverview(): void {
  //   const db = collection(this.store, 'years', '2020', 'clubOverview');

  //   setDoc(doc(db, 'overview'), this.generateOverview())
  //     .then(() => console.log('succes'))
  //     .catch((err) => console.error(err.message));
  // }

  // private generateOverview(): ClubOverview {
  //   const overview: ClubOverview = { provinces: [] };

  //   this.clubs.forEach((club) => this.addToProvince(club, overview));
  //   return overview;
  // }

  // private addToProvince(club: ClubView, overview: ClubOverview): void {
  //   const provinceId = Math.floor(club.id / 100);
  //   const province: ProvinceOverview = overview.provinces.find(
  //     (prov) => prov.id === provinceId
  //   );
  //   if (!province)
  //     overview.provinces.push({
  //       id: provinceId,
  //       clubs: [{ id: club.id, name: club.name }],
  //     });
  //   else province.clubs.push({ id: club.id, name: club.name });
  // }
}
