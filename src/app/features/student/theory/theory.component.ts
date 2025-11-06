import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SubjectService } from '../../../core/services/subject.service';
import { Topic } from '../../../core/models/topic.model';

@Component({
  selector: 'app-theory',
  templateUrl: './theory.component.html',
  styleUrls: ['./theory.component.scss']
})
export class TheoryComponent implements OnInit {

  loading = true;              
  topic: Topic | null = null;
  subjectId!: number;
  topicId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private subjectService: SubjectService,
    private sanitizer: DomSanitizer        
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.subjectId = +params['subjectId'];
      this.topicId   = +params['topicId'];

      if (!this.topicId) {
        console.warn('Sin topicId en la ruta');
        this.loading = false;
        return;
      }

      this.loadTopic(this.topicId);
    });
  }

  /** 🔹 Cargar el tema según su ID */
  private loadTopic(id: number): void {
    this.loading = true;
    this.subjectService.getTopicById(id).subscribe({
      next: (topic: Topic) => {
        this.topic = topic;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar topic:', err);
        this.loading = false;
      }
    });
  }

  /** 🔹 Limpia URL para iframe (necesario para evitar error de seguridad Angular) */
  sanitizeUrl(url?: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url || '');
  }

  /** 🔹 Regresar a la lista de temas */
  goBack(): void {
    this.router.navigate(['/student/subject', this.subjectId]);
  }
}
