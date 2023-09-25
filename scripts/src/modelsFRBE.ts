export interface Game {
  idnumber_home: number | null;
  idnumber_visit: number;
  result: string;
}

export interface Encounter {
  icclub_home: number;
  icclub_visit: number;
  pairingnr_home: number;
  pairingnr_visit: number;
  matchpoint_home: number;
  matchpoint_visit: number;
  boardpoint2_home: number;
  boardpoint2_visit: number;
  games: Game[];
  played: boolean;
  signhome_idnumber: number;
  signhome_ts: string | null;
  signvisit_idnumber: number;
  signvisit_ts: string | null;
}

export interface Round {
  round: number;
  rdate: string;
  encounters: Encounter[];
}

export interface Team {
  division: number;
  titular: any[]; // You can define a proper interface for this if needed
  idclub: number;
  index: string;
  name: string;
  pairingnumber: number;
  playersplayed: any[]; // You can define a proper interface for this if needed
}

export interface DivisionFrbe {
  division: number;
  index: string;
  teams: Team[];
  rounds: Round[];
}
