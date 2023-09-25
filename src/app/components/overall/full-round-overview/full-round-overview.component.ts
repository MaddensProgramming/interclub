import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { RoundOverview } from 'scripts/src/models';
import { DataBaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-full-round-overview',
  templateUrl: './full-round-overview.component.html',
  styleUrls: ['./full-round-overview.component.scss'],
})
export class FullRoundOverviewComponent implements OnInit {
  constructor(private database: DataBaseService) {}
  public fullRoundOverview$: Observable<RoundOverview>;

  displayedColumnsRound: string[] = ['board', 'white', 'black', 'result'];

  ngOnInit(): void {
    this.fullRoundOverview$ = this.database.getFullRoundOverview();
  }
}
