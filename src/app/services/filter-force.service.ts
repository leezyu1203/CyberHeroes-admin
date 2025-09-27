import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { addDoc, collection, collectionData, CollectionReference, DocumentData, Firestore, serverTimestamp, updateDoc, doc } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
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
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private functions = inject(Functions);
  private messagesRef: CollectionReference<DocumentData>;

  messagesCollection = 'MG001_messages'

  constructor() { 
    this.messagesRef = collection(this.firestore, this.messagesCollection);
  }

  getMessages(): Observable<Message[]> {
    return collectionData(this.messagesRef, { idField: 'id' }) as Observable<Message[]>;
  }

  async createMessage(payload: Message) {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Unauthorized: User must be logged in.');
    }

    return await addDoc(this.messagesRef, {
      ...payload,
      createdAt: serverTimestamp(),
      createdBy: user.uid,
    });
  }

  async updateMessage(id: string, payload: Partial<Message>) {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Unauthorized: User must be logged in.');
    }

    const messageRef = doc(this.firestore, this.messagesCollection, id);
    return await updateDoc(messageRef, {
      ...payload,
      updatedAt: serverTimestamp(),
      updatedBy: user.uid,
    });
  }

  async deleteMessage(id: string) {
    console.log(id);
    const deleteFn = httpsCallable(this.functions, 'deleteFilterForceMessage');
    return deleteFn({docId: id});
  }
}
