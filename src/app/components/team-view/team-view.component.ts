import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Round, TeamView } from 'src/app/models/club';
import { Player } from 'src/app/models/player';
import { ResultEnum } from 'src/app/models/result.enum';

@Component({
  selector: 'app-team-view',
  templateUrl: './team-view.component.html',
  styleUrls: ['./team-view.component.scss'],
})
export class TeamViewComponent implements OnInit {
  @Input() team: TeamView;

  constructor() {}

  ngOnInit(): void {this.showRes([])}

  boardArray(boardCount: number): number[] {
    const result = [];
    for (let index = 0; index < boardCount; index++) {
      result.push(index+1);    }
    return result;
  }

  showRes(event:string[]): void {
    const newplayerList: Player[]= [];
    this.team.rounds.forEach(round => round.games.forEach(game=> {
      if(event.length===0||event.includes(game.board.toString())){
        if(game.white.clubId===this.team.clubId)this.addGameAsWhite(game.white,game.result, newplayerList);
        if(game.black.clubId===this.team.clubId)this.addGameAsBlack(game.black,game.result, newplayerList);
      }
    }))
    this.team.players = newplayerList;
  }

  addGameAsWhite(player: Player,result:ResultEnum, playerList: Player[]): void {
   let playerToAdd =  playerList.find(playerArr=> playerArr.id ===  player.id );
   if(!playerToAdd) {playerToAdd={...player,numberOfGames:0, score:0};  playerList.push(playerToAdd)}
   playerToAdd.numberOfGames++;
   playerToAdd.score+=this.checkWhiteScore(result);
  }

  addGameAsBlack(player: Player,result:ResultEnum, playerList: Player[]): void {
    let playerToAdd =  playerList.find(playerArr=> playerArr.id ===  player.id );
    if(!playerToAdd) {playerToAdd={...player,numberOfGames:0, score:0}; playerList.push(playerToAdd)}
    playerToAdd.numberOfGames++;
    playerToAdd.score+=this.checkBlackScore(result);
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
