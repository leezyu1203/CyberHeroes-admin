import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, CollectionReference, DocumentData, Firestore, serverTimestamp } from '@angular/fire/firestore';
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
  private messagesRef: CollectionReference<DocumentData>;

  constructor() { 
    this.messagesRef = collection(this.firestore, 'MG001_messages');
  }

  getMessages(): Observable<Message[]> {
    return collectionData(this.messagesRef, { idField: 'id' }) as Observable<Message[]>;
  }

  async createMessage(payload: Message) {
    return await addDoc(this.messagesRef, {
      ...payload,
      createdAt: serverTimestamp()
    });
  }
}
