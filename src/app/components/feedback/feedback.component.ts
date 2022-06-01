import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DataBaseService } from 'src/app/services/database.service';


@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {

  form: FormGroup;
  constructor(private formbuilder: FormBuilder, private toaster: ToastrService, private db: DataBaseService) { }

  ngOnInit(): void {

    this.form = this.formbuilder.group({
      name: [''],
      email:[''],
      message:[''],
    })
  }

  submit(): void {
    if(this.form.get("message").value===""){
      this.toaster.warning("Uw bericht is leeg","Leeg bericht")
      return };
    this.db.sendMessage(this.form.value)
    .then(()=> {this.toaster.success( "Bedankt voor uw feedback!","Bericht verzonden!");
    this.form = this.formbuilder.group({
      name: [''],
      email:[''],
      message:[''],
    }) })
    .catch(() => this.toaster.error("Sorry er is iets misgelopen", "Error") );
  }
}
