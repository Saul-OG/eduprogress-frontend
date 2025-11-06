import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExerciseService } from '../../../core/services/exercise.service';
import { Exercise } from '../../../core/models/exercise.model';
import { LivesService } from '../../../core/services/lives.service';


@Component({
  selector: 'app-practice',
  templateUrl: './practice.component.html',
  styleUrls: ['./practice.component.scss']
})
export class PracticeComponent implements OnInit {
  loading = true;
  subjectId!: number;
  topicId!: number;

  currentExercise: Exercise | null = null;
  feedback: string | null = null;
  isCorrect: boolean | null = null;

  points = 0;
  lives = 3;
  level = 1;
  streak = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private exerciseService: ExerciseService,
    private livesService: LivesService
  ) {}

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {
      const sId = params.get('subjectId');
      const tId = params.get('topicId');

      this.subjectId = sId ? Number(sId) : 0;
      this.topicId = tId ? Number(tId) : 0;

      console.log('[Practice] subjectId:', this.subjectId, 'topicId:', this.topicId);

      if (!this.topicId) {
        console.error('❌ Sin topicId en la ruta o inválido');
        this.loading = false;
        return;
      }

      // Carga ejercicios
      this.loadExercise();
    });
  }

  /** 🔹 Carga el primer ejercicio del tema */
  private loadExercise(): void {
    this.loading = true;

    this.exerciseService.getExercisesByTopic(this.topicId).subscribe({
      next: (list) => {
        console.log('🧩 Ejercicios recibidos:', list);
        const first = Array.isArray(list) && list.length ? list[0] : null;

        if (first) {
          // Si las opciones están en un array JSON o separadas
          if (!first.options || !Array.isArray(first.options)) {
            const opts = [first.optionA, first.optionB, first.optionC, first.optionD]
              .filter(Boolean) as string[];
            first.options = opts;
          }
        }

        this.currentExercise = first;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error cargando ejercicios del tópico:', err);
        this.currentExercise = null;
        this.loading = false;
      }
    });
  }

  /** 🔹 Envía la respuesta seleccionada */
  submitAnswer(answer: string): void {
    if (!this.currentExercise) return;

    this.exerciseService.submitAnswer(this.currentExercise.id, { answer }).subscribe({
      next: (res) => {
        console.log('✅ Respuesta procesada:', res);

        this.feedback = res.message || (res.is_correct ? '¡Correcto!' : 'Incorrecto 😕');
        this.isCorrect = !!res.is_correct;

        // Actualiza estadísticas si vienen del backend
        if (res?.data) {
          this.points = res.data.points ?? this.points;
          this.level = res.data.level ?? this.level;
          this.lives = res.data.lives ?? this.lives;
          this.streak = res.data.streak_days ?? this.streak;
          this.livesService.updateLives?.(this.lives);
        }

        // Limpia feedback tras 3 seg
        setTimeout(() => (this.feedback = null), 3000);
      },
      error: (err) => {
        console.error('❌ Error al enviar respuesta:', err);
        this.feedback = 'Error al enviar respuesta 😕';
        this.isCorrect = false;
      }
    });
  }

  /** 🔹 Regresar al detalle de la materia */
  goBack(): void {
    this.router.navigate(['/student/subject', this.subjectId]);
  }

  trackByIndex(i: number): number {
    return i;
  }
}
