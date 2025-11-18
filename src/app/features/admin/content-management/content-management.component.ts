import { Component, OnDestroy, OnInit } from '@angular/core';
import { take } from 'rxjs';

import { Topic } from '../../../core/models/topic.model';
import { TopicService } from '../../../core/services/topic.service';

type EditorTab = 'theory' | 'video' | 'abcd';
type ToastType = 'success' | 'error' | 'info';
type StatusFilter = 'all' | 'active' | 'inactive';

interface LevelOption {
  label: string;
  value: number;
}

interface BulkFormRow {
  question: string;
  A: string;
  B: string;
  C: string;
  D: string;
  correct: 'A' | 'B' | 'C' | 'D';
}

interface ParsedBulkLine {
  question: string;
  options: string[];
  correct: BulkFormRow['correct'];
}

type TopicForm = Omit<Partial<Topic>, 'correct_option'> & { correct_option?: Topic['correct_option'] | '' };

@Component({
  selector: 'app-content-management',
  templateUrl: './content-management.component.html',
  styleUrls: ['./content-management.component.scss'],
  standalone: false
})
export class ContentManagementComponent implements OnInit, OnDestroy {
  topics: Topic[] = [];
  loading = false;
  errorMsg: string | null = null;

  selectedSubjectId = 1;
  levelFilter: 'all' | number = 'all';
  statusFilter: StatusFilter = 'all';
  searchTerm = '';

  readonly levelOptions: LevelOption[] = [
    { label: 'Basico', value: 1 },
    { label: 'Intermedio', value: 2 },
    { label: 'Avanzado', value: 3 }
  ];

  readonly unitOptions: number[] = [1, 2, 3, 4, 5, 6];

  showModal = false;
  isEditing = false;
  activeEditorTab: EditorTab = 'theory';
  topicForm: TopicForm = this.createEmptyTopicForm();

  confirmingDelete: Topic | null = null;

  toastMessage: string | null = null;
  toastType: ToastType = 'info';
  private toastTimeoutId?: ReturnType<typeof setTimeout>;

  // Bulk - shared state
  bulkTopicId: number | null = null;
  bulkTopicTitle = '';
  bulkLevel = 1;

  // Simple bulk modal
  showBulkSimple = false;
  bulkItems: BulkFormRow[] = [];

  // Advanced bulk modal
  showBulk = false;
  private bulkTitleValue = '';
  private bulkRawValue = '';
  bulkPreviewLines: string[] = [];
  builderQ = '';
  builderA = '';
  builderB = '';
  builderC = '';
  builderD = '';
  builderCorrect: '' | BulkFormRow['correct'] = '';

  constructor(private topicService: TopicService) {
    this.bulkLevel = this.levelOptions[0]?.value ?? 1;
  }

  ngOnInit(): void {
    this.loadTopics();
  }

