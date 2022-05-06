import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

@Component({
  selector: 'app-clubs',
  templateUrl: './clubs.component.html',
  styleUrls: ['./clubs.component.scss']
})
export class ClubsComponent implements OnInit {

  public club: string|null ="";

  constructor(private route: ActivatedRoute
     ) { }

  ngOnInit(): void {
   this.route.paramMap.subscribe((params:ParamMap) => { this.club = params.get('id');});
  }
}
