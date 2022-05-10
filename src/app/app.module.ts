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
import { PlayerListComponent } from './components/player-list/player-list.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { RoundViewComponent } from './components/round-view/round-view.component';
import { TeamViewComponent } from './components/team-view/team-view.component';
import { NumberOfPlayersPipe } from './pipes/number-of-players.pipe';

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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatTableModule,
    MatTabsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
