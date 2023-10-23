import { TeamView } from './TeamView';
import { Player } from './Player';
import { ColorEnum } from './ColorEnum';
import { ResultEnum } from './ResultEnum';

export interface OwnGame {
  opponent: Player;
  color: ColorEnum;
  result: ResultEnum;
  board: number;
  round: number;
  opponentTeam: TeamView;
}
