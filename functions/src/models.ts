export interface TeamView {
  id: number;
  clubName: string;
  clubId: number;
  class: number;
  pairingsNumber: number;
  division: string;
  rounds?: Round[];
  players?: Player[];
  boardPoints?: number;
  matchPoints?: number;
}

export interface Round {
  id: number;

  teamHome: TeamView;
  scoreHome: number;
  averageRatingHome?: number;

  teamAway: TeamView;
  scoreAway: number;
  averageRatingAway?: number;

  games?: Game[];
}

export interface Game {
  white: Player;
  black: Player;
  teamWhite: TeamView;
  teamBlack: TeamView;
  board: number;
  round: number;
  result: ResultEnum;
}

export interface OwnGame {
  opponent: Player;
  color: ColorEnum;
  result: ResultEnum;
  board: number;
  round: number;
  opponentTeam: TeamView;
}
export enum ResultEnum {
  WhiteWins = 1,
  Draw = 2,
  BlackWins = 3,
  WhiteFF = 4,
  BlackFF = 5,
  BothFF = 6,
}
export enum ColorEnum {
  Wit = 1,
  Zwart = 2,
}

export interface Division {
  teams: TeamView[];
  class: number;
  division: string;
}

export interface Player {
  id: number;
  firstName: string;
  name: string;
  rating: number;
  ratingFide?: number;
  ratingNational?: number;
  tpr: number;
  diff?: number;
  score: number;
  numberOfGames: number;
  clubId?: number;
  clubName?: string;
  games?: Game[];
  accumulatedRatings?: number;
}

export interface PlayerOverview {
  players: SimplePlayer[];
}
export interface SimplePlayer {
  id: number;
  name: string;
}

export interface ClassOverview {
  classes: DivisionOverview[];
}

export interface DivisionOverview {
  class: number;
  divisions: string[];
}

export interface ClubView {
  id: number;
  name: string;
  venues?: PlayingHall[];
  teams: TeamView[];
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

export interface PlayingHall {
  address: string;
  capacity: number;
  email: string;
  notavailable: string[];
  phone: string;
  remarks: string;
}

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
  team?: number;
  accumulatedRatings?: number;
}

export interface Game {
  white: Player;
  black: Player;
  teamWhite: TeamView;
  teamBlack: TeamView;
  board: number;
  round: number;
  result: ResultEnum;
}

export interface RoundOverview {
  divisions: DivisionRound[];
}
export interface DivisionRound {
  class: number;
  division: string;
  matches: Round[];
}
