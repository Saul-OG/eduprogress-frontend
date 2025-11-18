import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, catchError, of } from 'rxjs';

import { Router } from '@angular/router';
import { environment } from '@env/environment';

import { User, LoginRequest, LoginResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  /** Obtiene el usuario actual */
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
me(): Observable<User | null> {
  return this.http.get<User>(`${this.apiUrl}/me`).pipe(
    tap((user) => {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
    }),
    catchError(() => of(null))
  );
}

/** Restaura sesión al iniciar la app si hay token */
restoreSession(): Observable<boolean> {
  const token = localStorage.getItem('access_token');
  if (!token) return of(false);
  return this.me().pipe(map((user) => !!user), catchError(() => of(false)));
}
  /** Devuelve el token actual */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /** Verifica si hay sesión activa */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /** Verifica si el usuario es administrador */
  isAdmin(): boolean {
    const user = this.currentUserValue;
    return user ? (user.role === 'admin' || user.is_admin === true) : false;
  }


  /** Verifica si el usuario es estudiante */
  isStudent(): boolean {
    return this.currentUserValue?.role === 'student';
  }

  /** Registro de usuario */
  register(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, data);
  }

  /** Inicio de sesión */
login(credentials: LoginRequest): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
    tap(response => {
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      this.currentUserSubject.next(response.user);
    })
  );
}
updateUser(user: Partial<User>) {
  const current = this.currentUserValue;
  if (current) {
    const updated = { ...current, ...user };
    localStorage.setItem('currentUser', JSON.stringify(updated));
    this.currentUserSubject.next(updated);
  }
}

  /** Cierre de sesión */
  logout(): void {
    // Intenta revocar el token en backend; si falla, igualmente limpia local
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => {},
      error: () => {},
      complete: () => {
        localStorage.clear();
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
      }
    });
  }

  /** Solicitud de recuperación de contraseña */
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  /** Restablecer contraseña (con token) */
  resetPassword(data: { email: string; token: string; password: string; password_confirmation: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }
}
