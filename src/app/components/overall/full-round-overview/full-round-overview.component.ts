import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { BehaviorSubject, Observable, of, switchMap, tap } from 'rxjs';
import { RoundOverview } from 'functions/src/models/RoundOverview';
import { DataBaseService } from 'src/app/services/database.service';
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
import { RouterLink } from '@angular/router';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ResultPipe } from '../../../pipes/result.pipe';

@Component({
  selector: 'app-full-round-overview',
  templateUrl: './full-round-overview.component.html',
  styleUrls: ['./full-round-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    RouterLink,
    MatCellDef,
    MatCell,
    NgClass,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatProgressSpinner,
    AsyncPipe,
    ResultPipe,
  ],
})
export class FullRoundOverviewComponent implements OnInit {
  constructor(private database: DataBaseService) {}
  public fullRoundOverview$: Observable<RoundOverview>;
  @Input() public roundNumberSubject: BehaviorSubject<number>;

  displayedColumnsRound: string[] = [
    'board',
    'colorHome',
    'white',
    'result',
    'colorAway',
    'black',
  ];

  ngOnInit(): void {
    this.fullRoundOverview$ = this.roundNumberSubject.pipe(
      switchMap((roundNumber) =>
        this.database.getFullRoundOverview(roundNumber.toString()),
      ),
    );
  }
}
