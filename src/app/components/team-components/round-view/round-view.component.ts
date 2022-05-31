import { Component, Input, OnInit } from '@angular/core';
import { Round } from 'src/app/models/club';

@Component({
  selector: 'app-round-view',
  templateUrl: './round-view.component.html',
  styleUrls: ['./round-view.component.scss'],
})
export class RoundViewComponent implements OnInit {
  @Input() round: Round;
  @Input() clubId: number;

  averageEloHome: number;
  averageEloAway: number;

  displayedColumnsRound: string[] = ['board', 'white', 'black', 'result'];
  constructor() {}

  ngOnInit(): void {
    this.calculateAverages();
  }

  calculateAverages(): void {
    let totalHome: number = 0;
    let totalAway: number = 0;
    this.round.games.forEach((game) => {
      if (game.board % 2 === 1) {
        totalHome += game.white.rating;
        totalAway += game.black.rating;
      } else {
        totalHome += game.black.rating;
        totalAway += game.white.rating;
      }
    });
    this.averageEloHome = Math.round(totalHome / this.round.games.length);
    this.averageEloAway = Math.round(totalAway / this.round.games.length);
  }
}
