  // src/app/core/guards/auth.guard.ts
  import { CanActivateFn, Router } from '@angular/router';
  import { inject } from '@angular/core';
  import { AuthService } from '../services/auth.service';
  import { of } from 'rxjs';
  import { catchError, map,  } from 'rxjs/operators';

  export const authGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    // Si ya hay sesión en memoria, pasa
    if (auth.isAuthenticated()) return true;

    // Si no, intenta rehidratar con /me y decide
    return auth.me().pipe(
      map(() => {
        if (auth.isAuthenticated()) return true;
        router.navigate(['/login']);
        return false;
      }),
      catchError(() => {
        router.navigate(['/login']);
        return of(false);
      })
    );
  };
