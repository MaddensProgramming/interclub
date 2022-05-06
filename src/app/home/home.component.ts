import { Component, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Form, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { addDoc, collection, doc } from 'firebase/firestore';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {


  public form: FormGroup = this.formbuilder.group({
    text :''
  });

  constructor(private router: Router, private store: Firestore, private formbuilder: FormBuilder) { }

  ngOnInit(): void {
  }

  navigateToClub(): void {
    this.router.navigate(["club/15"])
  }

  addToStore() : void{
    const db = collection(this.store,'club');
    console.log(this.form.value);

    addDoc(db,{message: this.form.value})
    .then( ()=> console.log("succes"))
    .catch((err)=> console.error(err.message));
  }

}
