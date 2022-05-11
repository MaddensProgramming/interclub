import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { doc, Firestore, getDoc, getFirestore } from 'firebase/firestore';
import { from, map, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Club, ClubOverview } from '../models/club';
import { Player } from '../models/player';

@Injectable({
  providedIn: 'root',
})
export class DataBaseService {
  public store: Firestore;

  private cachePlayer: { [key: number]: Player } = {};
  private cacheClub: { [key: number]: Club } = {};
  private cacheClubOverview: { [key: number]: ClubOverview } = {};

  constructor() {
    initializeApp(environment.firebase);
    this.store = getFirestore();
  }

  getClub(id: number): Observable<Club> {
    if (this.cacheClub[id]) return of(this.cacheClub[id]);
    return from(getDoc(doc(this.store, 'clubs', id.toString()))).pipe(
      map((data) => data.data() as Club),
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
