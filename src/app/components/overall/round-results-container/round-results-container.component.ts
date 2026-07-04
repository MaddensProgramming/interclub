import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
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
  private destroyRef = inject(DestroyRef);

  public roundsArray = Array.from({ length: 11 }, (_, i) => i + 1);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  onRoundChange(event: any): void {
    this.router.navigate(['/round', event.value]);
  }

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.roundNumber = +params['id'];
        if (this.roundNumber) {
          this.roundNumberSubject.next(+params['id']);
        } else {
          this.roundNumberSubject.next(11);
        }
      });
  }
}
