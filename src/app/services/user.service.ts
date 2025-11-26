import { inject, Injectable } from '@angular/core';
import { Auth, onAuthStateChanged, sendEmailVerification, signOut, User, reload, sendPasswordResetEmail, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, docData} from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Router } from '@angular/router';
import { browserLocalPersistence, setPersistence } from 'firebase/auth';
import { BehaviorSubject, firstValueFrom, from, map, Observable, Subscription, switchMap, throwError } from 'rxjs';

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
  private router = inject(Router);

  private userSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.userSubject.asObservable();

  private profileSub?: Subscription;

  constructor() { 
    // setPersistence(this.auth, browserLocalPersistence)
    // .then(() => {
    //   console.log('Firebase Auth persistence set to LOCAL');
    // })
    // .catch(err => {
    //   console.error('Error setting persistence: ', err);
    // })

    onAuthStateChanged(this.auth, (user: User | null) => {
      if (this.profileSub) {
        this.profileSub.unsubscribe();
        this.profileSub = undefined;
      }

      if (user) {
        const userDocRef = doc(this.firestore, 'admins', user.uid);
        this.profileSub = docData(userDocRef, { idField: 'uid' }).subscribe(profile => {
          this.userSubject.next({
            firebaseUser: user,
            ...profile
          });
        });
      } else {
        this.userSubject.next(null); 
      }
    });
  }

  async login(email: string, password: string): Promise<void> {
    const credential = await signInWithEmailAndPassword(this.auth, email, password);
    const user = credential.user;

    if (user) {
      this.setCustomClaims();
      await user.getIdToken(true);
      this.router.navigate(['/verify-email']);
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.userSubject.next(null);
  }

  async setCustomClaims() {
    const setClaim = httpsCallable(this.functions, 'setCustomClaims');
    await setClaim({});
  }

  async sendEmailVerification(): Promise<void> {
    const user = this.userSubject.getValue();
    if (!user?.firebaseUser) throw new Error('No user found');
    await sendEmailVerification(user.firebaseUser);
  }

  async sendResetPasswordEmail(email: string): Promise<void> {
    try {
      const res: any = await firstValueFrom(this.checkAdminEmailExists(email));
      const is_existed = res.data.exists;
      if (!is_existed) {
        throw new Error('The email not found.');
      }
      await sendPasswordResetEmail(this.auth, email);
    } catch (err: any) {
      throw err;
    }
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

  deleteAdmin(targetUid: string) {
    const deleteFn = httpsCallable(this.functions, 'deleteAdmin');
    return from(deleteFn({targetUid}));
  }

  updatePassword(password: string) {
    const currentUser = this.auth.currentUser
    if (!currentUser) {
      return throwError(() => new Error('User not logged in.'))
    }
    return from(reload(currentUser)).pipe(
      switchMap(() => {
        if (!currentUser.emailVerified) {
          return throwError(() => new Error('Please verify your email before changing password.'))
        }
        const updateFn = httpsCallable(this.functions, 'updatePassword');
        return from(updateFn({password}));
      })
    )
  }

  checkAdminEmailExists(email: string) {
    const checkFn = httpsCallable(this.functions, 'checkAdminEmailExists');
    return from(checkFn({ email }));
  }
}
