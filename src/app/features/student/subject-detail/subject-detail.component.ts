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
  groupedByLevel: { level: number; items: Topic[] }[] = [];
  levels: number[] = [];
  selectedLevel: number | 'all' = 'all';
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

        const topicsFromSubject = (this.subject as any)?.topics as Topic[] | undefined;
        // Preferir los topics que ya vienen con progress_percentage del endpoint de detalle
        this.topics = Array.isArray(topicsFromSubject) && topicsFromSubject.length
          ? topicsFromSubject
          : topics;
        this.applyGrouping();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error combinando data:', err);
        this.loading = false;
      }
    });
  }

  private applyGrouping(): void {
    const map = new Map<number, Topic[]>();
    for (const t of this.topics) {
      const lvl = (t.level as number) || 1;
      if (!map.has(lvl)) map.set(lvl, []);
      map.get(lvl)!.push(t);
    }
    this.levels = Array.from(map.keys()).sort((a,b)=>a-b);
    this.groupedByLevel = this.levels.map(l => ({ level: l, items: (map.get(l) || []).sort((a,b)=> (a.order||0)-(b.order||0)) }));
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

  trackByTopic(_index: number, topic: Topic): number {
    return topic.id;
  }

  get totalTopics(): number {
    return this.topics.length;
  }

  get completedTopics(): number {
    return this.topics.filter(topic => (topic.progress_percentage ?? 0) >= 99).length;
  }

  get levelsCount(): number {
    return this.levels.length || 1;
  }

  levelProgress(level: number): number {
    const items = this.topics.filter(t => (t.level || 1) === level);
    if (!items.length) {
      return 0;
    }
    const total = items.reduce((acc, t) => acc + (t.progress_percentage ?? 0), 0);
    return Math.round(total / items.length);
  }

  topicProgress(topic: Topic): number {
    return topic.progress_percentage ?? 0;
  }

  topicStatusLabel(topic: Topic): string {
    const progress = this.topicProgress(topic);
    if (progress >= 99) {
      return 'Dominado';
    }
    if (progress >= 50) {
      return 'En curso';
    }
    if (progress > 0) {
      return 'Iniciado';
    }
    return 'Pendiente';
  }

  topicTypeLabel(topic: Topic): string {
    if ((topic as any).video_url) {
      return 'Video';
    }
    if (topic.theory_content) {
      return 'Teoría';
    }
    if ((topic as any).type) {
      return String((topic as any).type).toUpperCase();
    }
    return 'Tema';
  }

  canOpenTheory(topic: Topic): boolean {
    return !!(topic.theory_content || (topic as any).video_url);
  }

  getLevelLabel(level?: number): string {
    const map: Record<number, string> = {
      1: 'Básico',
      2: 'Intermedio',
      3: 'Avanzado'
    };
    return map[level ?? 1] || 'Nivel';
  }

  getProgressSegments(value: number): number[] {
    const weights = [30, 30, 40];
    const segments: number[] = [];
    let remaining = Math.max(0, Math.min(100, value));
    for (const weight of weights) {
      const filled = Math.min(remaining, weight);
      const percent = weight === 0 ? 0 : Math.round((filled / weight) * 100);
      segments.push(percent);
      remaining -= filled;
    }
    return segments;
  }

  isLevelCompleted(level: number): boolean {
    const group = this.groupedByLevel.find(g => g.level === level);
    if (!group) {
      return false;
    }
    return group.items.every(topic => (topic.progress_percentage ?? 0) >= 100);
  }

  isLevelUnlocked(level: number): boolean {
    if (!this.levels.length) {
      return true;
    }
    const idx = this.levels.indexOf(level);
    if (idx === -1) {
      return true;
    }
    if (idx <= 0) {
      return true;
    }
    const previousLevel = this.levels[idx - 1];
    return this.isLevelCompleted(previousLevel);
  }

  showLockedMessage(level: number): void {
    const previous = level - 1;
    const requiredLevel = previous > 0 ? previous : 1;
    alert(`Completa el Nivel ${requiredLevel} para desbloquear este contenido.`);
  }

  onOpenTheory(topic: Topic): void {
    const level = topic.level || 1;
    if (!this.isLevelUnlocked(level)) {
      this.showLockedMessage(level);
      return;
    }
    this.goToTheory(topic.id);
  }

  onOpenPractice(topic: Topic): void {
    const level = topic.level || 1;
    if (!this.isLevelUnlocked(level)) {
      this.showLockedMessage(level);
      return;
    }
    this.goToPractice(topic.id);
  }

  onOpenVideo(topic: Topic): void {
    const level = topic.level || 1;
    if (!this.isLevelUnlocked(level)) {
      this.showLockedMessage(level);
      return;
    }
    this.goToVideo(topic);
  }
}