  ngOnDestroy(): void {
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }
  }

  get bulkRaw(): string {
    return this.bulkRawValue;
  }

  set bulkRaw(value: string) {
    this.bulkRawValue = value || '';
    this.refreshBulkPreview();
  }

  get bulkTitle(): string {
    return this.bulkTitleValue;
  }

  set bulkTitle(value: string) {
    this.bulkTitleValue = value || '';
    this.refreshBulkPreview();
  }

  get filteredTopics(): Topic[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.topics
      .filter(topic => {
        const matchesSearch = term.length === 0 || (topic.title || '').toLowerCase().includes(term);
        if (!matchesSearch) {
          return false;
        }

        if (this.levelFilter !== 'all') {
          return (topic.level || 0) === this.levelFilter;
        }

        if (this.statusFilter === 'active') {
          return topic.is_active !== false;
        }
        if (this.statusFilter === 'inactive') {
          return topic.is_active === false;
        }
        return true;
      })
      .sort((a, b) => {
        return (a.level || 0) - (b.level || 0);
      });
  }

  topicsByLevel(level: number): Topic[] {
    return this.filteredTopics.filter(t => (t.level || 0) === level);
  }

  loadTopics(): void {
    const subjectId = Number(this.selectedSubjectId);
    if (!subjectId) {
      return;
    }
    this.selectedSubjectId = subjectId;
    this.loading = true;
    this.errorMsg = null;

    this.topicService.getBySubject(subjectId).pipe(take(1)).subscribe({
      next: (topics) => {
        this.topics = (topics || []).map(topic => this.normalizeTopic(topic));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar temas', err);
        this.loading = false;
        this.errorMsg = 'No se pudieron cargar los temas.';
        this.showToast('No se pudieron cargar los temas.', 'error');
      }
    });
  }

  openNew(): void {
    this.isEditing = false;
    this.topicForm = this.createEmptyTopicForm();
    this.activeEditorTab = 'theory';
    this.showModal = true;
  }

  openEdit(topic: Topic): void {
    this.isEditing = true;
    this.topicForm = {
      ...topic,
      subject_id: topic.subject_id || this.selectedSubjectId,
      correct_option: topic.correct_option || ''
    };
    this.activeEditorTab = this.resolveEditorTab(topic);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.topicForm = this.createEmptyTopicForm();
    this.isEditing = false;
  }

  setEditorTab(tab: EditorTab): void {
    this.activeEditorTab = tab;
  }

  saveTopic(): void {
    const normalizedCorrect = (this.topicForm.correct_option || '').toString().toUpperCase();

    const payload: Partial<Topic> = {
      ...this.topicForm,
      title: (this.topicForm.title || '').trim(),
      description: (this.topicForm.description || '').trim(),
      theory_content: (this.topicForm.theory_content || '').trim(),
      example_content: (this.topicForm.example_content || '').trim(),
      video_url: (this.topicForm.video_url || '').trim(),
      exercise_description: (this.topicForm.exercise_description || '').trim(),
      optionA: (this.topicForm.optionA || '').trim(),
      optionB: (this.topicForm.optionB || '').trim(),
      optionC: (this.topicForm.optionC || '').trim(),
      optionD: (this.topicForm.optionD || '').trim(),
      correct_option: normalizedCorrect ? normalizedCorrect as Topic['correct_option'] : undefined,
      subject_id: this.topicForm.subject_id || this.selectedSubjectId,
      level: this.topicForm.level || this.levelOptions[0].value,
      unit: this.topicForm.unit || this.unitOptions[0],
      type: this.topicForm.type || (this.activeEditorTab === 'video'
        ? 'video'
        : this.activeEditorTab === 'abcd'
          ? 'ABCD'
          : 'texto')
    };

    if (!payload.title) {
      this.showToast('El titulo es obligatorio.', 'error');
      return;
    }

    const request$ = this.isEditing && this.topicForm.id
      ? this.topicService.update(this.topicForm.id, payload)
      : this.topicService.create(payload);

    request$.pipe(take(1)).subscribe({
      next: () => {
        this.showToast(this.isEditing ? 'Tema actualizado.' : 'Tema creado.', 'success');
        this.closeModal();
        this.loadTopics();
      },
      error: (err) => {
        console.error('Error al guardar tema', err);
        this.showToast('No se pudo guardar el tema.', 'error');
      }
    });
  }

  deleteTopic(topic: Topic): void {
    this.confirmingDelete = topic;
  }

  cancelDelete(): void {
    this.confirmingDelete = null;
  }

  confirmDeleteTopic(): void {
    if (!this.confirmingDelete) {
      return;
    }
    const topicId = this.confirmingDelete.id;
    this.topicService.delete(topicId).pipe(take(1)).subscribe({
      next: () => {
        this.topics = this.topics.filter(t => t.id !== topicId);
        this.showToast('Tema eliminado.', 'success');
        this.cancelDelete();
      },
      error: (err) => {
        console.error('Error al eliminar tema', err);
        this.showToast('No se pudo eliminar el tema.', 'error');
      }
    });
  }

  openBulkSimple(topic?: Topic): void {
    if (!topic || !topic.id) {
      this.showToast('Selecciona un tema para agregar preguntas.', 'error');
      return;
    }
    this.bulkTopicId = topic.id;
    this.bulkTopicTitle = topic.title;
    this.bulkLevel = topic.level || this.levelOptions[0].value;
    this.bulkItems = [this.createBulkRow()];
    this.showBulkSimple = true;
  }

  closeBulkSimple(): void {
    this.showBulkSimple = false;
    this.bulkItems = [];
    this.bulkTopicId = null;
    this.bulkTopicTitle = '';
    this.bulkLevel = this.levelOptions[0]?.value ?? this.bulkLevel;
  }

  addBulkRow(): void {
    this.bulkItems.push(this.createBulkRow());
  }

  removeBulkRow(index: number): void {
    this.bulkItems.splice(index, 1);
  }

  clearBulkRows(): void {
    this.bulkItems = [];
  }

  saveBulkSimple(): void {
    if (!this.bulkTopicId) {
      this.showToast('Selecciona un tema valido.', 'error');
      return;
    }
    const prepared = this.bulkItems
      .map(row => ({
        question: (row.question || '').trim(),
        options: [row.A, row.B, row.C, row.D].map(opt => (opt || '').trim()),
        correct: row.correct
      }))
      .filter(item => item.question && item.options.every(opt => !!opt) && this.isValidLetter(item.correct));

    if (!prepared.length) {
      this.showToast('Completa pregunta y opciones A-D.', 'error');
      return;
    }

    const payload = prepared.map(item => ({
      question: item.question,
      options: item.options,
      correct_answer: this.letterToIndex(item.correct),
      level: this.bulkLevel
    }));

    this.topicService.bulkAddExercises(this.bulkTopicId, payload).pipe(take(1)).subscribe({
      next: (res: any) => {
        const added = res?.count ?? payload.length;
        this.showToast(`Se agregaron ${added} preguntas.`, 'success');
        this.closeBulkSimple();
        this.loadTopics();
      },
      error: (err) => {
        console.error('Error en carga simple', err);
        this.showToast('No se pudo cargar el set de preguntas.', 'error');
      }
    });
  }

  openBulk(topic?: Topic): void {
    if (!topic || !topic.id) {
      this.showToast('Selecciona un tema para agregar preguntas.', 'error');
      return;
    }
    this.bulkTopicId = topic.id;
    this.bulkTopicTitle = topic.title;
    this.bulkLevel = topic.level || this.levelOptions[0].value;
    this.bulkTitle = topic.title;
    this.bulkRaw = '';
    this.builderQ = '';
    this.builderA = '';
    this.builderB = '';
    this.builderC = '';
    this.builderD = '';
    this.builderCorrect = '';
    this.showBulk = true;
  }

  closeBulk(): void {
    this.showBulk = false;
    this.bulkTopicId = null;
    this.bulkTopicTitle = '';
    this.bulkTitle = '';
    this.bulkRaw = '';
    this.builderQ = '';
    this.builderA = '';
    this.builderB = '';
    this.builderC = '';
    this.builderD = '';
    this.builderCorrect = '';
    this.bulkLevel = this.levelOptions[0]?.value ?? this.bulkLevel;
  }

  saveBulk(): void {
    if (!this.bulkTopicId) {
      this.showToast('Selecciona un tema valido.', 'error');
      return;
    }
    const parsed = this.parseBulkRaw(this.bulkRaw);
    if (!parsed.length) {
      this.showToast('Agrega lineas validas.', 'error');
      return;
    }

    const payload = parsed.map(line => ({
      question: line.question,
      options: line.options,
      correct_answer: this.letterToIndex(line.correct),
      level: this.bulkLevel
    }));

    this.topicService.bulkAddExercises(this.bulkTopicId, payload).pipe(take(1)).subscribe({
      next: (res: any) => {
        const added = res?.count ?? payload.length;
        this.showToast(`Se agregaron ${added} preguntas.`, 'success');
        this.closeBulk();
        this.loadTopics();
      },
      error: (err) => {
        console.error('Error en carga masiva', err);
        this.showToast('No se pudo cargar el set de preguntas.', 'error');
      }
    });
  }

  addLineFromBuilder(): void {
    const question = (this.builderQ || '').trim();
    const options = [this.builderA, this.builderB, this.builderC, this.builderD].map(opt => (opt || '').trim());
    const correct = (this.builderCorrect || '').toUpperCase() as BulkFormRow['correct'];

    if (!question || options.some(opt => !opt) || !this.isValidLetter(correct)) {
      this.showToast('Completa A, B, C, D y selecciona la opcion correcta.', 'error');
      return;
    }

    const newLine = [question, ...options, correct].join(' | ');
    this.bulkRaw = this.bulkRaw ? `${this.bulkRaw}\n${newLine}` : newLine;

    this.builderQ = '';
    this.builderA = '';
    this.builderB = '';
    this.builderC = '';
    this.builderD = '';
    this.builderCorrect = '';
  }

  exportReport(): void {
    const snapshot = {
      generatedAt: new Date().toISOString(),
      subjectId: this.selectedSubjectId,
      total: this.topics.length,
      topics: this.topics
    };

    const dataStr = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_contenido_${this.selectedSubjectId}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
    this.showToast('Reporte exportado.', 'info');
  }

  closeToast(): void {
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
      this.toastTimeoutId = undefined;
    }
    this.toastMessage = null;
  }

  getLevelLabel(level?: number): string {
    return this.levelOptions.find(opt => opt.value === (level || this.levelOptions[0].value))?.label || 'Nivel';
  }

  getStatusLabel(topic: Topic): string {
    return topic.is_active === false ? 'Inactivo' : 'Activo';
  }

  getStatusClass(topic: Topic): string {
    return topic.is_active === false ? 'inactive' : 'active';
  }

  getQuestionsCount(topic: Topic): number {
    const exercisesCount = topic.exercises?.length ?? (topic as any).exercise_count ?? (topic as any).question_count;
    return typeof exercisesCount === 'number' ? exercisesCount : 0;
  }

  private showToast(message: string, type: ToastType = 'info'): void {
    this.toastMessage = message;
    this.toastType = type;
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }
    this.toastTimeoutId = setTimeout(() => {
      this.toastMessage = null;
      this.toastTimeoutId = undefined;
    }, 4000);
  }

  private createEmptyTopicForm(): TopicForm {
    return {
      subject_id: this.selectedSubjectId,
      unit: this.unitOptions[0],
      level: this.levelOptions[0]?.value ?? 1,
      type: 'texto',
      is_active: true,
      title: '',
      description: '',
      theory_content: '',
      example_content: '',
      video_url: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correct_option: '',
      exercise_description: ''
    };
  }

  private resolveEditorTab(topic: Topic): EditorTab {
    if (topic.video_url) {
      return 'video';
    }
    if (topic.optionA || topic.optionB || topic.optionC || topic.optionD) {
      return 'abcd';
    }
    return 'theory';
  }

  private normalizeTopic(topic: Topic): Topic {
    const derivedType = topic.type ?? (topic.video_url ? 'video' : (topic.optionA || topic.optionB || topic.optionC || topic.optionD ? 'ABCD' : 'texto'));
    return { ...topic, type: derivedType };
  }

  private createBulkRow(): BulkFormRow {
    return {
      question: '',
      A: '',
      B: '',
      C: '',
      D: '',
      correct: 'A'
    };
  }

  private parseBulkRaw(raw: string): ParsedBulkLine[] {
    if (!raw) {
      return [];
    }
    const lines = raw.split(/\r?\n/).map(line => line.trim()).filter(line => !!line);
    const baseTitle = (this.bulkTitle || '').trim();
    let generated = 0;
    const parsed: ParsedBulkLine[] = [];

    for (const line of lines) {
      const segments = line.split('|').map(part => part.trim());
      let question = '';
      let options: string[] = [];
      let correct: string | undefined;

      if (segments.length === 6) {
        question = segments[0];
        options = segments.slice(1, 5);
        correct = segments[5];
      } else if (segments.length === 5) {
        generated += 1;
        question = baseTitle ? `${baseTitle} ${generated}` : `Pregunta ${generated}`;
        options = segments.slice(0, 4);
        correct = segments[4];
      } else {
        continue;
      }

      const normalizedCorrect = (correct || '').toUpperCase() as BulkFormRow['correct'];
      if (!question || options.length < 4 || options.some(opt => !opt) || !this.isValidLetter(normalizedCorrect)) {
        continue;
      }

      parsed.push({ question, options, correct: normalizedCorrect });
    }

    return parsed;
  }

  private refreshBulkPreview(): void {
    const parsed = this.parseBulkRaw(this.bulkRawValue);
    this.bulkPreviewLines = parsed.map((line, index) => `${index + 1}. ${line.question} | Correcta: ${line.correct}`);
  }

  private letterToIndex(letter: BulkFormRow['correct']): number {
    return { A: 0, B: 1, C: 2, D: 3 }[letter] ?? 0;
  }

  private isValidLetter(value: string): value is BulkFormRow['correct'] {
    return ['A', 'B', 'C', 'D'].includes(value);
  }
}
