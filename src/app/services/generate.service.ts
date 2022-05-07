import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  Firestore,
  getFirestore,
  collection,
  setDoc,
  doc,
} from 'firebase/firestore';
import clubs from 'src/assets/games.json';
import { environment } from 'src/environments/environment';
import { Club, ClubOverview, ProvinceOverview } from '../models/club';
import { Player } from '../models/player';

@Injectable({
  providedIn: 'root',
})
export class GenerateService {
  public store: Firestore;
  private players: Player[];
  private clubs: Club[];

  constructor() {
    initializeApp(environment.firebase);
    this.store = getFirestore();
    this.getDataFromJson();
  }

  sendData(): void {
    this.generatePlayerDocs();
  }

  private generatePlayerDocs(): void {
    const db = collection(this.store, 'players');
    let count: number = 0;
    this.players = this.players.slice(2000, this.players.length - 1);
    this.players.forEach((player) => {
      setDoc(doc(db, player.id.toString()), player)
        .then(() => {
          count++;
          if (count % 50 === 0) console.log(count);
        })
        .catch((err) => console.error(err.message));
    });
  }

  private getDataFromJson(): void {
    this.clubs = clubs;
    this.clubs = this.clubs.filter((club) => club.id !== 0);
    this.clubs.sort((club, club2) => club.id - club2.id);

    this.players = this.clubs.reduce(
      (acc: Player[], val: Club) => acc.concat(val.players),
      []
    );
  }

  private generateClubDocs(): void {
    const db = collection(this.store, 'clubs');

    this.clubs.forEach((club) =>
      setDoc(doc(db, club.id.toString()), club)
        .then(() => console.log(club.name))
        .catch((err) => console.error(err.message))
    );
  }

  private setOverview(): void {
    const db = collection(this.store, 'clubOverview');

    setDoc(doc(db, 'overview'), this.generateOverview())
      .then(() => console.log('succes'))
      .catch((err) => console.error(err.message));
  }

  private generateOverview(): ClubOverview {
    const overview: ClubOverview = { provinces: [] };

    this.clubs.forEach((club) => this.addToProvince(club, overview));
    return overview;
  }

  private addToProvince(club: Club, overview: ClubOverview): void {
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
}
