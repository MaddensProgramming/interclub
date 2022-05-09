import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Round, TeamView } from 'src/app/models/club';

@Component({
  selector: 'app-team-view',
  templateUrl: './team-view.component.html',
  styleUrls: ['./team-view.component.scss'],
})
export class TeamViewComponent implements OnInit {
  @Input() team: TeamView;

  constructor() {}

  ngOnInit(): void {}
}
