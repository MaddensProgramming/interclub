import { Game } from './Game';

export interface Player {
  id: number;
  firstName: string;
  name: string;
  rating: number;
  ratingFide?: number;
  ratingNat?: number;
  tpr: number;
  diff?: number;
  score: number;
  numberOfGames: number;
  clubId?: number;
  clubName?: string;
  games?: Game[];
  team?: number;
  accumulatedRatings?: number;
}
