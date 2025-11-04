import { Component, OnInit,  } from '@angular/core';
import { ReportService } from '../../../core/services/report.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  subjects: any[] = [];
  mostViewed: { labels: string[]; values: number[] } = { labels: [], values: [] };
  generalStats: any = {};
  livesStats: any = {};

  constructor(private reportService: ReportService) {}

  ngOnInit() {
    this.loadReports();
  }

  loadReports(): void {
    this.reportService.getSubjectsReport().subscribe(res => {
      this.subjects = res.data ?? [];
    });

    this.reportService.getMostViewed().subscribe(res => {
      this.mostViewed = res.data ?? { labels: [], values: [] };
    });

    this.reportService.getGeneralStats().subscribe(res => {
      this.generalStats = res.data ?? {};
    });

    this.reportService.getLivesStats().subscribe(res => {
      this.livesStats = res.data ?? {};
    });
  }
}
