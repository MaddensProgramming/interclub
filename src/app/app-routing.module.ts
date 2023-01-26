import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClubComponent } from './components/clubs/club/club.component';
import { HalloffameComponent } from './components/overall/halloffame/halloffame.component';
import { HomeComponent } from './components/overall/home/home.component';
import { PageNotFoundComponent } from './components/overall/page-not-found/page-not-found.component';
import { PlayerComponent } from './components/overall/player/player.component';
import { TeamViewComponent } from './components/clubs/team/team-view/team-view.component';
import { UploadComponent } from './components/overall/upload/upload.component';
import { PlayeroverviewclubComponent } from './components/clubs/playeroverviewclub/playeroverviewclub.component';
import { FeedbackComponent } from './components/messages/feedback/feedback.component';
import { ReviewsComponent } from './components/messages/reviews/reviews.component';
import { DivisionOverviewComponent } from './components/division/division-overview/division-overview.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'feedback', component: FeedbackComponent },
  { path: 'reviews', component: ReviewsComponent },
  { path: 'division/:id/:class', component: DivisionOverviewComponent },
  { path: 'division', redirectTo:'division/1/A' },
  {
    path: 'club/:id',
    component: ClubComponent,
    children: [
      { path: 'players', component: PlayeroverviewclubComponent },
      { path: ':id', component: TeamViewComponent },
      { path: '', redirectTo: 'players', pathMatch: 'full' },
    ],
  },
  { path: 'player/:id', component: PlayerComponent },
  { path: 'upload', component: UploadComponent },
  { path: 'hallOfFame', component: HalloffameComponent },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
