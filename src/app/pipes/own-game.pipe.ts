import { Pipe, PipeTransform } from '@angular/core';
import { ColorEnum } from 'functions/src/models/ColorEnum';
import { OwnGame } from 'functions/src/models/OwnGame';
import { Game } from 'functions/src/models/Game';
import { revertResult } from 'functions/src/utility';

@Pipe({
  name: 'ownGame',
})
export class OwnGamePipe implements PipeTransform {
  transform(value: Game[], id: number): OwnGame[] {
    const result: OwnGame[] = [];
    value.forEach((game) => {
      const playingHome = game.playerHome.id === id;
      const evenBoard = game.board % 2 === 0;
      let color = ColorEnum.Wit;

      if (playingHome) color = !evenBoard ? ColorEnum.Wit : ColorEnum.Zwart;
      else color = evenBoard ? ColorEnum.Wit : ColorEnum.Zwart;

      const newGame: OwnGame = {
        opponent: playingHome ? game.playerAway : game.playerHome,
        color: color,
        result: evenBoard ? revertResult(game.result) : game.result,
        board: game.board,
        round: game.round,
        opponentTeam: playingHome ? game.teamAway : game.teamHome,
      };
      result.push(newGame);
    });
    result.sort((a, b) => a.round - b.round);
    return result;
  }
}
