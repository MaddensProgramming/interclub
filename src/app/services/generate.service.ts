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
import {
  ClubView,
  ClubOverview,
  ProvinceOverview,
  Year,
  TeamView,
  Round,
} from '../models/club';
import { ClassOverview, Division } from '../models/division';
import { Player, PlayerOverview } from '../models/player';

@Injectable({
  providedIn: 'root',
})
export class GenerateService {
  public store: Firestore;
  private players: Player[];
  private clubs: ClubView[];
  private year: string = '2020';

  constructor() {
    initializeApp(environment.firebase);
    this.store = getFirestore();
    //this.getDataFromJson();
  }

  sendData(): void {}

  //   private getDataFromJson(): void {
  //     this.clubs = clubs;
  //     this.clubs = this.clubs.filter((club) => club.id !== 0);
  //     this.clubs.sort((club, club2) => club.id - club2.id);

  //     this.players = this.clubs.reduce(
  //       (acc: Player[], val: ClubView) => acc.concat(val.players),
  //       []
  //     );
  //   }
  //   private writeEverything(year: string): void {
  //     this.generateYear(year);
  //     this.generatePlayerOverview(year);
  //     this.generatePlayerDocs(year);
  //     this.generateClubDocs(year);
  //     this.generateTeams(year);
  //     this.generateClubOverview(year);
  //     this.generateDivisionOverview(year);
  //     this.generateDivisions(year);
  //     this.generateSimplePlayers(year);
  //   }
  //   generateSimplePlayers(year: string) {
  //     const playerOverview: PlayerOverview = {
  //       players: this.players.map((player) => {
  //         return { name: player.firstName + ' ' + player.name, id: player.id };
  //       }),
  //     };

  //     playerOverview.players.sort((a, b) => a.name.localeCompare(b.name));
  //     console.log(playerOverview);

  //     setDoc(
  //       doc(this.store, 'years', year, 'overviews', 'simplelayers'),
  //       playerOverview
  //     )
  //       .then(() => {
  //         console.log('done simplePlayers overview');
  //       })
  //       .catch((err) => {
  //         console.error(err.message);
  //       });
  //   }

  //   private generateDivisionOverview(year: string): void {
  //     const classesOverview: ClassOverview = { classes: [] };
  //     this.clubs.forEach((club) =>
  //       club.teams.forEach((team) =>
  //         this.tryAddDivision(classesOverview, team.class, team.division)
  //       )
  //     );
  //     classesOverview.classes.sort((a, b) => a.class - b.class);
  //     classesOverview.classes.forEach((klass) => klass.divisions.sort());

  //     setDoc(
  //       doc(this.store, 'years', year, 'overviews', 'divisions'),
  //       classesOverview
  //     )
  //       .then(() => {
  //         console.log('done division overview');
  //       })
  //       .catch((err) => {
  //         console.error(err.message);
  //       });
  //   }

  //   tryAddDivision(
  //     divisions: ClassOverview,
  //     klasse: number,
  //     division: string
  //   ): void {
  //     let toUpdate = divisions.classes.find((klass) => klass.class === klasse);
  //     if (!toUpdate) {
  //       toUpdate = { class: klasse, divisions: [] };
  //       divisions.classes.push(toUpdate);
  //     }
  //     if (!toUpdate.divisions.find((div) => div === division))
  //       toUpdate.divisions.push(division);
  //   }

  //   private generateDivisions(year: string): void {
  //     const divisions: Division[] = [];

  //     this.clubs.forEach((club) =>
  //       club.teams.forEach((team) => this.addTeamToDivision(team, divisions))
  //     );

  //     divisions.forEach((div) => {
  //       setDoc(
  //         doc(this.store, 'years', year, 'divisions', div.class + div.division),
  //         div
  //       )
  //         .then(() => {
  //           console.log(div.class + div.division);
  //         })
  //         .catch((err) => {
  //           console.error(err.message);
  //         });
  //     });
  //   }

  //   addTeamToDivision(team: TeamView, divisions: Division[]): void {
  //     let division: Division = divisions.find(
  //       (div) => div.class === team.class && div.division === team.division
  //     );
  //     if (!division) {
  //       division = { class: team.class, division: team.division, teams: [] };
  //       divisions.push(division);
  //     }

