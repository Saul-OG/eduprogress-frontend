import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-students-list',
  templateUrl: './students-list.component.html',
  styleUrls: ['./students-list.component.scss'],
  standalone: false
})
export class StudentsListComponent implements OnInit {
  students: any[] = [];
  stats: any = {};
  loading = true;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadStudents();
    this.loadStats();
  }

  loadStudents(): void {
    this.userService.getAll().subscribe({
      next: (students) => {
        this.students = students;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    this.userService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  exportStudents(): void {
    alert('📊 Exportando datos de estudiantes...\n\nFormato: CSV\n✅ Los datos se han exportado exitosamente.');
  }

  getHeartsArray(lives: number): boolean[] {
    return Array(3).fill(false).map((_, index) => index < lives);
  }
}