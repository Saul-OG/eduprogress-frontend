// src/app/core/guards/admin.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import { catchError, map, } from 'rxjs/operators';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Si ya está en memoria y es admin, pasa
  if (auth.isAuthenticated() && auth.isAdmin()) return true;

  // Rehidrata primero y decide
  return auth.me().pipe(
    map(() => {
      if (auth.isAuthenticated() && auth.isAdmin()) return true;

      // tiene sesión pero no es admin → a /student
      if (auth.isAuthenticated()) {
        router.navigate(['/student']);
      } else {
        router.navigate(['/login']);
      }
      return false;
    }),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};

