import { Component, Input, OnInit } from '@angular/core';
import { Round, TeamView } from 'src/app/models/club';
import { Player } from 'src/app/models/player';

@Component({
  selector: 'app-teamresults',
  templateUrl: './teamresults.component.html',
  styleUrls: ['./teamresults.component.scss'],
})
export class TeamresultsComponent implements OnInit {
  @Input()
  public team: TeamView;

  displayedColumnsRound: string[] = [
    'id',
    'loc',
    'ratingOwn',
    'teamOpponent',
    'ratingOpponent',
    'scoreHome',
  ];

  displayedColumnsTotal: string[] = [
    'id',
    'ratingOwn',
    'teamOpponent',
    'ratingOpponent',
    'scoreHome',
  ];

  numberOfMatches(): number {
   return this.team.rounds.filter(round => round.games.length!==0).length;
  }

  getRowPosition(id: number, team: TeamView): number {
    return team.rounds.findIndex((round) => round.id === id);
  }

  score(round: Round): number {
    if (this.sameTeam(this.team, round.teamHome)) return round.scoreHome;
    return round.scoreAway;
  }

  locatie(round: Round): string {
    if (this.sameTeam(this.team, round.teamHome)) return 'home';
    return 'directions_car';
  }

  sameTeam(teamA: TeamView, teamB: TeamView): boolean {
    if(!teamA||!teamB)return false;
    return teamA.clubId === teamB.clubId && teamA.id === teamB.id;
  }

  ratingOwn(round: Round) {
    if (this.sameTeam(this.team, round.teamHome))
      return round.averageRatingHome;
    return round.averageRatingAway;
  }

  ratingOpponent(round: Round) {
    if (this.sameTeam(this.team, round.teamHome))
      return round.averageRatingAway;
    return round.averageRatingHome;
  }

  opponent(round: Round): TeamView {
    if(round.teamAway===null||round.teamHome === null) return {clubId:0,clubName:'Bye',id:0,class:1,division:'A'}
    if (this.sameTeam(this.team, round.teamHome)) return round.teamAway;
    return round.teamHome;
  }

  averageRatingOwn() {
    return Math.round(
      this.team.rounds.filter(round => round.games.length!==0).reduce(
        (total, round) => (total += this.ratingOwn(round)),
        0
      ) /  this.numberOfMatches()
    );
  }

  averageRatingOppenent() {
    return Math.round(
      this.team.rounds.filter(round => round.games.length!==0).reduce(
        (total, round) => (total += this.ratingOpponent(round)),
        0
      ) / this.numberOfMatches()
    );
  }

  matchPoints() {
    return this.team.rounds.reduce(
      (total, round) => (total += this.checkResult(round)),
      0
    );
  }

  checkResult(round: Round): number {
    if(round.scoreAway===0&&round.scoreHome===0) return 0;
    if (round.scoreAway === round.scoreHome) return 0.5;
    if (round.scoreAway > round.scoreHome) {
      return this.sameTeam(this.team, round.teamAway) ? 1 : 0;
    }
    return this.sameTeam(this.team, round.teamHome) ? 1 : 0;
  }

  constructor() {}

  ngOnInit(): void {}
}
