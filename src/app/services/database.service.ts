import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  doc,
  Firestore,
  getDoc,
  getFirestore,
  setDoc,
} from 'firebase/firestore';
import { from, map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Club, ClubOverview } from '../models/club';
import { Player } from '../models/player';

@Injectable({
  providedIn: 'root',
})
export class DataBaseService {
  public store: Firestore;

  constructor() {
    initializeApp(environment.firebase);
    this.store = getFirestore();
  }

  getClub(id: number): Observable<Club> {
    return from(getDoc(doc(this.store, 'clubs', id.toString()))).pipe(
      map((data) => data.data() as Club)
    );
  }

  getPlayer(id: number): Observable<Player> {
    return from(getDoc(doc(this.store, 'players', id.toString()))).pipe(
      map((data) => data.data() as Player)
    );
  }

  public getOverview(): Observable<ClubOverview> {
    return from(getDoc(doc(this.store, 'clubOverview', 'overview'))).pipe(
      map((data) => data.data() as ClubOverview)
    );
  }
}
