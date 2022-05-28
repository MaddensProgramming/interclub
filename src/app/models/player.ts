import { Game } from './game';

export interface Player {
  id: number;
  firstName: string;
  name: string;
  rating: number;
  tpr: number;
  score: number;
  numberOfGames: number;
  clubId?: number;
  clubName?: string;
  games?: Game[];
}
