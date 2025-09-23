import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, CollectionReference, DocumentData, Firestore, serverTimestamp } from '@angular/fire/firestore';
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

  constructor() { 
    this.emailsRef = collection(this.firestore, 'MG003_emails')
  }

  getEmails(): Observable<Email[]> {
    return collectionData(this.emailsRef, { idField: 'id' }) as Observable<Email[]>;
  }

  async createEmail(data: Email) {
    return await addDoc(this.emailsRef, {
      ...data,
      createdAt: serverTimestamp()
    });
  }
}
