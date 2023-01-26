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
  constructor() {}
}
