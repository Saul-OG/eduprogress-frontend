import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SubjectService } from '../../../core/services/subject.service';
import { Subject } from '../../../core/models/subject.model';
// IMPORTA tu servicio de autenticación:
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false
})
export class DashboardComponent implements OnInit {
  subjects: Subject[] = [];
  userProgress: any[] = [];
  userName: string = '';
  loading = true;
  lastSubjectId: number | null = null;

  readonly completionThreshold = 80;

  constructor(
    private subjectService: SubjectService,
    public authService: AuthService,  // <- Usar servicio auth
    private router: Router
  ) {
    console.log('DashboardComponent constructor');
  }

ngOnInit(): void {
  this.userName = this.authService.currentUserValue?.username || 'Estudiante';
  const stored = localStorage.getItem('lastSubjectId');
  this.lastSubjectId = stored ? Number(stored) : null;
  this.loadData();
}


  loadData(): void {
    console.log('Loading subjects...');
    this.subjectService.getAll().subscribe({
      next: (subjects) => {
        console.log('Subjects loaded:', subjects);
        this.subjects = subjects;
        // Si el último id guardado ya no existe, limpiar para no mostrar botón inválido
        if (this.lastSubjectId && !this.subjects.find(s => s.id === this.lastSubjectId)) {
          this.lastSubjectId = null;
          localStorage.removeItem('lastSubjectId');
        }
        this.loadProgress();
      },
      error: (error) => {
        console.error('Error loading subjects:', error);
        this.loading = false;
      }
    });
  }

  loadProgress(): void {
    this.subjectService.getUserProgress().subscribe({
      next: (res) => {
        this.userProgress = Array.isArray(res.data) ? res.data : [];
        this.loading = false;
      },
      error: (error) => {
        this.userProgress = [];
        this.loading = false;
      }
    });
  }

  getProgressForSubject(subjectId: number): any {
    return this.userProgress.find(p => p.subject_id === subjectId) || { percentage: 0 };
  }

  selectSubject(subjectId: number): void {
    this.lastSubjectId = subjectId;
    localStorage.setItem('lastSubjectId', String(subjectId));
    this.router.navigate(['/student/subject', subjectId]);
  }

  trackBySubject(_index: number, item: Subject): number {
    return item.id;
  }

  get overallProgress(): number {
    if (!this.subjects.length) {
      return 0;
    }
    const total = this.subjects.reduce((sum, subject) => {
      const percentage = this.getProgressForSubject(subject.id).percentage || 0;
      return sum + percentage;
    }, 0);
    return Math.round(total / this.subjects.length);
  }

  get completedSubjectsCount(): number {
    return this.subjects.filter(subject => {
      const percentage = this.getProgressForSubject(subject.id).percentage || 0;
      return percentage >= this.completionThreshold;
    }).length;
  }

  get inProgressSubjectsCount(): number {
    return this.subjects.filter(subject => {
      const percentage = this.getProgressForSubject(subject.id).percentage || 0;
      return percentage > 0 && percentage < this.completionThreshold;
    }).length;
  }

  get nextFocusSubject(): Subject | null {
    if (!this.subjects.length) {
      return null;
    }
    const pending = this.subjects
      .map(subject => ({
        subject,
        progress: this.getProgressForSubject(subject.id).percentage || 0
      }))
      .filter(item => item.progress < 100)
      .sort((a, b) => a.progress - b.progress);

    if (pending.length) {
      return pending[0].subject;
    }

    const fallback = this.subjects
      .map(subject => ({
        subject,
        progress: this.getProgressForSubject(subject.id).percentage || 0
      }))
      .sort((a, b) => b.progress - a.progress);

    return fallback[0]?.subject || null;
  }

  get nextFocusSubjectProgress(): number {
    if (!this.nextFocusSubject) {
      return 0;
    }
    return this.getProgressForSubject(this.nextFocusSubject.id).percentage || 0;
  }

  get resumeSubject(): Subject | null {
    if (!this.lastSubjectId) {
      return null;
    }
    return this.subjects.find(s => s.id === this.lastSubjectId) || null;
  }

  get subjectProgressSnapshots(): { subject: Subject; progress: number }[] {
    return this.subjects.map(subject => ({
      subject,
      progress: this.getProgressForSubject(subject.id).percentage || 0
    }));
  }

  get recentHighlights(): { subject: Subject; progress: number }[] {
    const snapshots = this.subjectProgressSnapshots;
    return snapshots
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3);
  }

  progressLabel(progress: number): string {
    if (progress >= this.completionThreshold) {
      return 'Completada';
    }
    if (progress >= 40) {
      return 'En progreso';
    }
    return 'Pendiente';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
