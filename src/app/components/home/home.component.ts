import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Club, ClubOverview } from 'src/app/models/club';
import { DataBaseService } from '../../services/database.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public clubs: Observable<ClubOverview>;



  constructor(private router: Router, private service: DataBaseService) { }

  ngOnInit(): void {
    this.clubs= this.service.getOverview();
  }

  navigateToClub(id: number): void {
    this.router.navigate([`club/${id}`])
  }

}
