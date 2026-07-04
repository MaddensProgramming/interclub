import {
  Component,
  ChangeDetectionStrategy,
  computed,
  effect,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
  MatTable,
  MatTableDataSource,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatFooterCellDef,
  MatFooterCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow,
  MatFooterRowDef,
  MatFooterRow,
} from '@angular/material/table';
import { Observable } from 'rxjs';
import { Player } from 'functions/src/models/Player';
import { RouterLink } from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatFooterCellDef,
    MatFooterCell,
    RouterLink,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatFooterRowDef,
    MatFooterRow,
    MatProgressSpinner,
  ],
})
export class PlayerListComponent {
  public players = input.required<Observable<Player[]>>();
  public showTpr = input(false);
  public showId = input(false);
  public showTotal = input(false);

  totaal: Player | null;
  dataSource = new MatTableDataSource<Player>([]);
  loading = signal(true);
  sort = viewChild(MatSort);

  displayedColumnsPlayer = computed(() => {
    const columns = [
      'name',
      'score',
      'numberOfGames',
      'rating',
      'ratingFide',
      'ratingNat',
    ];
    if (this.showTpr()) columns.push('tpr');
    if (this.showId()) columns.unshift('id');
    return columns;
  });

  constructor() {
    effect((onCleanup) => {
      this.loading.set(true);
      const subscription = this.players().subscribe((players) => {
        if (this.showTotal()) this.calcTotal(players);
        this.dataSource.data = [...players];
        this.loading.set(false);
      });
      onCleanup(() => subscription.unsubscribe());
    });

    effect(() => {
      const sort = this.sort();
      if (!sort) return;
      this.dataSource.sort = sort;
      this.dataSource.data = [...this.dataSource.data];
    });
  }

  public calcTotal(players: Player[]): void {
    this.totaal = null;
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
    if (totalGames === 0) return;

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
}
