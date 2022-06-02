import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-division-overview',
  templateUrl: './division-overview.component.html',
  styleUrls: ['./division-overview.component.scss'],
})
export class DivisionOverviewComponent implements OnInit {
  form: FormGroup = new FormGroup({
    class: new FormControl(1),
    division: new FormControl(''),
  });

  classes: number[] = [1, 2, 3, 4, 5];
  divisions: string[] = ['A'];

  constructor() {}

  ngOnInit(): void {
    this.form
      .get('class')
      .valueChanges.subscribe((value) => console.log(value));
  }
}
