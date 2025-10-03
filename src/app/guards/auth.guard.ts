import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';
import { onAuthStateChanged } from 'firebase/auth';

export const authGuard: CanActivateFn = async() => {
  const auth = inject(Auth);
  const router = inject(Router);
  
  const user = await new Promise(resolve =>
    onAuthStateChanged(auth, (u) => resolve(u))
  );

  const token = await auth.currentUser?.getIdTokenResult();
  if (user) {
    if (!!token?.claims['is_first_login']) {
      router.navigate(['/first-time-login']);
      return false;
    }
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};

export const noAuthGuard: CanActivateFn = async() => {
  const auth = inject(Auth);
  const router = inject(Router);
  
  const user = await new Promise(resolve =>
    onAuthStateChanged(auth, (u) => resolve(u))
  );

  if (user) {
    router.navigate(['/']);
    return false;
  } else {
    return true;
  }
}

export const firstTimeLoginGuard: CanActivateFn = async() => {
  const auth = inject(Auth);
  const router = inject(Router);

  const token = await auth.currentUser?.getIdTokenResult();
  // console.log(token?.claims['is_first_login']);
  if (!!token?.claims['is_first_login']) {
    return true;
  } else {
    router.navigate(['/']);
    return false;
  }
}
