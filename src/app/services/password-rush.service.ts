import { inject, Injectable } from '@angular/core';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Rule {
  id?: string;
  description: string;
  is_required?: boolean;
  type: string;
  can_update: boolean;
  addon: string;
  range?: {
    words?: string[];
    word_number?: number;
    min?: number;
    max?: number;
  }
}

@Injectable({
  providedIn: 'root'
})
export class PasswordRushService {
  private firestore = inject(Firestore);

  constructor() { }

  getRules(): Observable<Rule[]> {
    const rulesRef = collection(this.firestore, 'MG002_rules');
    return collectionData(rulesRef, { idField: 'id' }) as Observable<Rule[]>;
  }
}
