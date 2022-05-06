import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Club } from 'src/app/models/club';
import { DataBaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-clubs',
  templateUrl: './clubs.component.html',
  styleUrls: ['./clubs.component.scss']
})
export class ClubsComponent implements OnInit {

  public club: Club;

  constructor(private route: ActivatedRoute, private databaseService: DataBaseService) { }

  ngOnInit(): void {
   this.route.paramMap.subscribe((params:ParamMap) => { this.club = this.databaseService.getClub(+params.get('id'));});
  }
}
