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
}

export interface TeamView {
  id: number;
  players: Player[]; //edited scores
  division: string;
  rounds: RoundTeam[];
}

export interface RoundTeam {
  id: number;
  scoreHome: number;
  games: Game[];
}
