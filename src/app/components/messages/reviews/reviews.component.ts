import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Message } from 'src/app/models/message';
import { ReviewService } from 'src/app/services/review.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss'],
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
