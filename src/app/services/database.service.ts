import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { collection, Firestore, getDocsFromServer, getFirestore } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Club } from '../models/club';

@Injectable({
    providedIn: 'root',
})
export class DataBaseService {


  public store:Firestore;
  public dataLoaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private clubs: Club[];

  constructor(){
    initializeApp(environment.firebase);
    this.store =getFirestore();
    this.getData();
   }

  getClubs(): Club[] {
    return this.clubs;
  }
  getClub(id: number): Club {
    return this.clubs.find(club => club.id === id);
  }
  getData(): void {
    const db = collection(this.store,'club');
    getDocsFromServer(db).then((res)=> {
      const clubs = res.docs.map(item => item.data());
      this.clubs = clubs as Club[];
      this.dataLoaded.next(true);
    });
  }
}
