import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { map, Observable, startWith, switchMap } from 'rxjs';
import { TeamView } from 'src/app/models/club';
import { Division, DivisionForm } from 'src/app/models/division';
import { DataBaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-division-standings',
  templateUrl: './division-standings.component.html',
  styleUrls: ['./division-standings.component.scss'],
})
export class DivisionStandingsComponent implements OnInit {
  @Input()
  form: FormGroup;

  division$: Observable<Division>;

  constructor(private db: DataBaseService) {}

  ngOnInit(): void {
    this.division$ = this.form.valueChanges.pipe(
      startWith({ class: '1', division: 'A' }),
      switchMap((form) => this.db.getDivision(form.class + form.division)),
      map((overview) => {
        overview.teams.sort(
          (a, b) =>
            b.matchPoints * 100 +
            b.boardPoints -
            a.matchPoints * 100 +
            a.boardPoints
        );
        return overview;
      })
    );
  }

  findResult(teamHome: TeamView, teamAway: TeamView): number {
    if (this.sameTeam(teamAway, teamHome)) return null;
    const roundAway = teamHome.rounds.find((round) =>
      this.sameTeam(round.teamHome, teamAway)
    );
    if (roundAway) return roundAway.scoreAway;
    const roundHome = teamHome.rounds.find((round) =>
      this.sameTeam(round.teamAway, teamAway)
    );
    if (roundHome) return roundHome.scoreHome;
    return null;
  }

  sameTeam(teamA: TeamView, teamB: TeamView): boolean {
    return teamA.clubId === teamB.clubId && teamA.id === teamB.id;
  }

  colorResult(teamHome: TeamView, teamAway: TeamView): string {
    if (this.sameTeam(teamAway, teamHome)) return 'black';

    const pointsHome = this.findResult(teamHome, teamAway);
    const pointsAway = this.findResult(teamAway, teamHome);
    if (pointsAway === pointsHome) return 'yellow';
    return pointsHome < pointsAway ? 'green' : 'red';
  }
}
