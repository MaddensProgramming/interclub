import { Component, Input, OnInit } from '@angular/core';
import { Round, TeamView } from 'src/app/models/club';
import { Player } from 'src/app/models/player';

@Component({
  selector: 'app-teamresults',
  templateUrl: './teamresults.component.html',
  styleUrls: ['./teamresults.component.scss']
})
export class TeamresultsComponent implements OnInit {
  @Input()
  public team: TeamView

  displayedColumnsRound: string[] = [
    'id',
    'ratingOwn',
    'teamOpponent',
    'ratingOpponent',
    'scoreHome',
  ];



  averageRatingOwn(round:Round):number{
    return Math.round(round.games.reduce((totRating,round)=> {
      if(this.sameTeam(this.team,round.teamWhite))totRating+=round.white.rating;
      if(this.sameTeam(this.team,round.teamBlack))totRating+=round.black.rating;
      return totRating },0)/round.games.length);
  }

  averageRatingOpponent(round:Round):number{
    return Math.round(round.games.reduce((totRating,round)=> {
      if(this.sameTeam(this.team,round.teamWhite))totRating+=round.black.rating;
      if(this.sameTeam(this.team,round.teamBlack))totRating+=round.white.rating;
      return totRating },0)/round.games.length);
  }

  score(round:Round):number{
    if(this.sameTeam(this.team,round.teamHome))
    return round.scoreHome;
    return round.scoreAway;
  }

  locatie(round:Round):string{
    if(this.sameTeam(this.team,round.teamHome))
    return "Thuis";
    return "Uit";
  }

  sameTeam(teamA: TeamView, teamB: TeamView):boolean{
    return teamA.clubId===teamB.clubId && teamA.id ===teamB.id;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