  //     const newTeam = { ...team };
  //     newTeam.boardPoints = newTeam.rounds.reduce(
  //       (bp, round) =>
  //         (bp += this.sameTeam(newTeam, round.teamHome)
  //           ? round.scoreHome
  //           : round.scoreAway),
  //       0
  //     );
  //     newTeam.matchPoints = newTeam.rounds.reduce(
  //       (mp, round) => (mp += this.findMatchpoints(newTeam, round)),
  //       0
  //     );
  //     newTeam.rounds.forEach((round) => {
  //       round.games = [];
  //     });
  //     division.teams.push(newTeam);
  //   }

  //   private findMatchpoints(team: TeamView, round: Round): number {
  //     if (round.scoreAway === round.scoreHome) return 1;
  //     if (round.scoreHome > round.scoreAway)
  //       return this.sameTeam(round.teamHome, team) ? 2 : 0;
  //     return this.sameTeam(round.teamAway, team) ? 2 : 0;
  //   }

  //   private sameTeam(teama: TeamView, teamb: TeamView): boolean {
  //     return teama.clubId === teamb.clubId && teama.id === teamb.id;
  //   }

  //   private generateYear(year: string): void {
  //     let yearobj: Year = { id: year, clubView: [] };

  //     const db = collection(this.store, 'years');

  //     setDoc(doc(db, year), yearobj)
  //       .then(() => console.log('done'))
  //       .catch((err) => console.error(err.message));
  //   }

  //   private generatePlayerOverview(year: string): void {
  //     this.players = this.players.map((player) => {
  //       player.games = [];
  //       return player;
  //     });
  //     this.players.sort((a, b) => b.tpr - a.tpr);

  //     setDoc(doc(this.store, 'years', year, 'overviews', 'players'), {
  //       players: this.players,
  //     })
  //       .then(() => {
  //         console.log('done players');
  //       })
  //       .catch((err) => {
  //         console.error(err.message);
  //       });
  //   }

  //   private generatePlayerDocs(year: string): void {
  //     let failed: Player[] = [];

  //     console.log(this.players.length);

  //     let count: number = 0;

  //     this.players.forEach((player) => {
  //       setDoc(
  //         doc(this.store, 'years', year, 'players', player.id.toString()),
  //         player
  //       )
  //         .then(() => {
  //           console.log(count++);
  //         })
  //         .catch((err) => {
  //           console.error(err.message);
  //         });
  //     });
  //   }

  //   private generateTeams(year: string): void {
  //     this.clubs.forEach((club) =>
  //       club.teams.forEach((team) =>
  //         setDoc(
  //           doc(
  //             this.store,
  //             'years',
  //             year,
  //             'club',
  //             club.id.toString(),
  //             'team',
  //             team.id.toString()
  //           ),
  //           team
  //         )
  //           .then(() => console.log(club.name, team.id))
  //           .catch((err) => console.log(err, club.name, team.id))
  //       )
  //     );
  //   }

  //   private generateClubDocs(year: string): void {
  //     this.clubs = this.clubs.map((club) => {
  //       return {
  //         id: club.id,
  //         name: club.name,
  //         players: club.players.map((player) => {
  //           player.games = [];
  //           return player;
  //         }),
  //         teams: club.teams
  //           .map((team) => {
  //             team.players = [];
  //             team.rounds = [];
  //             return team;
  //           })
  //           .sort((a, b) => a.id - b.id),
  //       };
  //     });

  //     this.clubs.forEach((club) =>
  //       setDoc(doc(this.store, 'years', year, 'club', club.id.toString()), club)
  //         .then(() => console.log(club.name))
  //         .catch((err) => console.error(err.message, club.name))
  //     );
  //   }

  //   private generateClubOverview(year: string): void {
  //     const db = collection(this.store, 'years', year, 'clubOverview');

  //     setDoc(doc(db, 'overview'), this.generateOverview())
  //       .then(() => console.log('succes'))
  //       .catch((err) => console.error(err.message));
  //   }

  //   private generateOverview(): ClubOverview {
  //     const overview: ClubOverview = { provinces: [] };

  //     this.clubs.forEach((club) => this.addToProvince(club, overview));
  //     return overview;
  //   }

  //   private addToProvince(club: ClubView, overview: ClubOverview): void {
  //     const provinceId = Math.floor(club.id / 100);
  //     const province: ProvinceOverview = overview.provinces.find(
  //       (prov) => prov.id === provinceId
  //     );
  //     if (!province)
  //       overview.provinces.push({
  //         id: provinceId,
  //         clubs: [{ id: club.id, name: club.name }],
  //       });
  //     else province.clubs.push({ id: club.id, name: club.name });
  //   }
}
