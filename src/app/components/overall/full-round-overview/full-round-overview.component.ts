import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of, switchMap, tap } from 'rxjs';
import { RoundOverview } from 'src/app/models/division';
import { DataBaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-full-round-overview',
  templateUrl: './full-round-overview.component.html',
  styleUrls: ['./full-round-overview.component.scss'],
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
        this.database.getFullRoundOverview(roundNumber.toString())
      )
    );
  }
}
