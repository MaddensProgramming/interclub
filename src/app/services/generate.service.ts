import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  Firestore,
  getFirestore,
  collection,
  setDoc,
  doc,
} from 'firebase/firestore';
import clubs from 'src/assets/2021.json';
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
    this.getDataFromJson();
  }

  private getDataFromJson(): void {
    this.clubs = clubs;
    this.clubs = this.clubs.filter((club) => club.id !== 0);
    this.clubs.sort((club, club2) => club.id - club2.id);

    this.players = this.clubs.reduce(
      (acc: Player[], val: ClubView) => acc.concat(val.players),
      []
    );
  }

  sendData(): void {
    this.generatePlayerOverview('2021');
  }

  private writeEverything(year: string): void {
    this.setYear(year);
    this.generatePlayerOverview(year);
    this.generatePlayerDocs(year);
    this.generateClubDocs(year);
    this.generateTeams(year);
    this.setOverview(year);
  }

  private setYear(year: string): void {
    let yearobj: Year = { id: year, clubView: [] };

    const db = collection(this.store, 'years');

    setDoc(doc(db, year), yearobj)
      .then(() => console.log('done'))
      .catch((err) => console.error(err.message));
  }

  private generatePlayerOverview(year: string): void {
    this.players = this.players.map((player) => {
      player.games = [];
      return player;
    });
    this.players.sort((a, b) => b.tpr - a.tpr);

    setDoc(doc(this.store, 'years', year, 'playerOverview', 'tpr'), {
      players: this.players,
    })
      .then(() => {
        console.log('done');
      })
      .catch((err) => {
        console.error(err.message);
      });
  }

  private generatePlayerDocs(year: string): void {
    let failed: Player[] = [];

    console.log(this.players.length);

    let count: number = 0;

    this.players.forEach((player) => {
      setDoc(
        doc(this.store, 'years', year, 'players', player.id.toString()),
        player
      )
        .then(() => {
          console.log(count++);
        })
        .catch((err) => {
          console.error(err.message);
        });
    });
  }

  private generateTeams(year: string): void {
    this.clubs.forEach((club) =>
      club.teams.forEach((team) =>
        setDoc(
          doc(
            this.store,
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
      )
    );
  }

  private generateClubDocs(year: string): void {
    this.clubs = this.clubs.map((club) => {
      return {
        id: club.id,
        name: club.name,
        numberOfTeams: club.teams.length,
        players: club.players.map((player) => {
          player.games = [];
          return player;
        }),
        teams: club.teams
          .map((team) => {
            team.players = [];
            team.rounds = [];
            return team;
          })
          .sort((a, b) => a.id - b.id),
      };
    });

    this.clubs.forEach((club) =>
      setDoc(doc(this.store, 'years', year, 'club', club.id.toString()), club)
        .then(() => console.log(club.name))
        .catch((err) => console.error(err.message, club.name))
    );
  }

  private setOverview(year: string): void {
    const db = collection(this.store, 'years', year, 'clubOverview');

    setDoc(doc(db, 'overview'), this.generateOverview())
      .then(() => console.log('succes'))
      .catch((err) => console.error(err.message));
  }

  private generateOverview(): ClubOverview {
    const overview: ClubOverview = { provinces: [] };

    this.clubs.forEach((club) => this.addToProvince(club, overview));
    return overview;
  }

  private addToProvince(club: ClubView, overview: ClubOverview): void {
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
