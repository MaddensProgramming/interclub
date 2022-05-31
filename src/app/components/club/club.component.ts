import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {
  filter,
  map,
  Observable,
  pipe,
  ReplaySubject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { ClubView } from 'src/app/models/club';
import { Game } from 'src/app/models/game';
import { Player } from 'src/app/models/player';
import { ResultEnum } from 'src/app/models/result.enum';
import { DataBaseService } from 'src/app/services/database.service';
import { PlayerListComponent } from '../team-components/player-list/player-list.component';

@Component({
  selector: 'app-club',
  templateUrl: './club.component.html',
  styleUrls: ['./club.component.scss'],
})
export class ClubComponent implements OnInit, OnDestroy {
  public club$: Observable<ClubView>;
  public activeLink: string;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private route: ActivatedRoute,
    private databaseService: DataBaseService,
    private router: Router
  ) {}
  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    //this breaks when another route is visited
    this.route.firstChild.params
      .pipe(
        takeUntil(this.destroyed$),
        tap((data) => console.log)
      )
      .subscribe((params) => (this.activeLink = params['id'] ?? 'players'));

    this.club$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        return this.databaseService.getClub(+params.get('id'));
      }),
      filter((club) => {
        if (!club) this.router.navigate(['404']);
        return !!club;
      })
    );
  }
}
