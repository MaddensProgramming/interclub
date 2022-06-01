import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ClubComponent } from './components/club/club.component';
import { HomeComponent } from './components/home/home.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { PlayerComponent } from './components/player/player.component';
import { OwnResultPipe, ResultPipe } from './pipes/result.pipe';
import { UploadComponent } from './components/upload/upload.component';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { ProvincePipe } from './pipes/province.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OwnGamePipe } from './pipes/own-game.pipe';
import { ColorPipe } from './pipes/color.pipe';
import { PlayerListComponent } from './components/team-components/player-list/player-list.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSortModule } from '@angular/material/sort';
import { RoundViewComponent } from './components/team-components/round-view/round-view.component';
import { TeamViewComponent } from './components/team-components/team-view/team-view.component';
import { NumberOfPlayersPipe } from './pipes/number-of-players.pipe';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { HalloffameComponent } from './components/halloffame/halloffame.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveComponentModule } from '@ngrx/component';
import { PlayeroverviewclubComponent } from './components/playeroverviewclub/playeroverviewclub.component';
import { TeamresultsComponent } from './components/team-components/teamresults/teamresults.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { ToastrModule } from 'ngx-toastr';
import { ReviewsComponent } from './components/reviews/reviews.component';
import { HttpClientModule } from '@angular/common/http';
import { DivisionOverviewComponent } from './components/division-overview/division-overview.component';



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
    HttpClientModule

  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
