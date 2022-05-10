import { Component, Input, OnInit } from '@angular/core';
import { Player } from '../../models/player';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent implements OnInit {
  @Input() public players: Player[];
  @Input() public showTpr: boolean;
  @Input() public showId: boolean;

  displayedColumnsPlayer: string[] = ['name', 'rating', 'score'];

  constructor() {}

  ngOnInit(): void {
    if (this.showTpr) this.displayedColumnsPlayer.push('tpr');
    if (this.showId) this.displayedColumnsPlayer.unshift('id');
  }
}
