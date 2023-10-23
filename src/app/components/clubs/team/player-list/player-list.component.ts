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
import { Player } from 'shared/models/Player';

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
    'score',
    'numberOfGames',
    'rating',
    'ratingFide',
    'ratingNat',
  ];

  public getSource(players: Player[]): MatTableDataSource<Player> {
    const dataSource = new MatTableDataSource(players);
    dataSource.sort = this.sort;
    return dataSource;
  }

  public calcTotal(players: Player[]): void {
    let totalRating = 0;
    let totalScore = 0;
    let totalGames = 0;
    let totalFideRating = 0;
    let totalNatRating = 0;
    players.forEach((player) => {
      totalGames += player.numberOfGames;
      totalScore += player.score;
      totalRating += player.rating * player.numberOfGames;
      totalFideRating += (player.ratingFide ?? 0) * player.numberOfGames;
      totalNatRating += (player.ratingNat ?? 0) * player.numberOfGames;
    });

    this.totaal = {
      name: 'Totaal',
      firstName: '',
      id: 0,
      rating: Math.round(totalRating / totalGames),
      ratingFide: Math.round(totalFideRating / totalGames),
      ratingNat: Math.round(totalNatRating / totalGames),
      numberOfGames: totalGames,
      score: totalScore,
      tpr: 0,
    };
  }

  constructor() {}
  ngAfterViewInit(): void {
    this.dataSource$ = this.players.pipe(
      tap((players) => {
        if (this.showTotal) this.calcTotal(players);
      }),
      map((players) => this.getSource(players))
    );
  }

  ngOnInit(): void {
    this.dataSource$ = of(this.getSource([]));
    if (this.showTpr) this.displayedColumnsPlayer.push('tpr');
    if (this.showId) this.displayedColumnsPlayer.unshift('id');
  }
}
