import { Game } from './game';
import { Player } from './player';

export interface Club {
  id: number;
  name: string;
  players: Player[];
}
export interface ClubOverview {
  provinces: ProvinceOverview[];
}

export interface ProvinceOverview {
  id: number;
  clubs: ClubOverviewItem[];
}
export interface ClubOverviewItem {
  id: number;
  name: string;
}

export interface ClubView {
  id: number;
  name: string;
  teams: TeamView[];
  players: Player[];
}

export interface TeamView {
  id: number;
  clubName: string;
  clubId: number;
  players: Player[]; //edited scores
  class: number;
  division: string;
  rounds: Round[];
}

export interface Round {
  id: number;
  scoreHome: number;
  scoreAway: number;
  games: Game[];
}
