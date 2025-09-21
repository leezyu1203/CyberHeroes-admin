import { inject, Injectable } from '@angular/core';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, docData} from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

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
}
