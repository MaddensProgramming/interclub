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

  displayedColumnsRound: string[] = ['board', 'white', 'black', 'result'];

  ngOnInit(): void {
    this.fullRoundOverview$ = this.roundNumberSubject.pipe(
      tap((test) => console.log(test)),
      switchMap((roundNumber) =>
        this.database.getFullRoundOverview(roundNumber.toString())
      ),
      tap((test) => console.log(test))
    );
  }
}
