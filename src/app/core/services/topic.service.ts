import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Topic } from '../models/topic.model';

@Injectable({ providedIn: 'root' })
export class TopicService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getBySubject(subjectId: number): Observable<Topic[]> {
    return this.http.get<Topic[]>(`${this.api}/subjects/${subjectId}/topics`).pipe(
      catchError(err => {
        console.error('getBySubject error', err);
        return of([]); // <- NO rompe la UI
      })
    );
  }

  create(payload: Partial<Topic>) {
    return this.http.post(`${this.api}/topics`, payload);
  }

  update(id: number, payload: Partial<Topic>) {
    return this.http.put(`${this.api}/topics/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete(`${this.api}/topics/${id}`);
  }
}
