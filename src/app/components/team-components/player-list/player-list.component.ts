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
import { map, Observable, of, skip, tap } from 'rxjs';
import { Player } from '../../../models/player';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent implements OnInit, AfterViewInit {
  @Input() public players: Observable<Player[]>;
  @Input() public showTpr: boolean;
  @Input() public showId: boolean;
  @Input() public showTotal: boolean;

  totaal: Player;

  dataSource$: Observable<MatTableDataSource<Player>>;

  @ViewChild(MatSort) sort: MatSort;

  displayedColumnsPlayer: string[] = [
    'name',
    'rating',
    'score',
    'numberOfGames',
  ];

  public getSource(players: Player[]): MatTableDataSource<Player> {
    const dataSource = new MatTableDataSource(players);
    dataSource.sort = this.sort;
    return dataSource;
  }



  public calcTotal(players: Player[]):void{
    let totalRating = 0;
    let totalScore = 0;
    let totalGames = 0;
    players.forEach((player) => {
      totalGames += player.numberOfGames;
      totalScore += player.score;
      totalRating += player.rating * player.numberOfGames;
    });

    this.totaal = {
      name: 'Totaal',
      firstName: '',
      id: 0,
      rating: Math.round(totalRating / totalGames),
      numberOfGames: totalGames,
      score: totalScore,
      tpr: 0,
    };
  }

  constructor() {}
  ngAfterViewInit(): void {
    this.dataSource$ = this.players.pipe(
      tap(players => {if(this.showTotal)this.calcTotal(players)}),
      map((players) => this.getSource(players))
    );
  }

  ngOnInit(): void {
    this.dataSource$ = of(this.getSource([]));
    if (this.showTpr) this.displayedColumnsPlayer.push('tpr');
    if (this.showId) this.displayedColumnsPlayer.unshift('id');
  }
}
