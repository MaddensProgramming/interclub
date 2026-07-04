import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/overall/home/home.component').then(
        (m) => m.HomeComponent,
      ),
    data: { title: 'Home' },
  },
  {
    path: 'feedback',
    loadComponent: () =>
      import('./components/messages/feedback/feedback.component').then(
        (m) => m.FeedbackComponent,
      ),
    data: { title: 'Feedback' },
  },
  {
    path: 'fullRound',
    redirectTo: 'round/11',
  },
  {
    path: 'round/:id',
    loadComponent: () =>
      import('./components/overall/round-results-container/round-results-container.component').then(
        (m) => m.RoundResultsContainerComponent,
      ),
    data: { title: 'Round' },
  },
  {
    path: 'reviews',
    loadComponent: () =>
      import('./components/messages/reviews/reviews.component').then(
        (m) => m.ReviewsComponent,
      ),
    data: { title: 'Reviews' },
  },
  {
    path: 'division/:id/:class',
    loadComponent: () =>
      import('./components/division/division-overview/division-overview.component').then(
        (m) => m.DivisionOverviewComponent,
      ),
    data: { title: 'Division Overview' },
  },
  { path: 'division', redirectTo: 'division/1/A' },
  {
    path: 'club/:id',
    loadComponent: () =>
      import('./components/clubs/club/club.component').then(
        (m) => m.ClubComponent,
      ),
    children: [
      {
        path: 'players',
        loadComponent: () =>
          import('./components/clubs/playeroverviewclub/playeroverviewclub.component').then(
            (m) => m.PlayeroverviewclubComponent,
          ),
        data: { title: 'Club Players' },
      },
      {
        path: 'location',
        loadComponent: () =>
          import('./components/clubs/location-overview-component/location-overview-component.component').then(
            (m) => m.LocationOverviewComponentComponent,
          ),
        data: { title: 'Club Location' },
      },
      {
        path: ':id/:tab',
        loadComponent: () =>
          import('./components/clubs/team/team-view/team-view.component').then(
            (m) => m.TeamViewComponent,
          ),
        data: { title: 'Club Team' },
      },
      { path: ':id', redirectTo: ':id/results' },
      { path: '', redirectTo: 'players', pathMatch: 'full' },
    ],
  },
  {
    path: 'player/:id',
    loadComponent: () =>
      import('./components/overall/player/player.component').then(
        (m) => m.PlayerComponent,
      ),
    data: { title: 'Player' },
  },
  {
    path: 'hallOfFame',
    loadComponent: () =>
      import('./components/overall/halloffame/halloffame.component').then(
        (m) => m.HalloffameComponent,
      ),
    data: { title: 'Top Players' },
  },
  {
    path: '**',
    loadComponent: () =>
      import('./components/overall/page-not-found/page-not-found.component').then(
        (m) => m.PageNotFoundComponent,
      ),
    data: { title: 'Error not found' },
  },
];
