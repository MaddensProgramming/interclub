import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, skip, tap } from 'rxjs';
import { DataBaseService } from 'src/app/services/database.service';
import { Location, AsyncPipe } from '@angular/common';
import { ClassOverview } from 'functions/src/models/ClassOverview';
import {
  MatButtonToggleGroup,
  MatButtonToggle,
} from '@angular/material/button-toggle';
import { DivisionStandingsComponent } from '../division-standings/division-standings.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

export type DivisionForm = FormGroup<{
  class: FormControl<string>;
  division: FormControl<string>;
}>;

@Component({
  selector: 'app-division-overview',
  templateUrl: './division-overview.component.html',
  styleUrls: ['./division-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    ReactiveFormsModule,
    MatButtonToggleGroup,
    MatButtonToggle,
    DivisionStandingsComponent,
    MatProgressSpinner,
    AsyncPipe,
  ],
})
export class DivisionOverviewComponent implements OnInit {
  form: DivisionForm;
  classoverview$: Observable<ClassOverview>;
  classoverview: ClassOverview;

  classes: number[] = [1, 2, 3, 4, 5];
  divisions: string[];
  private destroyRef = inject(DestroyRef);

  constructor(
    private db: DataBaseService,
    private route: ActivatedRoute,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.form = this.createForm(this.route.snapshot.paramMap);

    this.route.paramMap
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((params: ParamMap) => {
        this.form.setValue({
          class: params.get('id') ?? '1',
          division: params.get('class') ?? 'A',
        });
      });

    this.classoverview$ = this.db.getClassOverview().pipe(
      tap((data) => (this.classoverview = data)),
      tap(() =>
        this.form.controls.class.setValue(this.form.controls.class.value),
      ),
    );

    this.form.controls.class.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.divisions =
          this.classoverview?.classes.find((c) => c.class === +value)
            ?.divisions ?? [];
        if (
          !this.divisions.some(
            (val) => this.form.controls.division.value === val,
          )
        )
          this.form.controls.division.setValue('A');
      });
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) =>
        this.location.replaceState(
          '/division/' + value.class + '/' + value.division,
        ),
      );
  }

  private createForm(params: ParamMap): DivisionForm {
    return new FormGroup({
      class: new FormControl(params.get('id') ?? '1', {
        nonNullable: true,
      }),
      division: new FormControl(params.get('class') ?? 'A', {
        nonNullable: true,
      }),
    });
  }
}
