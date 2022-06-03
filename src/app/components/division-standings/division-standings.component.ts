import { Component, Input, OnInit } from '@angular/core';
import { DivisionForm } from 'src/app/models/division';

@Component({
  selector: 'app-division-standings',
  templateUrl: './division-standings.component.html',
  styleUrls: ['./division-standings.component.scss'],
})
export class DivisionStandingsComponent implements OnInit {
  @Input()
  division: DivisionForm;

  constructor() {}

  ngOnInit(): void {}
}
