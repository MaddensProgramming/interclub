import { TeamView } from './TeamView';
import { Game } from './Game';

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
