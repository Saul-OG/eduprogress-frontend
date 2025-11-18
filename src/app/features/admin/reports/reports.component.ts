import { Component, OnInit,  } from '@angular/core';
import { ReportService } from '../../../core/services/report.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  subjects: any[] = [];
  filteredSubjects: any[] = [];
  mostViewed: { labels: string[]; values: number[] } = { labels: [], values: [] };
  generalStats: any = {};
  livesStats: any = {};
  loading = true;

  subjectFilter: 'all' | 'progress' | 'engagement' = 'all';
  range = '30d';
  showChartModal = false;

  constructor(private reportService: ReportService) {}

  ngOnInit() {
    this.loadReports();
  }

  loadReports(): void {
    this.loading = true;
    this.reportService.getSubjectsReport().subscribe({
      next: res => {
        this.subjects = res.data ?? [];
        this.applySubjectFilter();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });

    this.reportService.getMostViewed().subscribe(res => {
      const data = (res as any)?.data;
      if (Array.isArray(data)) {
        this.mostViewed = { labels: [], values: [] };
      } else {
        this.mostViewed = data ?? { labels: [], values: [] };
      }
    });

    this.reportService.getGeneralStats().subscribe(res => {
      this.generalStats = res.data ?? {};
    });

    this.reportService.getLivesStats().subscribe(res => {
      this.livesStats = res.data ?? {};
    });
  }

  applySubjectFilter(): void {
    const list = [...(this.subjects || [])];
    switch (this.subjectFilter) {
      case 'progress':
        list.sort((a, b) => (b.avg_progress ?? 0) - (a.avg_progress ?? 0));
        break;
      case 'engagement':
        list.sort((a, b) => (b.completed_lessons ?? 0) - (a.completed_lessons ?? 0));
        break;
      default:
        list.sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
    }
    this.filteredSubjects = list;
  }

  onRangeChange(value: string): void {
    this.range = value;
    // podría llamar a endpoint específico en el futuro
  }

  onSubjectFilterChange(value: string): void {
    this.subjectFilter = value as any;
    this.applySubjectFilter();
  }

  openChartModal(): void {
    this.showChartModal = true;
  }

  closeChartModal(): void {
    this.showChartModal = false;
  }
}
