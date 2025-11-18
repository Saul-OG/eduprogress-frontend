import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class LivesService {
  private apiUrl = `${environment.apiUrl}`;
  private livesSubject = new BehaviorSubject<number>(3);

  public lives$ = this.livesSubject.asObservable();

  constructor(private http: HttpClient) {}

  getLives(): Observable<{ lives: number; lives_max?: number; next_life_at?: string }> {
    return this.http.get<{ lives: number; lives_max?: number; next_life_at?: string }>(`${this.apiUrl}/lives`).pipe(
      tap(response => this.livesSubject.next(response.lives))
    );
  }

  resetLives(): Observable<{ lives: number; lives_max?: number; next_life_at?: string }> {
    return this.http.post<{ lives: number; lives_max?: number; next_life_at?: string }>(`${this.apiUrl}/lives/reset`, {}).pipe(
      tap(response => this.livesSubject.next(response.lives))
    );
  }

  setLives(lives: number): void {
    this.livesSubject.next(lives);
  }

  get currentLives(): number {
    return this.livesSubject.value;
  }
}
