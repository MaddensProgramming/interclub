import { TeamView } from './TeamView';
import { Player } from './Player';
import { ResultEnum } from './ResultEnum';

export interface Game {
  playerHome: Player;
  playerAway: Player;
  teamHome: TeamView;
  teamAway: TeamView;
  board: number;
  round: number;
  result: ResultEnum;
}
