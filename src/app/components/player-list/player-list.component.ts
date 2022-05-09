import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Player } from '../../models/player';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent implements OnInit {
  @Input() public players: Player[];

  displayedColumnsPlayer: string[] = ['id', 'name', 'rating', 'score', 'tpr'];

  constructor(private router: Router) {}

  ngOnInit(): void {}

  showPlayer(id: number) {
    this.router.navigate([`player/${id}`]);
  }
}
