import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ClubComponent } from './components/clubs/club/club.component';
import { HomeComponent } from './components/overall/home/home.component';
import { PageNotFoundComponent } from './components/overall/page-not-found/page-not-found.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { PlayerComponent } from './components/overall/player/player.component';
import { OwnResultPipe, ResultPipe } from './pipes/result.pipe';
import { UploadComponent } from './components/overall/upload/upload.component';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { ProvincePipe } from './pipes/province.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OwnGamePipe } from './pipes/own-game.pipe';
import { ColorPipe } from './pipes/color.pipe';
import { PlayerListComponent } from './components/clubs/team/player-list/player-list.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSortModule } from '@angular/material/sort';
import { RoundViewComponent } from './components/clubs/team/round-view/round-view.component';
import { TeamViewComponent } from './components/clubs/team/team-view/team-view.component';
import { NumberOfPlayersPipe } from './pipes/number-of-players.pipe';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { HalloffameComponent } from './components/overall/halloffame/halloffame.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveComponentModule } from '@ngrx/component';
import { PlayeroverviewclubComponent } from './components/clubs/playeroverviewclub/playeroverviewclub.component';
import { TeamresultsComponent } from './components/clubs/team/teamresults/teamresults.component';
import { FeedbackComponent } from './components/messages/feedback/feedback.component';
import { ToastrModule } from 'ngx-toastr';
import { ReviewsComponent } from './components/messages/reviews/reviews.component';
import { HttpClientModule } from '@angular/common/http';
import { DivisionOverviewComponent } from './components/division/division-overview/division-overview.component';
import { DivisionStandingsComponent } from './components/division/division-standings/division-standings.component';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [
    AppComponent,
    ClubComponent,
    HomeComponent,
    PageNotFoundComponent,
    PlayerComponent,
    ResultPipe,
    OwnResultPipe,
    //UploadComponent,
    ProvincePipe,
    OwnGamePipe,
    ColorPipe,
    PlayerListComponent,
    TeamViewComponent,
    RoundViewComponent,
    NumberOfPlayersPipe,
    HalloffameComponent,
    PlayeroverviewclubComponent,
    TeamresultsComponent,
    FeedbackComponent,
    ReviewsComponent,
    DivisionOverviewComponent,
    DivisionStandingsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatTableModule,
    MatTabsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    MatSortModule,
    MatToolbarModule,
    MatIconModule,
    MatTreeModule,
    MatButtonModule,
    MatSelectModule,
    MatPaginatorModule,
    MatAutocompleteModule,
    ReactiveComponentModule,
    ToastrModule.forRoot(),
    HttpClientModule,
    MatCheckboxModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
