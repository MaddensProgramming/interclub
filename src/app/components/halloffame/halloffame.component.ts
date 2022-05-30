import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { combineLatest, map, switchMap } from 'rxjs';
import { Player } from 'src/app/models/player';
import { DataBaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-halloffame',
  templateUrl: './halloffame.component.html',
  styleUrls: ['./halloffame.component.scss'],
})
export class HalloffameComponent implements OnInit {
  players: Player[];
  dataloaded: boolean = false;
  dataSource: MatTableDataSource<Player> = new MatTableDataSource();
  form: FormGroup = new FormGroup({
    minGames: new FormControl(5)
  });
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<MatTableDataSource<Player>>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private db: DataBaseService) {}

  ngOnInit(): void {
    const mingamesObs =  this.form.get("minGames").valueChanges;
    const playerOverviewObs = this.db.year$.pipe(switchMap( year => this.db.getPlayerOverview()));

    combineLatest([mingamesObs,playerOverviewObs])
    .pipe( map( ([mingames ,players]) => { return players.filter((player) => player.numberOfGames >= mingames)}))
    .subscribe((data) => {
      this.players = data;
      this.updateTable(this.players);
    });

    this.form.get("minGames").setValue(7);

  }

  displayedColumnsPlayer: string[] = [
    'name',
    'rating',
    'tpr',
    'score',
    'numberOfGames',
  ];

  public updateTable(players: Player[]): void {
    this.dataSource = new MatTableDataSource(players);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.renderRows();
  }
}
