import { TeamView } from './club';
import { ColorEnum } from './color.enum';
import { Player } from './player';
import { ResultEnum } from './result.enum';
export interface Game {
  white: Player;
  black: Player;
  teamWhite: TeamView;
  teamBlack: TeamView;
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
  opponentTeam: TeamView;
}
