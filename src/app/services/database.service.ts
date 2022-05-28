import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { doc, Firestore, getDoc, getFirestore } from 'firebase/firestore';
import { from, map, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ClubOverview, ClubView } from '../models/club';
import { Player } from '../models/player';
import clubs from '../../assets/2021.json';

@Injectable({
  providedIn: 'root',
})
export class DataBaseService {
  public store: Firestore;

  private cachePlayer: { [key: number]: Player } = {};
  private cacheClub: { [key: number]: ClubView } = {};
  private cacheClubOverview: { [key: number]: ClubOverview } = {};

  private clubs: ClubView[];
  private players: Player[];

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

  getClub(id: number): Observable<ClubView> {
    console.log(this.clubs.find((club) => club.id === id));
    return of(this.clubs.find((club) => club.id === id));

    if (this.cacheClub[id]) return of(this.cacheClub[id]);
    return from(getDoc(doc(this.store, 'clubs', id.toString()))).pipe(
      map((data) => data.data() as ClubView),
      tap((club) => (this.cacheClub[id] = club))
    );
  }

  getPlayer(id: number): Observable<Player> {
    if (this.cachePlayer[id]) return of(this.cachePlayer[id]);
    return from(getDoc(doc(this.store, 'players', id.toString()))).pipe(
      map((data) => data.data() as Player),
      tap((player) => (this.cachePlayer[id] = player))
    );
  }

  public getOverview(): Observable<ClubOverview> {
    if (this.cacheClubOverview[1]) return of(this.cacheClubOverview[1]);
    return from(getDoc(doc(this.store, 'clubOverview', 'overview'))).pipe(
      map((data) => data.data() as ClubOverview),
      tap((clubOverview) => (this.cacheClubOverview[1] = clubOverview))
    );
  }
}
