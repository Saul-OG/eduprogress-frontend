import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  /** Estadísticas generales */
  getGeneralStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/general`)
      .pipe(catchError(() => of({ success: true, data: {} })));
  }

  /** Promedios por materia */
  getSubjectsReport(): Observable<any> {
    return this.http.get(`${this.apiUrl}/subjects`)
      .pipe(catchError(() => of({ success: true, data: [] })));
  }

  /** Vidas promedio */
  getLivesStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/lives`)
      .pipe(catchError(() => of({ success: true, data: {} })));
  }

  /** Nuevos usuarios por mes */
  getNewUsersPerMonth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/new-users`)
      .pipe(catchError(() => of({ success: true, data: { labels: [], values: [] } })));
  }

  /** Materias más vistas */
  getMostViewed(): Observable<any> {
    return this.http.get(`${this.apiUrl}/most-viewed`)
      .pipe(catchError(() => of({ success: true, data: { labels: [], values: [] } })));
  }
}
