import { Injectable } from '@angular/core';
import { Unsubscribe } from '@firebase/util';
import { initializeApp } from 'firebase/app';
import {
  setDoc,
  doc,
  collection,
  getFirestore,
  Firestore,
  orderBy,
  query,
  onSnapshot,
  endAt,
  limit,
  where,
} from 'firebase/firestore';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Message } from '../models/message';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  public store: Firestore;

  private unsub: Unsubscribe;
  private messages: BehaviorSubject<Message[]> = new BehaviorSubject([]);
  public messages$: Observable<Message[]>;

  constructor() {
    initializeApp(environment.firebase);
    this.store = getFirestore();
  }

  public sendMessage(message: Message): Promise<void> {
    return setDoc(doc(collection(this.store, 'messages')), message);
  }

  public startListening(): void {
    const q = query(
      collection(this.store, 'messages'),
      where('showOthers', '==', true),
      orderBy('dateSent', 'desc'),
      limit(10)
    );
    this.unsub = onSnapshot(q, (querySnapshot) => {
      const messages: Message[] = [];
      querySnapshot.forEach((doc) =>
        messages.push({
          ...doc.data(),
          dateSent: new Date(doc.data()['dateSent'].seconds * 1000),
        } as Message)
      );
      this.messages.next(messages);
    });
    this.messages$ = this.messages.asObservable();
  }

  public stopListening(): void {
    this.unsub();
  }
}
