import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { map, Observable } from 'rxjs';
import { Round } from 'functions/src/models/Round';
import { TeamView } from 'functions/src/models/TeamView';
import { DataBaseService } from 'src/app/services/database.service';
import { RouterLink } from '@angular/router';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow,
} from '@angular/material/table';
import { NgClass, AsyncPipe } from '@angular/common';
import { ResultPipe } from '../../../../pipes/result.pipe';

@Component({
  selector: 'app-round-view',
  templateUrl: './round-view.component.html',
  styleUrls: ['./round-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    RouterLink,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    NgClass,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    AsyncPipe,
    ResultPipe,
  ],
})
export class RoundViewComponent implements OnInit {
  @Input() round: Round;
  @Input() team: TeamView;

  date$: Observable<Date>;

  displayedColumnsRound: string[] = [
    'board',
    'colorHome',
    'home',
    'result',
    'colorAway',
    'away',
  ];
  constructor(private database: DataBaseService) {}

  ngOnInit(): void {
    this.date$ = this.database
      .getDates()
      .pipe(map((dates) => dates.dates[this.round.id - 1].toDate()));
  }

  sameTeam(teamA: TeamView, teamB: TeamView): boolean {
    return teamA.clubId === teamB.clubId && teamA.id === teamB.id;
  }
}
