import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, startWith, tap } from 'rxjs';
import { ClassOverview } from 'src/app/models/division';
import { DataBaseService } from 'src/app/services/database.service';
import { TeamServiceService } from 'src/app/services/team-service.service';

@Component({
  selector: 'app-division-overview',
  templateUrl: './division-overview.component.html',
  styleUrls: ['./division-overview.component.scss'],
})
export class DivisionOverviewComponent implements OnInit {
  form: FormGroup;
  classoverview$: Observable<ClassOverview>;
  classoverview: ClassOverview;

  classes: number[] = [1, 2, 3, 4, 5];
  divisions: string[];

  constructor(
    private db: DataBaseService,
    private teamService: TeamServiceService
  ) {}

  ngOnInit(): void {
    this.form = this.teamService.formSelectedClass;

    this.classoverview$ = this.db.getClassOverview().pipe(
      tap((data) => (this.classoverview = data)),
      tap(() => this.form.get('class').setValue(this.form.get('class').value))
    );

    this.form.get('class').valueChanges.subscribe((value) => {
      this.divisions = this.classoverview.classes.find(
        (c) => c.class === +value
      ).divisions;
      if (
        !this.divisions.some((val) => this.form.get('division').value === val)
      )
        this.form.get('division').setValue('A');
    });
  }
}