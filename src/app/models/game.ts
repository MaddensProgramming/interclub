import { Player } from "./player";
import { ResultEnum } from "./result.enum";
import { Team } from "./team";

export interface Game {
  white: Player;
  black: Player;
  teamWhite: Team;
  teamBlack: Team;
  board: number;
  round: number;
  result: ResultEnum;
}


