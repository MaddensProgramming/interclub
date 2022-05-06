import { Player } from "./player";

export interface Game {
  white: Player;
  black: Player;
  result: ResultEnum;
}

export enum ResultEnum {
WhiteWins = 1,
Draw = 2,
BlackWins = 3,
}
