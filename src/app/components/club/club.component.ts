import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Club } from 'src/app/models/club';
import { Player } from 'src/app/models/player';
import { DataBaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-club',
  templateUrl: './club.component.html',
  styleUrls: ['./club.component.scss']
})
export class ClubComponent implements OnInit {

  public club: Club;

  constructor(private route: ActivatedRoute, private databaseService: DataBaseService, private router: Router) { }

  ngOnInit(): void {
   this.route.paramMap.subscribe((params:ParamMap) => { this.club = this.databaseService.getClub(+params.get('id'));});
  }

  showPlayer(id: number) {
    this. router.navigate([`player/${id}`]);
  }
}
