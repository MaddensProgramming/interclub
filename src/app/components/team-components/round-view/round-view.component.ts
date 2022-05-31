import { Component, Input, OnInit } from '@angular/core';
import { Round, TeamView } from 'src/app/models/club';

@Component({
  selector: 'app-round-view',
  templateUrl: './round-view.component.html',
  styleUrls: ['./round-view.component.scss'],
})
export class RoundViewComponent implements OnInit {
  @Input() round: Round;
  @Input() team: TeamView;

  averageEloHome: number;
  averageEloAway: number;

  displayedColumnsRound: string[] = ['board', 'white', 'black', 'result'];
  constructor() {}

  ngOnInit(): void {
     }

  sameTeam(teamA: TeamView, teamB: TeamView):boolean{
    return teamA.clubId===teamB.clubId && teamA.id ===teamB.id;
  }
}
