import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
@Component({
  selector: 'app-round-results-container',
  templateUrl: './round-results-container.component.html',
  styleUrls: ['./round-results-container.component.scss'],
})
export class RoundResultsContainerComponent implements OnInit {
  public roundNumberSubject: BehaviorSubject<number> =
    new BehaviorSubject<number>(null);
  public roundNumber: number;

  public roundsArray = Array.from({ length: 12 }, (_, i) => i + 1);

  constructor(private route: ActivatedRoute, private router: Router) {}

  onRoundChange(event: any): void {
    this.router.navigate(['/round', event.value]);
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.roundNumber = +params['id'];
      this.roundNumberSubject.next(+params['id']);
    });
  }
}
