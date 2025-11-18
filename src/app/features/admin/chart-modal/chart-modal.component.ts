import { Component, OnDestroy, OnInit } from '@angular/core';
import { Chart as ChartJS } from 'chart.js/auto';
import { Subscription } from 'rxjs';
import { ReportService } from '../../../core/services/report.service';

@Component({
  selector: 'app-chart-modal',
  templateUrl: './chart-modal.component.html',
  styleUrls: ['./chart-modal.component.scss']
})
export class ChartModalComponent implements OnInit, OnDestroy {
  chartType: 'line' | 'bar' = 'line';
  loading = false;

  parsedLabels: string[] = [];
  parsedData: number[] = [];
  chartInstance: ChartJS | null = null;

  private subs = new Subscription();

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadAutoData();
  }

  loadAutoData(): void {
    this.loading = true;
    this.subs.add(
      this.reportService.getNewUsersPerMonth().subscribe({
        next: (res) => {
          const data = (res as any)?.data || { labels: [], values: [] };
          this.parsedLabels = Array.isArray(data.labels) ? data.labels : [];
          this.parsedData = Array.isArray(data.values) ? data.values : [];
          this.loading = false;
          this.renderChart();
        },
        error: () => {
          this.loading = false;
          this.parsedLabels = [];
          this.parsedData = [];
          this.destroyChart();
        }
      })
    );
  }

  onChartTypeChange(value: 'line' | 'bar'): void {
    this.chartType = value;
    this.renderChart();
  }

  renderChart(): void {
    const ctx = document.getElementById('studentsChartModal') as HTMLCanvasElement | null;
    if (!ctx || !this.hasParsedValues) {
      this.destroyChart();
      return;
    }

    this.destroyChart();

    this.chartInstance = new ChartJS(ctx, {
      type: this.chartType,
      data: {
        labels: this.parsedLabels,
        datasets: [{
          label: 'Inscripciones',
          data: this.parsedData
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true }
        },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  destroyChart(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }

  get totalStudents(): number {
    return (this.parsedData || []).reduce((sum, n) => sum + (Number(n) || 0), 0);
  }

  get hasParsedValues(): boolean {
    return this.parsedLabels.length > 0 && this.parsedData.length > 0;
  }

  ngOnDestroy(): void {
    this.destroyChart();
    this.subs.unsubscribe();
  }
}
