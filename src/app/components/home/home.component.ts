import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Club } from 'src/app/models/club';
import { DataBaseService } from '../../services/database.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public clubs: Club[];
  public dataLoaded: BehaviorSubject<boolean>;


  constructor(private router: Router, private service: DataBaseService) { }

  ngOnInit(): void {
    this.dataLoaded = this.service.dataLoaded;
    this.dataLoaded.subscribe(res =>{ if(res) this.clubs = this.service.getClubs();} )
  }

  navigateToClub(id: number): void {
    this.router.navigate([`club/${id}`])
  }

}
