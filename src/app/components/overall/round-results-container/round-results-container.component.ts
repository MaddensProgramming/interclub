import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { DataBaseService } from '../../../services/database.service';
import { ACTIVE_SEASON, defaultRound } from 'functions/src/season';
import {
  MatButtonToggleGroup,
  MatButtonToggle,
} from '@angular/material/button-toggle';
import { FullRoundOverviewComponent } from '../full-round-overview/full-round-overview.component';
@Component({
  selector: 'app-round-results-container',
  templateUrl: './round-results-container.component.html',
  styleUrls: ['./round-results-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatButtonToggleGroup, MatButtonToggle, FullRoundOverviewComponent],
})
export class RoundResultsContainerComponent implements OnInit {
  public roundNumberSubject: BehaviorSubject<number> =
    new BehaviorSubject<number>(null);
  public roundNumber: number;
  public showDivisionSixNote = false;
  private destroyRef = inject(DestroyRef);

  public roundsArray = Array.from({ length: 11 }, (_, i) => i + 1);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private database: DataBaseService,
  ) {}

  onRoundChange(event: any): void {
    this.router.navigate(['/round', event.value]);
  }

  ngOnInit(): void {
    combineLatest([this.route.params, this.database.year$])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([params, year]) => {
        const requested = +params['id'];
        this.roundNumber = this.roundsArray.includes(requested) ? requested : defaultRound(year);
        this.showDivisionSixNote = year === ACTIVE_SEASON;
        this.roundNumberSubject.next(this.roundNumber);
      });
  }
}
