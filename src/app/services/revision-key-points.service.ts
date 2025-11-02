import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { addDoc, collection, collectionData, CollectionReference, doc, DocumentData, Firestore, serverTimestamp, updateDoc } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Observable } from 'rxjs';

export interface KeyPoint {
  id?: string;
  topic: string;
  tips: Array<string>;
}

@Injectable({
  providedIn: 'root'
})
export class RevisionKeyPointsService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private functions = inject(Functions);
  private revisionKeyPointsRef: CollectionReference<DocumentData>;

  revisionKeyPointsCollection = 'revision_key_points'

  constructor() {
    this.revisionKeyPointsRef = collection(this.firestore, this.revisionKeyPointsCollection);
  }

  getKeyPoints(): Observable<KeyPoint[]> {
    return collectionData(this.revisionKeyPointsRef, { idField: 'id' }) as Observable<KeyPoint[]>;
  }

  async createKeyPoint(payload: KeyPoint) {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Unauthorized: User must be logged in.');
    }

    return await addDoc(this.revisionKeyPointsRef, {
      ...payload,
      created_at: serverTimestamp(),
      created_by: user.uid,
    });
  }

  async updateKeyPoint(id: string, payload: Partial<KeyPoint>) {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Unauthorized: User must be logged in.');
    }

    const keyPointRef = doc(this.firestore, this.revisionKeyPointsCollection, id);
    return await updateDoc(keyPointRef, {
      ...payload,
      updated_at: serverTimestamp(),
      updated_by: user.uid,
    })
  }

  async deleteKeyPoint(id: string) {
    const deleteFn = httpsCallable(this.functions, 'deleteRevisionKeyPoint');
    return deleteFn({ docId: id });
  }
}
