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
  @Input() public showTpr: boolean;
  @Input() public showId: boolean;

  displayedColumnsPlayer: string[] = [ 'name', 'rating', 'score'];

  constructor(private router: Router) {

  }

  ngOnInit(): void {
    if(this.showTpr)
    this.displayedColumnsPlayer.push('tpr');
    if(this.showId)
    this.displayedColumnsPlayer.unshift('id');
  }

  showPlayer(id: number) {
    this.router.navigate([`player/${id}`]);
  }
}
