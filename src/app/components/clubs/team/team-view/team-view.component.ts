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
import { Round, TeamView } from 'src/app/models/club';
import { Player } from 'src/app/models/player';
import { ResultEnum } from 'src/app/models/result.enum';
import { DataBaseService } from 'src/app/services/database.service';
import { TeamServiceService } from 'src/app/services/team-service.service';

@Component({
  selector: 'app-team-view',
  templateUrl: './team-view.component.html',
  styleUrls: ['./team-view.component.scss'],
})
export class TeamViewComponent implements OnInit, OnDestroy {
  @Input() clubId: number;
  @Input() id: number;

  selectedIndex: number;

  destroy$: ReplaySubject<void> = new ReplaySubject<void>();

  public team$: Observable<TeamView>;
  public players$: Observable<Player[]>;

  board: FormControl = new FormControl('Alle');
  totaal: Player;

  constructor(
    private db: DataBaseService,
    private route: ActivatedRoute,
    private teamService: TeamServiceService
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
      tap(([team, club]) => this.teamService.selectedTeamTab.next(team['id'])),
      switchMap(([team, club]) => this.db.getTeam(team['id'], club['id']))
    );

    this.team$ = teamObs.pipe(
      map((team) => this.fillInAverageRatingForRound(team))
    );
    this.players$ = combineLatest([boardObs, this.team$]).pipe(
      map(([board, team]) => this.filterResultsForBoard(board, team))
    );

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (params['round']) this.selectTab(+params['round']);
      });
  }

  selectTab(round: number): void {
    this.selectedIndex = round + 2;
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
