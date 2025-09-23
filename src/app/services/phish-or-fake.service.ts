import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, CollectionReference, DocumentData, Firestore, serverTimestamp, doc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Email {
  id?: string;
  subject: string;
  sender: string;
  content: string;
  is_phishing: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PhishOrFakeService {
  private firestore = inject(Firestore);
  private emailsRef: CollectionReference<DocumentData>;

  emailsCollection: string = 'MG003_emails';

  constructor() { 
    this.emailsRef = collection(this.firestore, this.emailsCollection);
  }

  getEmails(): Observable<Email[]> {
    return collectionData(this.emailsRef, { idField: 'id' }) as Observable<Email[]>;
  }

  async createEmail(payload: Email) {
    return await addDoc(this.emailsRef, {
      ...payload,
      createdAt: serverTimestamp()
    });
  }

  async updateEmail(id: string, payload: Partial<Email>) {
    const messageRef = doc(this.firestore, this.emailsCollection, id);
    return await updateDoc(messageRef, {
      ...payload,
      updatedAt: serverTimestamp()
    })
  }
}
