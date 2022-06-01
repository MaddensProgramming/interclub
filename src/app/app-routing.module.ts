import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClubComponent } from './components/club/club.component';
import { HalloffameComponent } from './components/halloffame/halloffame.component';
import { HomeComponent } from './components/home/home.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { PlayerComponent } from './components/player/player.component';
import { TeamViewComponent } from './components/team-components/team-view/team-view.component';
import { UploadComponent } from './components/upload/upload.component';
import { PlayeroverviewclubComponent } from './components/playeroverviewclub/playeroverviewclub.component';
import { FeedbackComponent } from './components/feedback/feedback.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path:'feedback', component:FeedbackComponent},
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
