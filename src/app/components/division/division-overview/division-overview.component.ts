import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap} from '@angular/router';
import { Observable,  tap } from 'rxjs';
import { ClassOverview } from 'src/app/models/division';
import { DataBaseService } from 'src/app/services/database.service';
import { Location } from '@angular/common';


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
    private route: ActivatedRoute,
    private location: Location,
      ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(
      (params: ParamMap) => {
       this.form = new FormGroup({
      class: new FormControl(params.get('id')),
      division: new FormControl(params.get('class')),
    });
  });


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
    this.form.valueChanges.subscribe((value) => this.location.replaceState('/division/'+value.class+'/'+ value.division))

  }
}
