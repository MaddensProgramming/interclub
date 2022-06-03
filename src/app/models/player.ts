import { Game } from './game';

export interface Player {
  id: number;
  firstName: string;
  name: string;
  rating: number;
  tpr: number;
  diff?: number;
  score: number;
  numberOfGames: number;
  clubId?: number;
  clubName?: string;
  games?: Game[];
}

export interface PlayerOverview {
  players: SimplePlayer[];
}
export interface SimplePlayer {
  id: number;
  name: string;
}
