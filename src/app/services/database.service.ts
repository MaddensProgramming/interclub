import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { collection, doc, Firestore, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import {
  BehaviorSubject,
  from,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { environment } from 'src/environments/environment';
import { ClubOverview, ClubView, TeamView, Year } from '../models/club';
import { Player } from '../models/player';
import clubs2020 from '../../assets/2020.json';
import clubs2021 from '../../assets/2021.json';
import { Message } from '../models/message';

@Injectable({
  providedIn: 'root',
})
export class DataBaseService {
  public store: Firestore;
  public year: string;
  public year$: BehaviorSubject<string> = new BehaviorSubject<string>('2021');

  public yearDb: Year[] = [];

  private cachePlayer: { [key: number]: Player } = {};
  private cacheClub: { [key: number]: ClubView } = {};
  private cacheClubOverview: { [key: string]: ClubOverview } = {};
  private cacheTeam: { [key: number]: TeamView } = {};

  private clubs: ClubView[];
  private players: Player[];

  constructor() {
    initializeApp(environment.firebase);
    this.store = getFirestore();
  }

  public changeYear(year: string): void {
    this.year = year;
    this.year$.next(year);
  }

  getClub(id: number): Observable<ClubView> {
    return this.year$.pipe(
      switchMap((year) => {
        const saveId = (Number.parseInt(year) % 100) * 1000 + id;
        if (this.cacheClub[saveId]) return of(this.cacheClub[saveId]);
        return from(
          getDoc(doc(this.store, 'years', year, 'club', id.toString()))
        ).pipe(
          map((data) => data.data() as ClubView),
          tap((club) => (this.cacheClub[saveId] = club))
        );
      })
    );
  }

  getTeam(id: number, clubId: number): Observable<TeamView> {
    return this.year$.pipe(
      switchMap((year) => {
        const saveId =
          (Number.parseInt(this.year) % 100) * 100000 + clubId * 100 + id;
        if (this.cacheTeam[saveId]) return of(this.cacheTeam[saveId]);
        return from(
          getDoc(
            doc(
              this.store,
              'years',
              this.year,
              'club',
              clubId.toString(),
              'team',
              id.toString()
            )
          )
        ).pipe(
          map((data) => data.data() as TeamView),
          tap((team) => (this.cacheTeam[saveId] = team))
        );
      })
    );
  }

  getPlayer(id: number): Observable<Player> {
    return this.year$.pipe(
      switchMap((year) => {
        const saveId = id * 100 + (Number.parseInt(this.year) % 100);
        if (this.cachePlayer[saveId]) return of(this.cachePlayer[saveId]);
        return from(
          getDoc(doc(this.store, 'years', year, 'players', id.toString()))
        ).pipe(
          map((data) => data.data() as Player),
          tap((player) => (this.cachePlayer[saveId] = player))
        );
      })
    );
  }

  public getOverview(): Observable<ClubOverview> {
    return this.year$.pipe(
      switchMap((year) => {
        if (this.cacheClubOverview[this.year])
          return of(this.cacheClubOverview[this.year]);
        return from(
          getDoc(
            doc(this.store, 'years', this.year, 'clubOverview', 'overview')
          )
        ).pipe(
          map((data) => data.data() as ClubOverview),
          tap(
            (clubOverview) => (this.cacheClubOverview[this.year] = clubOverview)
          )
        );
      })
    );
  }

  public getPlayerOverview(): Observable<Player[]> {
    return this.year$.pipe(
      switchMap((year) => {
        return from(
          getDoc(doc(this.store, 'years', year, 'playerOverview', 'tpr'))
        );
      }),
      map((data: any) => data.data().players as Player[])
    );
  }

  public sendMessage(message: Message): Promise<void> {

  return setDoc(doc(collection(this.store, 'messages')),message);


  }



}
