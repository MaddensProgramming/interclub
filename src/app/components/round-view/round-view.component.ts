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

  displayedColumnsRound: string[] = ['board', 'white', 'black', 'result'];
  constructor() {}

  ngOnInit(): void {}


}
