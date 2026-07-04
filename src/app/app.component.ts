import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { DataBaseService } from './services/database.service';
import { MatToolbar } from '@angular/material/toolbar';
import { MatSelect, MatOption } from '@angular/material/select';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatToolbar, RouterLink, MatSelect, MatOption, RouterOutlet],
})
export class AppComponent implements OnInit {
  title = 'Interclub';
  year: string;
  private destroyRef = inject(DestroyRef);

  years: string[] = ['2020', '2019', '2018', '2017', '2016'];

  constructor(
    private databaseService: DataBaseService,
    private route: ActivatedRoute,
  ) {}
  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        if (!!data['year']) this.databaseService.changeYear(data['year']);
      });
    this.databaseService.year$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((year) => (this.year = year));
  }

  public changeYear(): void {
    this.databaseService.changeYear(this.year);
  }
}
