import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { addDoc, collection, collectionData, CollectionReference, DocumentData, Firestore, serverTimestamp, doc, updateDoc } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
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
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private functions = inject(Functions);
  private emailsRef: CollectionReference<DocumentData>;

  emailsCollection: string = 'MG003_emails';

  constructor() { 
    this.emailsRef = collection(this.firestore, this.emailsCollection);
  }

  getEmails(): Observable<Email[]> {
    return collectionData(this.emailsRef, { idField: 'id' }) as Observable<Email[]>;
  }

  async createEmail(payload: Email) {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Unauthorized: User must be logged in.');
    }

    return await addDoc(this.emailsRef, {
      ...payload,
      created_at: serverTimestamp(),
      created_by: user.uid,
    });
  }

  async updateEmail(id: string, payload: Partial<Email>) {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Unauthorized: User must be logged in.');
    }

    const messageRef = doc(this.firestore, this.emailsCollection, id);
    return await updateDoc(messageRef, {
      ...payload,
      updated_at: serverTimestamp(),
      updated_by: user.uid,
    })
  }

  async deleteEmail(id: string) {
    const deleteFn = httpsCallable(this.functions, 'deletePhishOrFakeEmail');
    return deleteFn({ docId: id });
  }
}
