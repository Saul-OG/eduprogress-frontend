import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ExerciseService } from '../../../core/services/exercise.service';
import { Exercise } from '../../../core/models/exercise.model';
import { LivesService } from '../../../core/services/lives.service';
import { TopicService } from '../../../core/services/topic.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-practice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './practice.component.html',
  styleUrls: ['./practice.component.scss']
})
export class PracticeComponent implements OnInit, OnDestroy {
  loading = true;
  subjectId!: number;
  topicId!: number;

  currentExercise: Exercise | null = null;
  feedback: string | null = null;
  isCorrect: boolean | null = null;
  lives = 3;
  level = 1;
  showTheory = false;
  topicTheory = '';
  topicDetails: any = null;
  exercises: Exercise[] = [];
  currentIndex = 0;
  practiceCompleted = false;
  showNoLivesModal = false;
  resettingLives = false;
  streak = 0;
  bestStreak = 0;

  completedCount = 0;
  private correctCount = 0;
  private attemptsCount = 0;
  private progressMarked = false;
  private livesRefreshTimer: any = null;
  private routeSub?: Subscription;
  private readonly segmentWeights = [30, 30, 40];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private exerciseService: ExerciseService,
    private livesService: LivesService,
    private topicService: TopicService
  ) {}

  ngOnInit(): void {
    this.loadLives();
    this.routeSub = this.route.paramMap.subscribe(params => {
      const sId = params.get('subjectId');
      const tId = params.get('topicId');
      this.subjectId = sId ? Number(sId) : 0;
      this.topicId = tId ? Number(tId) : 0;

      if (!this.topicId) {
        console.warn('PracticeComponent: topicId missing in route');
        this.loading = false;
        return;
      }

      this.loadExercises();
      this.loadTopicTheory();
    });
  }

  ngOnDestroy(): void {
    if (this.livesRefreshTimer) {
      clearTimeout(this.livesRefreshTimer);
      this.livesRefreshTimer = null;
    }
    this.routeSub?.unsubscribe();
  }

  submitAnswer(answerIndex: number): void {
    if (!this.currentExercise || this.lives <= 0 || this.practiceCompleted || this.showNoLivesModal) {
      return;
    }

    this.attemptsCount++;
    this.exerciseService.submitAnswer(this.currentExercise.id, { answer: answerIndex }).subscribe({
      next: (res) => {
        this.feedback = res?.message || (res?.is_correct ? 'Correcto!' : 'Respuesta incorrecta');
        this.isCorrect = !!res?.is_correct;
        this.lives = typeof res?.lives === 'number' ? res.lives : this.lives;
        this.livesService.setLives(this.lives);
        this.scheduleLivesRefresh(res?.next_life_at);

        if (this.lives <= 0) {
          this.handleNoLives();
          return;
        }

        if (this.isCorrect) {
          this.correctCount++;
          this.streak++;
          this.bestStreak = Math.max(this.bestStreak, this.streak);
        }
        if (!this.isCorrect) {
          this.streak = 0;
        }

        this.completedCount++;
        if (this.completedCount >= this.exercises.length) {
          this.markPracticeCompleted();
        } else {
          this.nextExercise();
        }
      },
      error: () => {
        this.feedback = 'Ocurrió un problema al enviar tu respuesta.';
        this.isCorrect = null;
      }
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  private loadExercises(): void {
    this.loading = true;
    this.exerciseService.getExercisesByTopic(this.topicId).subscribe({
      next: (list) => {
        this.practiceCompleted = false;
        this.completedCount = 0;
        this.correctCount = 0;
        this.attemptsCount = 0;
        this.progressMarked = false;
        this.showNoLivesModal = false;
        this.exercises = (list || []).map((e: any) => {
          if (!Array.isArray(e.options) && e.optionA) {
            e.options = [e.optionA, e.optionB, e.optionC, e.optionD].filter(Boolean);
          }
          return e as Exercise;
        });

        this.currentIndex = 0;
        this.currentExercise = this.exercises[0] || null;
        this.level = this.currentExercise?.level ?? 1;
        this.loading = false;
        if (!this.exercises.length && this.topicDetails?.exercises?.length) {
          this.applyTopicExercises(this.topicDetails.exercises);
        }
      },
      error: () => {
        this.loading = false;
        this.feedback = 'No se pudieron cargar los ejercicios.';
      }
    });
  }

  private loadTopicTheory(): void {
    if (!this.topicId) { return; }
    this.topicService.getById(this.topicId).subscribe({
      next: (topic: any) => {
        this.topicTheory = topic?.theory_content || '';
        this.topicDetails = topic;
        if (!this.exercises.length && Array.isArray(topic?.exercises) && topic.exercises.length) {
          this.applyTopicExercises(topic.exercises);
        }
      },
      error: () => {
        this.topicTheory = '';
      }
    });
  }

  private loadLives(): void {
    this.livesService.getLives().subscribe({
      next: (res) => {
        this.lives = res?.lives ?? this.lives;
        this.livesService.setLives(this.lives);
        this.scheduleLivesRefresh(res?.next_life_at);
        if (this.lives <= 0) {
          this.handleNoLives();
        }
      },
      error: () => {
        this.lives = this.livesService.currentLives;
      }
    });
  }

  private nextExercise(): void {
    if (!this.exercises.length) { return; }
    this.currentIndex += 1;
    if (this.currentIndex >= this.exercises.length) {
      this.currentExercise = null;
      return;
    }
    this.currentExercise = this.exercises[this.currentIndex];
    this.level = this.currentExercise?.level ?? this.level;
  }

  toggleTheory(): void {
    this.showTheory = !this.showTheory;
  }

  getHeartsArray(lives: number): boolean[] {
    const maxLives = 3;
    return Array(maxLives).fill(false).map((_, idx) => idx < (lives || 0));
  }

  get practiceProgressPercent(): number {
    if (!this.exercises.length) {
      return 0;
    }
    return Math.round((this.completedCount / this.exercises.length) * 100);
  }

  get practiceSegments(): number[] {
    return this.calculateSegments(this.practiceProgressPercent);
  }

  get practiceAccuracy(): number {
    if (!this.attemptsCount) {
      return 0;
    }
    return Math.round((this.correctCount / this.attemptsCount) * 100);
  }

  private calculateSegments(value: number): number[] {
    const segments: number[] = [];
    let remaining = Math.max(0, Math.min(100, value));
    for (const weight of this.segmentWeights) {
      const filled = Math.min(remaining, weight);
      const percent = weight === 0 ? 0 : Math.round((filled / weight) * 100);
      segments.push(percent);
      remaining -= filled;
    }
    return segments;
  }

  get completionMessage(): string {
    const accuracy = this.practiceAccuracy;
    if (accuracy >= 85) {
      return '¡Excelente! Dominaste este tema.';
    }
    if (accuracy >= 60) {
      return '¡Buen trabajo! Un poco más y serás experto.';
    }
    if (accuracy >= 40) {
      return 'Buen intento, sigue practicando para mejorar.';
    }
    return 'Cada intento cuenta, vuelve a intentarlo y mejorarás.';
  }

  goBackToSubject(): void {
    if (this.subjectId) {
      this.router.navigate(['/student/subject', this.subjectId]);
    } else {
      this.router.navigate(['/student']);
    }
  }

  restartPractice(): void {
    if (this.resettingLives) { return; }
    this.resettingLives = true;
    this.livesService.resetLives().subscribe({
      next: (res) => {
        this.lives = res?.lives ?? 3;
        this.livesService.setLives(this.lives);
        this.resettingLives = false;
        this.loadExercises();
      },
      error: () => {
        this.resettingLives = false;
      }
    });
  }

  private scheduleLivesRefresh(nextLifeAt?: string | null): void {
    if (this.livesRefreshTimer) {
      clearTimeout(this.livesRefreshTimer);
      this.livesRefreshTimer = null;
    }

    if (!nextLifeAt) {
      return;
    }

    const timestamp = Date.parse(nextLifeAt);
    if (Number.isNaN(timestamp)) {
      return;
    }

    const diff = timestamp - Date.now();
    if (diff <= 0) {
      this.loadLives();
      return;
    }

    this.livesRefreshTimer = setTimeout(() => {
      this.loadLives();
      this.livesRefreshTimer = null;
    }, diff);
  }

  private markPracticeCompleted(): void {
    this.practiceCompleted = true;
    this.currentExercise = null;
    this.feedback = 'Practica completada!';
    this.isCorrect = true;
    if (!this.progressMarked) {
      this.progressMarked = true;
      this.topicService.markProgress(this.topicId, 'practice').subscribe({ next: () => {}, error: () => {} });
    }
  }

  private handleNoLives(): void {
    this.showNoLivesModal = true;
    this.currentExercise = null;
    this.feedback = 'Sin vidas disponibles';
  }

  private applyTopicExercises(exercises: any[]): void {
    if (!Array.isArray(exercises) || !exercises.length) {
      return;
    }
    this.exercises = exercises.map((e: any) => {
      if (!Array.isArray(e.options) && e.optionA) {
        e.options = [e.optionA, e.optionB, e.optionC, e.optionD].filter(Boolean);
      }
      return e as Exercise;
    });
    this.currentIndex = 0;
    this.currentExercise = this.exercises[0] || null;
    this.level = this.currentExercise?.level ?? this.level;
    this.loading = false;
  }
}
