import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { map } from 'rxjs';
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
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<MatTableDataSource<Player>>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private db: DataBaseService) {}

  ngOnInit(): void {
    this.db
      .getPlayerOverview()
      .pipe(
        map((data: Player[]) =>
          data.filter((player) => player.numberOfGames > 2)
        )
      )
      .subscribe((data) => {
        this.players = data;
        this.updateTable(this.players);
      });
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
