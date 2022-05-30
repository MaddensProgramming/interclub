import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Round, TeamView } from 'src/app/models/club';
import { Player } from 'src/app/models/player';
import { ResultEnum } from 'src/app/models/result.enum';
import { DataBaseService } from 'src/app/services/database.service';
import { PlayerListComponent } from '../player-list/player-list.component';

@Component({
  selector: 'app-team-view',
  templateUrl: './team-view.component.html',
  styleUrls: ['./team-view.component.scss'],
})
export class TeamViewComponent implements OnInit {
  @Input() clubId: number;
  @Input() id: number;
  team: TeamView;
  loaded: boolean = false;

  @ViewChild(PlayerListComponent) teamPlayers: PlayerListComponent;

  totaal: Player;

  constructor(private db: DataBaseService) {}

  ngOnInit(): void {
    this.db.getTeam(this.id, this.clubId).subscribe((data) => {
      this.team = data;
      this.showRes("");
      this.loaded = true;
    });
  }

  boardArray(boardCount: number): number[] {
    const result = [];
    for (let index = 0; index < boardCount; index++) {
      result.push(index + 1);
    }
    return result;
  }

  showRes(event: string): void {
    const newplayerList: Player[] = [];
    this.team.rounds.forEach((round) =>
      round.games.forEach((game) => {
        if (event=== "" || event===game.board.toString()) {
          if (
            game.teamWhite.clubId === this.team.clubId &&
            game.teamWhite.id === this.team.id
          )
            this.addGameAsWhite(game.white, game.result, newplayerList);
          if (
            game.teamBlack.clubId === this.team.clubId &&
            game.teamBlack.id === this.team.id
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
    this.team.players = newplayerList;
    if (this.teamPlayers) this.teamPlayers.updateTable(newplayerList);
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
