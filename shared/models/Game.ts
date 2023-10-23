import { TeamView } from './TeamView';
import { Player } from './Player';
import { ResultEnum } from './ResultEnum';

export interface Game {
  white: Player;
  black: Player;
  teamWhite: TeamView;
  teamBlack: TeamView;
  board: number;
  round: number;
  result: ResultEnum;
}
