import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Subject, Progress } from '../models/subject.model';
import { Topic } from '../models/topic.model';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private apiUrl = environment.apiUrl; // ejemplo: http://localhost:8000/api

  constructor(private http: HttpClient) {}

  /** Obtener todas las materias */
  getAll(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.apiUrl}/subjects`);
  }

  /** Obtener una materia con su progreso */
  getById(id: number): Observable<{ subject: Subject; progress?: Progress }> {
    return this.http.get<{ subject: Subject; progress?: Progress }>(
      `${this.apiUrl}/subjects/${id}`
    );
  }

  /** Obtener todos los temas de una materia */
  getTopicsBySubject(subjectId: number): Observable<Topic[]> {
    return this.http.get<Topic[]>(`${this.apiUrl}/subjects/${subjectId}/topics`);
  }

  /** Obtener progreso de usuario en todas las materias */
  getUserProgress(): Observable<{ data: Progress[] }> {
    return this.http.get<{ data: Progress[] }>(`${this.apiUrl}/subjects/user/progress`);
  }

  /** Crear una nueva materia */
  create(subject: Partial<Subject>): Observable<Subject> {
    return this.http.post<Subject>(`${this.apiUrl}/subjects`, subject);
  }

  /** Actualizar una materia existente */
  update(id: number, subject: Partial<Subject>): Observable<Subject> {
    return this.http.put<Subject>(`${this.apiUrl}/subjects/${id}`, subject);
  }

  /** Eliminar una materia */
  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/subjects/${id}`);
  }

  /** Obtener un solo tema por ID (para teoría o práctica) */
  getTopicById(topicId: number): Observable<Topic> {
    return this.http.get<Topic>(`${this.apiUrl}/topics/${topicId}`);
  }
}
