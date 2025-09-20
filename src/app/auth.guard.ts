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

  if (user) {
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
