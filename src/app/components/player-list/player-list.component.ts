import { DataSource } from '@angular/cdk/collections';
import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatSort, MatSortable } from '@angular/material/sort';
import {
  MatTable,
  MatTableDataSource,
  _MatTableDataSource,
} from '@angular/material/table';
import { Player } from '../../models/player';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent implements OnInit, AfterViewInit {
  @Input() public players: Player[];
  @Input() public showTpr: boolean;
  @Input() public showId: boolean;
  @Input() public totaal: Player;

  dataSource: MatTableDataSource<Player> = new MatTableDataSource();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<MatTableDataSource<Player>>;

  displayedColumnsPlayer: string[] = [
    'name',
    'rating',
    'score',
    'numberOfGames',
  ];

  public updateTable(players: Player[]): void {
    this.dataSource = new MatTableDataSource(players);
    this.dataSource.sort = this.sort;
    this.table.renderRows();
  }

  constructor() {}
  ngAfterViewInit(): void {
    this.dataSource = new MatTableDataSource(this.players);
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    if (this.showTpr) this.displayedColumnsPlayer.push('tpr');
    if (this.showId) this.displayedColumnsPlayer.unshift('id');
  }
}
