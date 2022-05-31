import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { map, Observable, switchMap, tap } from 'rxjs';
import { Player } from 'src/app/models/player';
import { DataBaseService } from 'src/app/services/database.service';
import { TeamServiceService } from 'src/app/services/team-service.service';

@Component({
  selector: 'app-playeroverviewclub',
  templateUrl: './playeroverviewclub.component.html',
  styleUrls: ['./playeroverviewclub.component.scss'],
})
export class PlayeroverviewclubComponent implements OnInit {
  public players$: Observable<Player[]>;

  constructor(
    private route: ActivatedRoute,
    private db: DataBaseService,
    private teamService: TeamServiceService
  ) {}

  ngOnInit(): void {
    this.players$ = this.route.parent.paramMap.pipe(
      tap(() => this.teamService.selectedTeamTab.next('players')),
      switchMap((params: ParamMap) => {
        return this.db.getClub(+params.get('id'));
      }),
      map((club) => club.players)
    );
  }
}
