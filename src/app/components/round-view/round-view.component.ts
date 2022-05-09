import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Round } from 'src/app/models/club';

@Component({
  selector: 'app-round-view',
  templateUrl: './round-view.component.html',
  styleUrls: ['./round-view.component.scss'],
})
export class RoundViewComponent implements OnInit {
  @Input() round: Round;
  @Input() clubId: number;

  displayedColumnsRound: string[] = ['board', 'white', 'black', 'result'];
  constructor(private router: Router) {}

  ngOnInit(): void {}

  showPlayer(id: number) {
    this.router.navigate([`player/${id}`]);
  }
}
