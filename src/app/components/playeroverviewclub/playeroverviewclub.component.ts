import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { map, Observable, switchMap } from 'rxjs';
import { Player } from 'src/app/models/player';
import { DataBaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-playeroverviewclub',
  templateUrl: './playeroverviewclub.component.html',
  styleUrls: ['./playeroverviewclub.component.scss']
})
export class PlayeroverviewclubComponent implements OnInit {
public players$: Observable<Player[]>;

  constructor(private route: ActivatedRoute,private db: DataBaseService) { }

  ngOnInit(): void {
    this.players$ = this.route.parent.paramMap.pipe(
      switchMap((params: ParamMap) => {
        return this.db.getClub(+params.get('id'));
      })
      ,map(club => club.players)
      )
  }

}
