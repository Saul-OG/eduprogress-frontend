import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Exercise } from '../models/exercise.model'; // ✅ Import correcto

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getExercisesByTopic(topicId: number): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(`${this.apiUrl}/topics/${topicId}/exercises`);
  }

  submitAnswer(exerciseId: number, payload: { answer: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/exercises/${exerciseId}/submit`, payload);
  }
}
