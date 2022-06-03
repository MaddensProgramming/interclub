import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, startWith, switchMap } from 'rxjs';
import { Division, DivisionForm } from 'src/app/models/division';
import { DataBaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-division-standings',
  templateUrl: './division-standings.component.html',
  styleUrls: ['./division-standings.component.scss'],
})
export class DivisionStandingsComponent implements OnInit {
  @Input()
  form:FormGroup;

  division$: Observable<Division>;

  constructor(private db: DataBaseService) {}

  ngOnInit(): void {
   this.division$ =  this.form.valueChanges.pipe(startWith({class:'1',division:'A'}),switchMap(form=> this.db.getDivision(form.class+form.division)));
  }
}
