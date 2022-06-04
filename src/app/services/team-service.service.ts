import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TeamServiceService {
  public selectedTeamTab: BehaviorSubject<string> = new BehaviorSubject(
    'players'
  );
  public formSelectedClass: FormGroup = new FormGroup({
    class: new FormControl('1'),
    division: new FormControl('A'),
  });

  constructor() {}
}
