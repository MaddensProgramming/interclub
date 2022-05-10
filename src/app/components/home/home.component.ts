import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import {  ClubOverview } from 'src/app/models/club';
import { DataBaseService } from '../../services/database.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public clubOverview$: Observable<ClubOverview>;

  constructor( private service: DataBaseService) {}

  ngOnInit(): void {
    this.clubOverview$ = this.service.getOverview();
  }
}
