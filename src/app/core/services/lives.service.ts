import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class LivesService {
  private apiUrl = `${environment.apiUrl}`;
  private livesSubject = new BehaviorSubject<number>(3);

  /** 🔁 Observable al que otros componentes pueden suscribirse */
  public lives$ = this.livesSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * 📡 Obtiene las vidas actuales desde el backend
   * y actualiza el estado local (BehaviorSubject)
   */
  getLives(): Observable<{ lives: number }> {
    return this.http.get<{ lives: number }>(`${this.apiUrl}/lives`).pipe(
      tap(response => this.livesSubject.next(response.lives))
    );
  }
  
updateLives(lives: number): void {
  this.livesSubject.next(lives);
}

  /**
   * 💾 Actualiza las vidas localmente (sin llamar al backend)
   * Ideal cuando el backend ya devuelve el valor actualizado (p.ej. al responder ejercicios)
   */
  setLives(lives: number): void {
    this.livesSubject.next(lives);
  }

  /**
   * 🧠 Devuelve las vidas actuales (sincrónicamente)
   */
  get currentLives(): number {
    return this.livesSubject.value;
  }
}
