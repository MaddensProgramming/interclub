import { Player } from "./player";

export interface Club {
  id: number;
  name: string;
  teams?: string[];
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



