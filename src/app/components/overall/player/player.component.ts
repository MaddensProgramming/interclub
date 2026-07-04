import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { filter, Observable, switchMap } from 'rxjs';
import { Player } from 'functions/src/models/Player';
import { DataBaseService } from 'src/app/services/database.service';
import {
  MatCard,
  MatCardHeader,
  MatCardTitle,
  MatCardSubtitle,
  MatCardContent,
} from '@angular/material/card';
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
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { OwnResultPipe } from '../../../pipes/result.pipe';
import { OwnGamePipe } from '../../../pipes/own-game.pipe';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
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
    MatProgressSpinner,
    AsyncPipe,
    OwnResultPipe,
    OwnGamePipe,
  ],
})
export class PlayerComponent implements OnInit {
  displayedColumns: string[] = [
    'round',
    'color',
    'opponent',
    'rating',
    'score',
  ];
  public player$: Observable<Player>;

  constructor(
    private route: ActivatedRoute,
    private databaseService: DataBaseService,
  ) {}

  ngOnInit(): void {
    this.player$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.databaseService.getPlayer(+params.get('id')),
      ),
    );
  }
}
