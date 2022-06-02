import { Component, Input, OnInit } from '@angular/core';
import { Division } from 'src/app/models/division';

@Component({
  selector: 'app-division-standings',
  templateUrl: './division-standings.component.html',
  styleUrls: ['./division-standings.component.scss'],
})
export class DivisionStandingsComponent implements OnInit {
  @Input()
  division: Division;

  constructor() {}

  ngOnInit(): void {}
}
