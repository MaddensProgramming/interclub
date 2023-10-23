import { Player } from './Player';
import { TeamView } from './TeamView';
import { PlayingHall } from './PlayingHall';

export interface ClubView {
  id: number;
  name: string;
  venues?: PlayingHall[];
  teams: TeamView[];
  players: Player[];
}
