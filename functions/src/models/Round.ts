import { TeamView } from './TeamView';
import { Game } from './Game';

export interface Round {
  id: number;
  /** Shared match day (D6 rounds 5–9 coincide with match days 7–11). */
  calendarRound?: number;
  played?: boolean;

  teamHome: TeamView;
  scoreHome: number;
  averageRatingHome?: number;

  teamAway: TeamView;
  scoreAway: number;
  averageRatingAway?: number;

  games?: Game[];
}
