import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { AppChart, ChartRequest } from '../models/chart.model';

@Injectable({ providedIn: 'root' })
export class ChartService {
  private apiUrl = `${environment.apiUrl}/charts`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<AppChart[]> {
    return this.http.get<AppChart[]>(this.apiUrl);
  }

  create(chart: ChartRequest): Observable<AppChart> {
    return this.http.post<AppChart>(this.apiUrl, chart);
  }

  update(id: number, chart: Partial<AppChart>): Observable<AppChart> {
    return this.http.put<AppChart>(`${this.apiUrl}/${id}`, chart);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
