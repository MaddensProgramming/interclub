import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, tap, switchMap, map } from 'rxjs';
import { PlayingHall } from 'functions/src/models/PlayingHall';

import { DataBaseService } from 'src/app/services/database.service';
import { TeamServiceService } from 'src/app/services/team-service.service';

@Component({
  selector: 'app-location-overview-component',
  templateUrl: './location-overview-component.component.html',
  styleUrls: ['./location-overview-component.component.scss'],
})
export class LocationOverviewComponentComponent implements OnInit {
  public venues$: Observable<PlayingHall[]>;

  constructor(
    private route: ActivatedRoute,
    private db: DataBaseService,
    private teamService: TeamServiceService
  ) {}

  ngOnInit(): void {
    this.venues$ = this.route.parent.paramMap.pipe(
      tap(() => this.teamService.selectedTeamTab.next('location')),
      switchMap((params: ParamMap) => {
        return this.db.getClub(+params.get('id'));
      }),
      map((club) => club.venues)
    );
  }
}
