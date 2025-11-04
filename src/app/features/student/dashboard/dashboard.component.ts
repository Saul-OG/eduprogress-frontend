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

  constructor(
    private subjectService: SubjectService,
    public authService: AuthService,  // <- Usar servicio auth
    private router: Router
  ) {
    console.log('DashboardComponent constructor');
  }

ngOnInit(): void {
  this.userName = this.authService.currentUserValue?.username || 'Estudiante';
  this.loadData();
}


  loadData(): void {
    console.log('Loading subjects...');
    this.subjectService.getAll().subscribe({
      next: (subjects) => {
        console.log('Subjects loaded:', subjects);
        this.subjects = subjects;
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
    this.router.navigate(['/student/subject', subjectId]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
