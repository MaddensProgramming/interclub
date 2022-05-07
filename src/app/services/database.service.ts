import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { addDoc, collection, doc, Firestore, getDoc, getDocs, getDocsFromServer, getFirestore, setDoc } from 'firebase/firestore';
import { BehaviorSubject, from, map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Club, ClubOverview, ProvinceOverview } from '../models/club';
import { Player } from '../models/player';
import clubs from 'src/assets/games.json'

@Injectable({
    providedIn: 'root',
})
export class DataBaseService {


  public store:Firestore;
  public dataLoaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private clubs: Club[];
  private players: Player[];

  constructor(){
    initializeApp(environment.firebase);
    this.store =getFirestore();
   }

  getClubs(): Club[] {
    return this.clubs;
  }
  getClub(id: number): Club {
    return this.clubs.find(club => club.id === id);
  }

  getPlayer(id: number,): Player {
    return this.players.find(player => player.id === id);
  }

  sendData() : void {
    this.generateClubDocs();
  }

  public getOverview(): Observable<ClubOverview> {
    return  from(getDoc(doc(this.store,"clubOverview","overview"))).pipe(map(data => data.data() as ClubOverview));
  }

  private getAllFromServer(): void {
    const db = collection(this.store,'clubs');
    getDocs(db).then((res)=> {
      const clubs = res.docs.map(item => item.data());
      this.clubs = clubs as Club[];
      this.players = this.clubs.reduce((acc:Player[], val:Club) => acc.concat(val.players), []);
      this.dataLoaded.next(true);
    });

  }

  private getDataFromJson() : void {
    this.clubs = clubs
    this.clubs = this.clubs.filter(club => club.id !==0);
    this.clubs.sort((club,club2) => club.id - club2.id);

    this.players = this.clubs.reduce((acc:Player[], val:Club) => acc.concat(val.players), []);
    this.dataLoaded.next(true);

  }

private generateClubDocs() : void {

  const db = collection(this.store,'clubs');

  this.clubs.forEach(club =>
    setDoc(doc(db,club.id.toString()),club)
    .then( ()=> console.log(club.name))
    .catch((err)=> console.error(err.message))
    );
}

private setOverview(): void {

  const db = collection(this.store,'clubOverview');

  setDoc(doc(db,"overview"),this.generateOverview())
  .then( ()=> console.log("succes"))
  .catch((err)=> console.error(err.message));


}

private generateOverview(): ClubOverview {
  const overview: ClubOverview = {provinces: []};

  this.clubs.forEach(club => this.addToProvince(club,overview));
  return overview;
}

private addToProvince(club: Club,overview: ClubOverview ): void{
  const provinceId= Math.floor(club.id/100);
  const province:ProvinceOverview =  overview.provinces.find(prov => prov.id === provinceId);
  if(!province)
    overview.provinces.push({id:provinceId, clubs:[{id: club.id ,name: club.name}]});
  else
   province.clubs.push({id: club.id ,name: club.name})
}
}
