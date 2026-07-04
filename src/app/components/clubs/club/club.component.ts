import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  ActivatedRoute,
  ParamMap,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import {
  BehaviorSubject,
  filter,
  map,
  Observable,
  pipe,
  ReplaySubject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { DataBaseService } from 'src/app/services/database.service';
import { TeamServiceService } from 'src/app/services/team-service.service';
import { PlayerListComponent } from '../team/player-list/player-list.component';
import { ClubView } from 'functions/src/models/ClubView';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-club',
  templateUrl: './club.component.html',
  styleUrls: ['./club.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatTabNav,
    MatTabLink,
    RouterLink,
    MatTabNavPanel,
    RouterOutlet,
    MatProgressSpinner,
    AsyncPipe,
  ],
})
export class ClubComponent implements OnInit {
  public club$: Observable<ClubView>;
  public activeLink: Observable<string>;

  constructor(
    private route: ActivatedRoute,
    private databaseService: DataBaseService,
    private teamService: TeamServiceService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.activeLink = this.teamService.selectedTeamTab
      .asObservable()
      .pipe(tap(() => this.cd.detectChanges()));
    this.club$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        return this.databaseService.getClub(+params.get('id'));
      }),
    );
  }
}
