import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Player } from 'src/app/models/player';
import { DataBaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  player : Player;

  constructor(private route: ActivatedRoute, private databaseService:DataBaseService ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params:ParamMap) => { this.player = this.databaseService.getPlayer(+params.get('id'));});
  }

}
