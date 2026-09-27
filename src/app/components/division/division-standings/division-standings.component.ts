import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { map, Observable, startWith, switchMap } from 'rxjs';
import { Division } from 'functions/src/models/Division';
import { TeamView } from 'functions/src/models/TeamView';
import { Round } from 'functions/src/models/Round';

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

  matches(team: TeamView, opponent: TeamView): Round[] {
    if (this.sameTeam(team, opponent)) return [];
    return team.rounds.filter((round) =>
      this.sameTeam(round.teamHome, opponent) || this.sameTeam(round.teamAway, opponent)
    );
  }

  score(round: Round, team: TeamView): number | string {
    if (round.played === false) return '-';
    return this.sameTeam(round.teamHome, team) ? round.scoreHome : round.scoreAway;
  }

  roundTab(team: TeamView, round: Round): number {
    return team.rounds.findIndex((item) => item.id === round.id) + 1;
  }

  sameTeam(teamA: TeamView, teamB: TeamView): boolean {
    return teamA.clubId === teamB.clubId && teamA.id === teamB.id;
  }

  colorResult(round: Round, team: TeamView): string {
    if (round.played === false || (!round.scoreHome && !round.scoreAway)) return '';
    const own = this.score(round, team) as number;
    const other = this.sameTeam(round.teamHome, team) ? round.scoreAway : round.scoreHome;
    return own === other ? 'yellow' : own > other ? 'green' : 'red';
  }
}
