import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DataBaseService } from 'src/app/services/database.service';
import { ReviewService } from 'src/app/services/review.service';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
})
export class FeedbackComponent implements OnInit {
  form: FormGroup;
  ip: string;
  constructor(
    private formbuilder: FormBuilder,
    private toaster: ToastrService,
    private db: ReviewService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.http
      .get('https://api.ipify.org/?format=json')
      .subscribe((res: any) => {
        this.ip = res.ip;
      });

    this.form = this.formbuilder.group({
      name: [''],
      email: [''],
      message: [''],
    });
  }

  submit(): void {
    if (this.form.get('message').value === '') {
      this.toaster.warning('Uw bericht is leeg', 'Leeg bericht');
      return;
    }
    this.db
      .sendMessage({ ...this.form.value, dateSent: new Date(), ip: this.ip })
      .then(() => {
        this.toaster.success('Bedankt voor uw feedback!', 'Bericht verzonden!');
        this.form = this.formbuilder.group({
          name: [''],
          email: [''],
          message: [''],
        });
      })
      .catch(() => this.toaster.error('Sorry er is iets misgelopen', 'Error'));
  }
}
