import { Player } from "./player";

export interface Club {
  id: number;
  name: string;
  teams?: string[];
  players: Player[];
}



