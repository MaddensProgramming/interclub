export interface GameFrbe {
  idnumber_home: number | null;
  idnumber_visit: number;
  result: string;
  overruled: string;
}

export interface EncounterFrbe {
  icclub_home: number;
  icclub_visit: number;
  pairingnr_home: number;
  pairingnr_visit: number;
  matchpoint_home: number;
  matchpoint_visit: number;
  boardpoint2_home: number;
  boardpoint2_visit: number;
  games: GameFrbe[];
  played: boolean;
  signhome_idnumber: number;
  signhome_ts: string | null;
  signvisit_idnumber: number;
  signvisit_ts: string | null;
}

export interface RoundFrbe {
  round: number;
  rdate: string;
  encounters: EncounterFrbe[];
}

export interface TeamFrbe {
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
  teams: TeamFrbe[];
  rounds: RoundFrbe[];
}

export interface PlayerFrbe {
  assignedrating: number;
  average: number;
  fiderating?: number;
  first_name: string;
  idcluborig: number;
  idclubvisit: number;
  idnumber: number;
  last_name: string;
  natrating?: number;
  nature: string;
  titular: string;
}
