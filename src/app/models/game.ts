import { ColorEnum } from './color.enum';
import { Player } from './player';
import { ResultEnum } from './result.enum';
import { Team } from './team';

export interface Game {
  white: Player;
  black: Player;
  teamWhite: Team;
  teamBlack: Team;
  board: number;
  round: number;
  result: ResultEnum;
}

export interface OwnGame {
  opponent: Player;
  color: ColorEnum;
  result: ResultEnum;
  board: number;
  round: number;
  opponentTeam: Team;
}
