import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { map, Observable, startWith, switchMap } from 'rxjs';
import { Division } from 'functions/src/models/Division';
import { TeamView } from 'functions/src/models/TeamView';

import { DataBaseService } from 'src/app/services/database.service';
import { RouterLink } from '@angular/router';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { DivisionForm } from '../division-overview/division-overview.component';

@Component({
  selector: 'app-division-standings',
  templateUrl: './division-standings.component.html',
  styleUrls: ['./division-standings.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, NgClass, MatProgressSpinner, AsyncPipe],
})
export class DivisionStandingsComponent implements OnInit {
  @Input({ required: true })
  form: DivisionForm;

  division$: Observable<Division>;

  constructor(private db: DataBaseService) {}

  ngOnInit(): void {
    this.division$ = this.form.valueChanges.pipe(
      startWith({
        class: this.form.controls.class.value,
        division: this.form.controls.division.value,
      }),
      switchMap((form) => this.db.getDivision(form.class + form.division)),
      map((overview) => {
        overview.teams.sort(
          (a, b) =>
            b.matchPoints * 100 +
            b.boardPoints -
            (a.matchPoints * 100 + a.boardPoints),
        );
        return overview;
      }),
    );
  }

  findResult(teamHome: TeamView, teamAway: TeamView): number {
    if (this.sameTeam(teamAway, teamHome)) return null;
    const roundAway = teamHome.rounds.find((round) =>
      this.sameTeam(round.teamHome, teamAway),
    );
    if (roundAway) return roundAway.scoreAway;
    const roundHome = teamHome.rounds.find((round) =>
      this.sameTeam(round.teamAway, teamAway),
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
    if (!pointsAway && !pointsHome) return '';
    if (pointsAway === pointsHome) return 'yellow';
    return pointsHome < pointsAway ? 'green' : 'red';
  }

  round(teamHome: TeamView, teamAway: TeamView): number {
    if (this.sameTeam(teamAway, teamHome)) return null;
    return (
      teamHome.rounds.findIndex(
        (round) =>
          this.sameTeam(round.teamAway, teamAway) ||
          this.sameTeam(round.teamHome, teamAway),
      ) + 1
    );
  }
}
