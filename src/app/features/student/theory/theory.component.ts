import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SubjectService } from '../../../core/services/subject.service';
import { Topic } from '../../../core/models/topic.model';
import { TopicService } from '../../../core/services/topic.service';

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
  videoEmbedUrl: SafeResourceUrl | null = null;
  exampleContent: string | null = null;
  showExampleModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private subjectService: SubjectService,
    private sanitizer: DomSanitizer,
    private topicService: TopicService        
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
        this.videoEmbedUrl = this.buildEmbedUrl((topic as any).video_url as any);
        this.exampleContent = this.resolveExampleContent(topic);
        this.loading = false;
        const hasVideo = !!(topic as any).video_url;
        const hasTheory = !!topic.theory_content;
        if (hasVideo && ((topic as any).type === 'video')) {
          this.topicService.markProgress(this.topicId, 'video').subscribe({ next: () => {}, error: () => {} });
        } else if (hasTheory) {
          this.topicService.markProgress(this.topicId, 'theory').subscribe({ next: () => {}, error: () => {} });
        }
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

  private buildEmbedUrl(raw?: string): SafeResourceUrl | null {
    if (!raw) return null;
    try {
      const u = new URL(raw);
      const host = u.hostname.replace('www.', '');
      if (host === 'youtube.com' || host === 'youtu.be' || host === 'm.youtube.com') {
        let videoId = '';
        if (host === 'youtu.be') {
          videoId = u.pathname.split('/').filter(Boolean)[0] || '';
        } else if (u.pathname.startsWith('/watch')) {
          videoId = u.searchParams.get('v') || '';
        } else if (u.pathname.startsWith('/embed/')) {
          videoId = u.pathname.split('/')[2] || '';
        } else if (u.pathname.startsWith('/shorts/')) {
          videoId = u.pathname.split('/')[2] || '';
        }
        if (videoId) {
          const list = u.searchParams.get('list');
          const params = new URLSearchParams();
          if (list) params.set('list', list);
          const qs = params.toString();
          const embed = `https://www.youtube.com/embed/${videoId}${qs ? '?' + qs : ''}`;
          return this.sanitizer.bypassSecurityTrustResourceUrl(embed);
        }
      }
      return this.sanitizer.bypassSecurityTrustResourceUrl(raw);
    } catch {
      return this.sanitizer.bypassSecurityTrustResourceUrl(raw!);
    }
  }

  /** 🔹 Regresar a la lista de temas */
  goBack(): void {
    this.router.navigate(['/student/subject', this.subjectId]);
  }

  goToPractice(): void {
    if (!this.subjectId || !this.topicId) {
      return;
    }
    this.router.navigate(['/student/practice', this.subjectId, this.topicId]);
  }

  get hasExample(): boolean {
    return !!this.exampleContent;
  }

  openExample(): void {
    if (!this.hasExample) {
      return;
    }
    this.showExampleModal = true;
  }

  closeExample(): void {
    this.showExampleModal = false;
  }

  private resolveExampleContent(topic: Topic): string | null {
    const raw =
      (topic as any).example_content ??
      (topic as any).example ??
      topic.exercise_description;
    if (typeof raw !== 'string') {
      return null;
    }
    const trimmed = raw.trim();
    return trimmed.length ? trimmed : null;
  }
}
