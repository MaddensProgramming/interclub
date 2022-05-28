import { Component, OnInit } from '@angular/core';
import { DataBaseService } from './services/database.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'Interclub';
  year: string = '2021';

  constructor(private databaseService: DataBaseService) {}
  ngOnInit(): void {
    this.changeYear();
  }

  public changeYear(): void {
    this.databaseService.changeYear(this.year);
  }
}
