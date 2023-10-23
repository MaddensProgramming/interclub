import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClubComponent } from './components/clubs/club/club.component';
import { HalloffameComponent } from './components/overall/halloffame/halloffame.component';
import { HomeComponent } from './components/overall/home/home.component';
import { PageNotFoundComponent } from './components/overall/page-not-found/page-not-found.component';
import { PlayerComponent } from './components/overall/player/player.component';
import { TeamViewComponent } from './components/clubs/team/team-view/team-view.component';
import { PlayeroverviewclubComponent } from './components/clubs/playeroverviewclub/playeroverviewclub.component';
import { FeedbackComponent } from './components/messages/feedback/feedback.component';
import { ReviewsComponent } from './components/messages/reviews/reviews.component';
import { DivisionOverviewComponent } from './components/division/division-overview/division-overview.component';
import { LocationOverviewComponentComponent } from './components/clubs/location-overview-component/location-overview-component.component';
import { FullRoundOverviewComponent } from './components/overall/full-round-overview/full-round-overview.component';
import { RoundResultsContainerComponent } from './components/overall/round-results-container/round-results-container.component';

const routes: Routes = [
  { path: '', component: HomeComponent, data: { title: 'Home' } },
  {
    path: 'feedback',
    component: FeedbackComponent,
    data: { title: 'Feedback' },
  },
  {
    path: 'fullRound',
    redirectTo: 'round/3',
  },
  {
    path: 'round/:id',
    component: RoundResultsContainerComponent,
    data: { title: 'Round' },
  },

  { path: 'reviews', component: ReviewsComponent, data: { title: 'Reviews' } },
  {
    path: 'division/:id/:class',
    component: DivisionOverviewComponent,
    data: { title: 'Division Overview' },
  },
  { path: 'division', redirectTo: 'division/1/A' },
  {
    path: 'club/:id',
    component: ClubComponent,
    children: [
      {
        path: 'players',
        component: PlayeroverviewclubComponent,
        data: { title: 'Club Players' },
      },
      {
        path: 'location',
        component: LocationOverviewComponentComponent,
        data: { title: 'Club Location' },
      },
      {
        path: ':id/:tab',
        component: TeamViewComponent,
        data: { title: 'Club Team' },
      },
      { path: ':id', redirectTo: ':id/results' },
      { path: '', redirectTo: 'players', pathMatch: 'full' },
    ],
  },
  { path: 'player/:id', component: PlayerComponent, data: { title: 'Player' } },
  {
    path: 'hallOfFame',
    component: HalloffameComponent,
    data: { title: 'Top Players' },
  },
  {
    path: '**',
    component: PageNotFoundComponent,
    data: { title: 'Error not found' },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
