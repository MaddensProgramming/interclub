import { HttpClient } from '@angular/common/http';
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ReviewService } from 'src/app/services/review.service';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatFormField, MatLabel, MatInput } from '@angular/material/input';
import { MatCheckbox } from '@angular/material/checkbox';

type FeedbackForm = FormGroup<{
  name: FormControl<string>;
  email: FormControl<string>;
  message: FormControl<string>;
  showOthers: FormControl<boolean>;
}>;

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    ReactiveFormsModule,
    MatButton,
    RouterLink,
    MatFormField,
    MatLabel,
    MatInput,
    MatCheckbox,
  ],
})
export class FeedbackComponent implements OnInit {
  form: FeedbackForm;
  ip: string;
  private destroyRef = inject(DestroyRef);
  constructor(
    private formbuilder: NonNullableFormBuilder,
    private toaster: ToastrService,
    private db: ReviewService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.http
      .get('https://api.ipify.org/?format=json')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: any) => {
        this.ip = res.ip;
      });

    this.form = this.createForm();
  }

  private createForm(): FeedbackForm {
    return this.formbuilder.group({
      name: [''],
      email: [''],
      message: [''],
      showOthers: [true],
    });
  }

  submit(): void {
    if (this.form.controls.message.value === '') {
      this.toaster.warning('Uw bericht is leeg', 'Leeg bericht');
      return;
    }
    this.db
      .sendMessage({
        ...this.form.getRawValue(),
        dateSent: new Date(),
        ip: this.ip,
      })
      .then(() => {
        this.toaster.success('Bedankt voor uw feedback!', 'Bericht verzonden!');
        this.form = this.createForm();
      })
      .catch(() => this.toaster.error('Sorry er is iets misgelopen', 'Error'));
  }
}
