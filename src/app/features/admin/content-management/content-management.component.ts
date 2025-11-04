import { Component, OnInit } from '@angular/core';
import { Topic } from '../../../core/models/topic.model';
import { TopicService } from '../../../core/services/topic.service';

@Component({
  selector: 'app-content-management',
  templateUrl: './content-management.component.html',
  styleUrls: ['./content-management.component.scss']
})
export class ContentManagementComponent implements OnInit {
  topics: Topic[] = [];
  loading = false;
  errorMsg: string | null = null;

  showModal = false;
  isEditing = false;
  selectedSubjectId = 1;

  // usa Partial para no exigir todos los campos
  topicForm: Partial<Topic> = this.blankTopic();
  

  constructor(private topicService: TopicService) {}

  ngOnInit(): void {
    this.loadTopics();
  }

 blankTopic(): Partial<Topic> {
  return {
    subject_id: 1,
    title: '',
    description: '',
    theory_content: '',
    video_url: '',
    type: 'texto',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correct_option: undefined, // 🔹 AGREGA ESTA LÍNEA
  };
}


  loadTopics(): void {
    this.loading = true;
    this.errorMsg = null;

    this.topicService.getBySubject(this.selectedSubjectId).subscribe({
      next: (data) => {
        this.topics = data ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error('loadTopics error', err);
        this.errorMsg = 'Error cargando temas (500). Revisa el backend.';
        this.loading = false;
      }
    });
  }

  openNew(): void {
    this.isEditing = false;
    this.topicForm = this.blankTopic();
    this.showModal = true;
  }

  openEdit(topic: Topic): void {
    this.isEditing = true;
    this.topicForm = { ...topic }; // Partial< Topic >
    this.showModal = true;
  }

saveTopic(): void {
  this.topicForm.subject_id = this.selectedSubjectId;

  const req$ = this.isEditing && this.topicForm.id
    ? this.topicService.update(this.topicForm.id!, this.topicForm) // ← el ! le dice al compilador “confía, no es undefined”
    : this.topicService.create(this.topicForm);

  req$.subscribe({
    next: () => {
      this.showModal = false;
      this.loadTopics();
    },
    error: (err) => {
      console.error('saveTopic error', err);
      alert('No se pudo guardar el tema.');
    }
  });
}


  deleteTopic(topic: Topic): void {
    if (!confirm(`¿Eliminar el tema "${topic.title}"?`)) return;

this.topicService.delete(topic.id!).subscribe({
  next: () => this.loadTopics(),
  error: (err) => {
    console.error('deleteTopic error', err);
    alert('No se pudo eliminar el tema.');
  }
});

  }

  closeModal(): void {
    this.showModal = false;
  }

  exportReport(): void {
    const dataStr = JSON.stringify(this.topics, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'reporte_contenido.json';
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
