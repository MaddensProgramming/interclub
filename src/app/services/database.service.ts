import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  collection,
  doc,
  Firestore,
  getDoc,
  getFirestore,
  setDoc,
} from 'firebase/firestore';
import {
  BehaviorSubject,
  filter,
  from,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Dates } from '../models/dates';
import { RoundOverview } from 'functions/src/models/RoundOverview';
import { ClubOverview } from 'functions/src/models/ClubOverview';
import { ClubView } from 'functions/src/models/ClubView';
import { ClassOverview } from 'functions/src/models/ClassOverview';
import { PlayerOverview } from 'functions/src/models/PlayerOverview';
import { Player } from 'functions/src/models/Player';
import { Division } from 'functions/src/models/Division';
import { TeamView } from 'functions/src/models/TeamView';
import { Year } from '../models/year';

@Injectable({
  providedIn: 'root',
})
export class DataBaseService {
  public store: Firestore;
  public year: string = '2024';
  public year$: BehaviorSubject<string> = new BehaviorSubject<string>('2024');

  public yearDb: Year[] = [];

  private cachePlayer: { [key: number]: Player } = {};
  private cacheClub: { [key: number]: ClubView } = {};
  private cacheClubOverview: { [key: string]: ClubOverview } = {};
  private cacheTeam: { [key: number]: TeamView } = {};
  private cacheDivision: { [key: string]: Division } = {};
  private cacheClassOverview: { [key: string]: ClassOverview } = {};
  private cachePlayerOverview: { [key: string]: Player[] } = {};
  private cacheSimplePlayerOverview: { [key: string]: PlayerOverview } = {};
  private cacheDates: { [key: string]: Dates } = {};

  constructor(private router: Router) {
    initializeApp(environment.firebase);
    this.store = getFirestore();
  }

  getDivision(division: string): Observable<Division> {
    return this.year$.pipe(
      switchMap((year) => {
        if (this.cacheDivision[year + division])
          return of(this.cacheDivision[year + division]);
        return from(
          getDoc(doc(this.store, 'years', year, 'divisions', division))
        ).pipe(
          map((data) => data.data() as Division),
          tap((div) => (this.cacheDivision[year + division] = div))
        );
      })
    );
  }

  public getFullRoundOverview(round: string): Observable<RoundOverview> {
    return from(
      getDoc(doc(this.store, 'years', '2024', 'roundOverview', round))
    ).pipe(map((data) => data.data() as RoundOverview));
  }

  public getLastUpdate(): Observable<Date> {
    return from(getDoc(doc(this.store, 'years', '2024'))).pipe(
      map((data) => data.data()['lastUpdate'].toDate() as Date)
    );
  }

  public getClassOverview(): Observable<ClassOverview> {
    return this.year$.pipe(
      switchMap((year) => {
        if (this.cacheClassOverview[year])
          return of(this.cacheClassOverview[year]);
        return from(
          getDoc(doc(this.store, 'years', this.year, 'overviews', 'divisions'))
        ).pipe(
          map((data) => data.data() as ClassOverview),
          tap(
            (classoverview) =>
              (this.cacheClassOverview[this.year] = classoverview)
          ),
          filter((data) => {
            if (!data) this.router.navigate(['404']);
            return !!data;
          })
        );
      })
    );
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
      }),
      filter((data) => {
        if (!data) this.router.navigate(['404']);
        return !!data;
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
      }),
      filter((data) => {
        if (!data) this.router.navigate(['404']);
        return !!data;
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
      }),
      filter((data) => {
        if (!data) this.router.navigate(['404']);
        return !!data;
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
          ),
          filter((data) => {
            if (!data) this.router.navigate(['404']);
            return !!data;
          })
        );
      })
    );
  }

  public getPlayerOverview(): Observable<Player[]> {
    return this.year$.pipe(
      switchMap((year) => {
        if (this.cachePlayerOverview[this.year])
          return of(this.cachePlayerOverview[this.year]);
        return from(
          getDoc(doc(this.store, 'years', year, 'overviews', 'players'))
        ).pipe(map((data: any) => data.data().players as Player[]));
      }),
      filter((data) => {
        if (!data) this.router.navigate(['404']);
        return !!data;
      }),
      tap((players) => (this.cachePlayerOverview[this.year] = players))
    );
  }

  public getSimplePlayerOverview(): Observable<PlayerOverview> {
    return this.year$.pipe(
      switchMap((year) => {
        if (this.cacheSimplePlayerOverview[this.year])
          return of(this.cacheSimplePlayerOverview[this.year]);
        return from(
          getDoc(doc(this.store, 'years', year, 'overviews', 'simplelayers'))
        ).pipe(map((data: any) => data.data() as PlayerOverview));
      }),
      filter((data) => {
        if (!data) this.router.navigate(['404']);
        return !!data;
      }),
      tap((players) => (this.cacheSimplePlayerOverview[this.year] = players))
    );
  }

  public getDates(): Observable<Dates> {
    return this.year$.pipe(
      switchMap((year) => {
        if (this.cacheDates[this.year]) return of(this.cacheDates[this.year]);
        return from(
          getDoc(doc(this.store, 'years', year, 'dates', 'dates'))
        ).pipe(map((data: any) => data.data() as Dates));
      }),
      filter((data) => {
        return !!data;
      }),
      tap((dates) => (this.cacheDates[this.year] = dates))
    );
  }
}
