import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, CollectionReference, DocumentData, Firestore, serverTimestamp, updateDoc, doc } from '@angular/fire/firestore';
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

  messagesCollection = 'MG001_messages'

  constructor() { 
    this.messagesRef = collection(this.firestore, this.messagesCollection);
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

  async updateMessage(id: string, payload: Partial<Message>) {
    const messageRef = doc(this.firestore, this.messagesCollection, id);
    return await updateDoc(messageRef, {
      ...payload,
      updatedAt: serverTimestamp()
    });
  }
}
