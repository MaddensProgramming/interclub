import { Component, Input, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Round, TeamView } from 'src/app/models/club';
import { Dates } from 'src/app/models/dates';
import { DataBaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-round-view',
  templateUrl: './round-view.component.html',
  styleUrls: ['./round-view.component.scss'],
})
export class RoundViewComponent implements OnInit {
  @Input() round: Round;
  @Input() team: TeamView;

  date$: Observable<Date>;

  displayedColumnsRound: string[] = ['board', 'white', 'black', 'result'];
  constructor(private database: DataBaseService) {}

  ngOnInit(): void {
   this.date$ =  this.database.getDates().pipe(map(dates=> dates.dates[this.round.id-1].toDate() ));
     }

  sameTeam(teamA: TeamView, teamB: TeamView):boolean{
    return teamA.clubId===teamB.clubId && teamA.id ===teamB.id;
  }
}
