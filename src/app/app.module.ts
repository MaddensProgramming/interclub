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
import { ResultPipe } from './pipes/result.pipe';
import { UploadComponent } from './components/upload/upload.component';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { ProvincePipe } from './pipes/province.pipe';




@NgModule({
  declarations: [
    AppComponent,
    ClubComponent,
    HomeComponent,
    PageNotFoundComponent,
    PlayerComponent,
    ResultPipe,
    UploadComponent,
    ProvincePipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatTableModule,
    MatTabsModule,
    MatCardModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
