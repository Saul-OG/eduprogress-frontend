import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubjectService } from '../../../core/services/subject.service';
import { Subject } from '../../../core/models/subject.model';
import { Topic }   from '../../../core/models/topic.model';
import { forkJoin, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';

@Component({
  selector: 'app-subject-detail',
  templateUrl: './subject-detail.component.html',
  styleUrls: ['./subject-detail.component.scss'],
  standalone: false
})
export class SubjectDetailComponent implements OnInit {
  subject: Subject | null = null;
  topics: Topic[] = [];
  progress: { percentage?: number } | null = null;
  loading = true;
  subjectId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private subjectService: SubjectService
  ) {}

  ngOnInit(): void {
    // lee el id de la ruta una sola vez
    this.subjectId = Number(this.route.snapshot.paramMap.get('id'));
    if (Number.isNaN(this.subjectId)) {
      console.error('subjectId inválido en la ruta');
      this.router.navigate(['/student']);
      return;
    }
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;

    const subject$ = this.subjectService.getById(this.subjectId).pipe(
      take(1),
      catchError(err => {
        console.error('Error al cargar la materia:', err);
        return of(null);
      })
    );

    const topics$ = this.subjectService.getTopicsBySubject(this.subjectId).pipe(
      take(1),
      map((topics: any) => Array.isArray(topics) ? topics : []),
      // normaliza el type si no viene
      map((topics: Topic[]) =>
        topics.map(t => ({
          ...t,
          type: t.type ?? (
            (t as any).video_url ? 'video' :
            ((t as any).optionA || (t as any).optionB || (t as any).optionC || (t as any).optionD
              ? 'ABCD'
              : 'texto')
          )
        }))
      ),
      catchError(err => {
        console.error('Error al cargar los temas:', err);
        return of([] as Topic[]);
      })
    );

    forkJoin([subject$, topics$]).subscribe({
      next: ([subjectRes, topics]) => {
        // algunos backends devuelven { subject, progress }, otros la entidad directa
        const s: any = subjectRes || {};
        this.subject = s.subject ?? s ?? null;
        this.progress = s.progress ?? this.progress ?? null;
        this.topics = topics;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error combinando data:', err);
        this.loading = false;
      }
    });
  }

  // Navegación
  goToTheory(topicId: number): void {
    this.router.navigate(['/student/theory', this.subjectId, topicId]);
  }

 goToPractice(topicId: number): void {
  this.router.navigate(['/student/practice', this.subjectId, topicId]);
}

  goToVideo(topic: Topic): void {
    // Si tu vista de teoría también muestra el iframe, usa la misma ruta:
    this.router.navigate(['/student/theory', this.subjectId, topic.id]);
    // o si prefieres abrir directa:
    // if ((topic as any).video_url) window.open((topic as any).video_url, '_blank');
  }

  goBackDashboard(): void {
    this.router.navigate(['/student']);
  }
}
