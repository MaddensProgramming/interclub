import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
  MatTableDataSource,
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
import {
  combineLatest,
  map,
  Observable,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { Player } from 'functions/src/models/Player';

import { DataBaseService } from 'src/app/services/database.service';
import { MatFormField, MatLabel, MatInput } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AsyncPipe } from '@angular/common';

type HallOfFameForm = FormGroup<{
  minGames: FormControl<string>;
}>;

@Component({
  selector: 'app-halloffame',
  templateUrl: './halloffame.component.html',
  styleUrls: ['./halloffame.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    RouterLink,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatProgressSpinner,
    MatPaginator,
    AsyncPipe,
  ],
})
export class HalloffameComponent implements OnInit, AfterViewInit {
  dataSource$: Observable<MatTableDataSource<Player>>;
  dataloaded = false;
  form: HallOfFameForm = new FormGroup({
    minGames: new FormControl('1', { nonNullable: true }),
  });
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<MatTableDataSource<Player>>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private db: DataBaseService) {}
  ngAfterViewInit(): void {
    const mingamesObs = this.form.controls.minGames.valueChanges.pipe(
      startWith('1'),
      map(Number),
    );
    const playerOverviewObs = this.db.year$.pipe(
      switchMap((year) => this.db.getPlayerOverview()),
      map((players) => this.addDiff(players)),
    );
    this.dataSource$ = combineLatest([mingamesObs, playerOverviewObs]).pipe(
      tap(() => (this.dataloaded = false)),
      map(([mingames, players]) => {
        return players.filter((player) => player.numberOfGames >= mingames);
      }),
      map((players) => this.generateDataSource(players)),
      tap(() => (this.dataloaded = true)),
    );
  }

  ngOnInit(): void {
    this.dataSource$ = of(this.generateDataSource([]));
  }

  displayedColumnsPlayer: string[] = [
    'name',
    'rating',
    'tpr',
    'diff',
    'score',
    'numberOfGames',
  ];

  addDiff(players: Player[]): Player[] {
    players.forEach((player) => (player.diff = player.tpr - player.rating));
    return players;
  }

  generateDataSource(players: Player[]): MatTableDataSource<Player> {
    const dataSource = new MatTableDataSource(players);
    dataSource.sort = this.sort;
    dataSource.paginator = this.paginator;
    return dataSource;
  }
}
