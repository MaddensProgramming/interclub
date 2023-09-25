import { Round, TeamView } from './club';

export interface DivisionForm {
  class: number;
  division: string;
}

export interface Division {
  teams: TeamView[];
  class: number;
  division: string;
}

export interface ClassOverview {
  classes: DivisionOverview[];
}

export interface DivisionOverview {
  class: number;
  divisions: string[];
}

export interface RoundOverview {
  divisions: DivisionRound[];
}
export interface DivisionRound {
  class: number;
  division: string;
  matches: Round[];
}
