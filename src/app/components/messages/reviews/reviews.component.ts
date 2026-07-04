import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Observable } from 'rxjs';
import { Message } from 'src/app/models/message';
import { ReviewService } from 'src/app/services/review.service';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import {
  MatCard,
  MatCardTitle,
  MatCardSubtitle,
  MatCardContent,
} from '@angular/material/card';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatButton,
    RouterLink,
    MatCard,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatProgressSpinner,
    AsyncPipe,
  ],
})
export class ReviewsComponent implements OnInit, OnDestroy {
  public messages$: Observable<Message[]>;

  constructor(private db: ReviewService) {}
  ngOnDestroy(): void {
    this.db.stopListening();
  }

  ngOnInit(): void {
    this.db.startListening();
    this.messages$ = this.db.messages$;
  }
}
