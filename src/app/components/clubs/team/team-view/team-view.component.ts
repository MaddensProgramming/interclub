import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  ReplaySubject,
  share,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { DataBaseService } from 'src/app/services/database.service';
import { TeamServiceService } from 'src/app/services/team-service.service';
import { Location } from '@angular/common';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Player } from 'shared/models/Player';
import { ResultEnum } from 'shared/models/ResultEnum';
import { Round } from 'shared/models/Round';
import { TeamView } from 'shared/models/TeamView';

@Component({
  selector: 'app-team-view',
  templateUrl: './team-view.component.html',
  styleUrls: ['./team-view.component.scss'],
})
export class TeamViewComponent implements OnInit, OnDestroy {
  teamId: number;
  clubId: number;
  selectedIndex: number;
  destroy$: ReplaySubject<void> = new ReplaySubject<void>();

  public team$: Observable<TeamView>;
  public players$: Observable<Player[]>;

  board: FormControl = new FormControl('Alle');
  totaal: Player;

  constructor(
    private db: DataBaseService,
    private route: ActivatedRoute,
    private teamService: TeamServiceService,
    private location: Location
  ) {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    const boardObs = this.board.valueChanges.pipe(startWith('Alle'));
    const teamObs = combineLatest([
      this.route.params,
      this.route.parent.params,
    ]).pipe(
      tap(([team, club]) => {
        this.teamService.selectedTeamTab.next(team['id']);
        this.clubId = club['id'];
        this.teamId = team['id'];
        this.selectedIndex = this.selectTab(team['tab']);
      }),
      switchMap(([team, club]) => this.db.getTeam(team['id'], club['id']))
    );

    this.team$ = teamObs.pipe(
      map((team) => this.fillInAverageRatingForRound(team))
    );
    this.players$ = combineLatest([boardObs, this.team$]).pipe(
      map(([board, team]) => this.filterResultsForBoard(board, team))
    );
  }

  changeUrl(tab: number) {
    let url: string = (tab - 1).toString();
    if (tab === 0) url = 'results';
    if (tab === 1) url = 'players';
    this.location.replaceState(
      '/club/' + this.clubId + '/' + this.teamId + '/' + url
    );
  }

  selectTab(tab: string): number {
    if (tab === 'results') return 0;
    if (tab === 'players') return 1;
    return +tab + 1;
  }

  boardArray(boardCount: number): string[] {
    const result = ['Alle'];
    for (let index = 0; index < boardCount; index++) {
      result.push((index + 1).toString());
    }
    return result;
  }

  fillInAverageRatingForRound(team: TeamView): TeamView {
    team.rounds.forEach((round) => {
      round.averageRatingHome = this.averageRating(round, round.teamHome);
      round.averageRatingAway = this.averageRating(round, round.teamAway);
    });
    return team;
  }

  averageRating(round: Round, team: TeamView): number {
    return Math.round(
      round.games.reduce((totRating, round) => {
        if (this.sameTeam(team, round.teamWhite))
          totRating += round.white.rating;
        if (this.sameTeam(team, round.teamBlack))
          totRating += round.black.rating;
        return totRating;
      }, 0) / round.games.length
    );
  }

  sameTeam(teamA: TeamView, teamB: TeamView): boolean {
    return teamA.clubId === teamB.clubId && teamA.id === teamB.id;
  }

  filterResultsForBoard(board: string, team: TeamView): Player[] {
    const newplayerList: Player[] = [];
    team.rounds.forEach((round) =>
      round.games.forEach((game) => {
        if (board === 'Alle' || board === game.board.toString()) {
          if (
            game.teamWhite.clubId === team.clubId &&
            game.teamWhite.id === team.id
          )
            this.addGameAsWhite(game.white, game.result, newplayerList);
          if (
            game.teamBlack.clubId === team.clubId &&
            game.teamBlack.id === team.id
          )
            this.addGameAsBlack(game.black, game.result, newplayerList);
        }
      })
    );

    return newplayerList;
  }

  addGameAsWhite(
    player: Player,
    result: ResultEnum,
    playerList: Player[]
  ): void {
    let playerToAdd = playerList.find(
      (playerArr) => playerArr.id === player.id
    );
    if (!playerToAdd) {
      playerToAdd = { ...player, numberOfGames: 0, score: 0 };
      playerList.push(playerToAdd);
    }
    playerToAdd.numberOfGames++;
    playerToAdd.score += this.checkWhiteScore(result);
  }

  addGameAsBlack(
    player: Player,
    result: ResultEnum,
    playerList: Player[]
  ): void {
    let playerToAdd = playerList.find(
      (playerArr) => playerArr.id === player.id
    );
    if (!playerToAdd) {
      playerToAdd = { ...player, numberOfGames: 0, score: 0 };
      playerList.push(playerToAdd);
    }
    playerToAdd.numberOfGames++;
    playerToAdd.score += this.checkBlackScore(result);
  }

  checkBlackScore(result: ResultEnum): number {
    switch (result) {
      case ResultEnum.BlackWins:
      case ResultEnum.BlackFF:
        return 1;
      case ResultEnum.Draw:
        return 0.5;
      case ResultEnum.WhiteWins:
      case ResultEnum.WhiteFF:
        return 0;
      default:
        return 0;
    }
  }

  checkWhiteScore(result: ResultEnum): number {
    switch (result) {
      case ResultEnum.WhiteWins:
      case ResultEnum.WhiteFF:
        return 1;
      case ResultEnum.Draw:
        return 0.5;
      case ResultEnum.BlackWins:
      case ResultEnum.BlackFF:
        return 0;
      default:
        return 0;
    }
  }
}
