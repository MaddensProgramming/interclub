import { Player } from './Player';
import { Round } from './Round';

export interface TeamView {
  id: number;
  clubName: string;
  clubId: number;
  class: number;
  pairingsNumber?: number;
  division: string;
  rounds?: Round[];
  players?: Player[];
  boardPoints?: number;
  matchPoints?: number;
}
