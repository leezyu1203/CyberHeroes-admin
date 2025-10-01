import { inject, Injectable } from '@angular/core';
import { Auth, onAuthStateChanged, signOut, User } from '@angular/fire/auth';
import { Firestore, doc, docData} from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { BehaviorSubject, from, map, Observable } from 'rxjs';

export interface Admin {
  uid?: string;
  disabled: boolean;
  failed_attempts: number;
  is_superadmin: boolean;
  username: string;
  email: string;
  is_first_login: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private functions = inject(Functions);

  private userSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.userSubject.asObservable();

  constructor() { 
    onAuthStateChanged(this.auth, (user: User | null) => {
      if (user) {
        const userDocRef = doc(this.firestore, 'admins', user.uid);
        docData(userDocRef, { idField: 'uid' }).subscribe(profile => {
          this.userSubject.next({
            ...user,
            ...profile
          });
        });
      } else {
        this.userSubject.next(null); 
      }
    });
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  async setSuperAdminClaim() {
    const setClaim = httpsCallable(this.functions, 'setSuperAdminClaim');
    await setClaim({});
  }

  getAdminList(): Observable<Admin[]> {
    const readFn = httpsCallable(this.functions, 'getAdminList');
    return from(readFn()).pipe(
      map((res: any) => res.data.admins as Admin[])
    )
  }

  createAdmin(payload: Admin, password: string) {
    const createFn = httpsCallable(this.functions, 'createAdmin');
    const req = {
      password: password,
      payload: payload,
    }
    return from(createFn(req));
  }
}
