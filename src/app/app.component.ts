import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataBaseService } from './services/database.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'Interclub';
  year: string;

  years: string[] = ['2020', '2019', '2018', '2017', '2016'];

  constructor(
    private databaseService: DataBaseService,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.route.queryParams.subscribe((data) => {
      if (!!data['year']) this.databaseService.changeYear(data['year']);
    });
    this.databaseService.year$.subscribe((year) => (this.year = year));
  }

  public changeYear(): void {
    this.databaseService.changeYear(this.year);
  }
}
