import { inject, Injectable } from '@angular/core';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Message {
  id?: string;
  message: string;
  is_danger: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FilterForceService {
  private firestore = inject(Firestore);

  constructor() { }

  getMessages(): Observable<Message[]> {
    const messagesRef = collection(this.firestore, 'MG001_messages');
    return collectionData(messagesRef, { idField: 'id' }) as Observable<Message[]>;
  }
}
