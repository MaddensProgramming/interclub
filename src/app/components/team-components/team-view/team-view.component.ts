import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  switchMap,
  tap,
} from 'rxjs';
import { Round, TeamView } from 'src/app/models/club';
import { Player } from 'src/app/models/player';
import { ResultEnum } from 'src/app/models/result.enum';
import { DataBaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-team-view',
  templateUrl: './team-view.component.html',
  styleUrls: ['./team-view.component.scss'],
})
export class TeamViewComponent implements OnInit, AfterViewInit {
  @Input() clubId: number;
  @Input() id: number;

  public team$: Observable<TeamView>;
  public players$: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>(
    []
  );

  board: FormControl = new FormControl('Alle');
  totaal: Player;

  constructor(
    private db: DataBaseService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const boardObs = this.board.valueChanges;
    const teamObs = combineLatest([
      this.route.params,
      this.route.parent.params,
    ]).pipe(
      switchMap(([team, club]) => this.db.getTeam(team['id'], club['id']))
    );
    this.team$ = combineLatest([boardObs, teamObs]).pipe(
      map(([board, team]) => this.showRes(board, team))
    );
  }

  ngAfterViewInit(): void {
    this.board.setValue('Alle');
    this.cd.detectChanges();
  }

  boardArray(boardCount: number): string[] {
    const result = ['Alle'];
    for (let index = 0; index < boardCount; index++) {
      result.push((index + 1).toString());
    }
    return result;
  }

  showRes(board: string, team: TeamView): TeamView {
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
    let totalRating = 0;
    let totalScore = 0;
    let totalGames = 0;
    newplayerList.forEach((player) => {
      totalGames += player.numberOfGames;
      totalScore += player.score;
      totalRating += player.rating * player.numberOfGames;
    });
    this.totaal = {
      name: 'Totaal',
      firstName: '',
      id: 0,
      rating: Math.round(totalRating / totalGames),
      numberOfGames: totalGames,
      score: totalScore,
      tpr: 0,
    };
    this.players$.next(newplayerList);
    return team;
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
