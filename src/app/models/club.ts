import { Game } from './game';
import { Player } from './player';

export interface Year {
  id: string;
  clubView: ClubView[];
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
  class: number;
  division: string;
  pairingsNumber:number;
  matchPoints?: number;
  boardPoints?: number;
  players?: Player[];
  rounds?: Round[];
}
export interface Round {
  id: number;

  teamHome: TeamView;
  scoreHome: number;
  averageRatingHome?: number;

  teamAway: TeamView;
  scoreAway: number;
  averageRatingAway?: number;

  games: Game[];
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
