import { inject, Injectable } from '@angular/core';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
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

  constructor() { }

  getEmails(): Observable<Email[]> {
    const emailsRef = collection(this.firestore, 'MG003_emails');
    return collectionData(emailsRef, { idField: 'id' }) as Observable<Email[]>;
  }
}
