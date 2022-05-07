import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { Player } from 'src/app/models/player';
import { DataBaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent implements OnInit {
  public player$: Observable<Player>;

  constructor(
    private route: ActivatedRoute,
    private databaseService: DataBaseService
  ) {}

  ngOnInit(): void {
    this.player$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.databaseService.getPlayer(+params.get('id'))
      )
    );
  }
}
