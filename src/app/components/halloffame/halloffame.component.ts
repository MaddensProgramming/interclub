import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { combineLatest, map, Observable, of, switchMap, tap } from 'rxjs';
import { Player } from 'src/app/models/player';
import { DataBaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-halloffame',
  templateUrl: './halloffame.component.html',
  styleUrls: ['./halloffame.component.scss'],
})
export class HalloffameComponent implements OnInit, AfterViewInit {
  dataSource$: Observable<MatTableDataSource<Player>>;
  dataloaded= false;
  form: FormGroup = new FormGroup({
    minGames: new FormControl(5)
  });
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<MatTableDataSource<Player>>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private db: DataBaseService) { }
  ngAfterViewInit(): void {
    const mingamesObs = this.form.get("minGames").valueChanges;
    const playerOverviewObs = this.db.year$.pipe(switchMap(year => this.db.getPlayerOverview()),
    map(players => this.addDiff(players)),
    tap(()=>this.form.get("minGames").setValue(this.form.get("minGames").value)));
    this.dataSource$ = combineLatest([mingamesObs, playerOverviewObs])
      .pipe(
        tap(()=>this.dataloaded=false),
        map(([mingames, players]) => { return players.filter((player) => player.numberOfGames >= mingames) }),
        map(players => this.generateDataSource(players)),
        tap(()=>this.dataloaded=true))
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

  addDiff(players:Player[]): Player[]{
   players.forEach(player=> player.diff = player.tpr- player.rating);
   return players;
  }


  generateDataSource(players: Player[]): MatTableDataSource<Player>{
    const dataSource = new MatTableDataSource(players);
          dataSource.sort = this.sort;
          dataSource.paginator = this.paginator;
          return dataSource;
  }

}
