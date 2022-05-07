import { Game } from "./game";

export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  rating: string;
  clubId?: number;
  clubName?: string;
  games?: Game[];
}
