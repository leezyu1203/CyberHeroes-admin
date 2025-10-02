import { inject, Injectable } from '@angular/core';
import { collection, Firestore, getCountFromServer } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private firestore = inject(Firestore);

  constructor() { }

  async getDashboardCounts(): Promise<{messages: number, rules: number, emails: number}> {
    try {
      const messagesRef = collection(this.firestore, 'MG001_messages');
      const rulesRef = collection(this.firestore, 'MG002_rules');
      const emailsRef = collection(this.firestore, 'MG003_emails');

      const [messagesSnap, rulesSnap, emailsSnap] = await Promise.all([
        getCountFromServer(messagesRef),
        getCountFromServer(rulesRef),
        getCountFromServer(emailsRef),
      ]);

      return {
        messages: messagesSnap.data().count,
        rules: rulesSnap.data().count,
        emails: emailsSnap.data().count,
      };
    } catch (err) {
      console.error("Error fetching collection counts: ", err);
      throw err;
    }
  }
}
