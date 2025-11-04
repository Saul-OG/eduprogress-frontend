import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Chart as ChartJS } from 'chart.js/auto';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-chart-modal',
  templateUrl: './chart-modal.component.html',
  styleUrls: ['./chart-modal.component.scss'],
})
export class ChartModalComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();

  importForm!: FormGroup;
  loading = false;

  activeTab: 'paste' | 'csv' = 'paste';
  selectedFileName: string | null = null;

  parsedLabels: string[] = [];
  parsedData: number[] = [];
  chartInstance: ChartJS | null = null;

  private subs = new Subscription();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.importForm = this.fb.group({
      rawInput: [''],
      delimiter: [',', Validators.required],
      chartType: ['bar', Validators.required],
    });

    // Re-render reactivo cuando cambien inputs relevantes
    this.subs.add(
      this.importForm.get('chartType')!.valueChanges.subscribe(() => this.renderChart())
    );

    this.subs.add(
      this.importForm.get('rawInput')!.valueChanges
        .pipe(debounceTime(200), distinctUntilChanged())
        .subscribe(() => {
          // si ya parseaste y el user sigue editando, re-procesa rápido
          if (this.parsedLabels.length || this.parsedData.length) {
            this.onImport(false); // re-parse sin alerts ni loading
          }
        })
    );
  }

  /** Parsear texto y graficar */
  onImport(showAlerts = true): void {
    this.loading = true;
    const value = (this.importForm.value.rawInput || '').trim();
    const delimiter = this.importForm.value.delimiter || ',';

const lines = value
  .split(/\r?\n/)
  .map((l: string) => l.trim())
  .filter((l: string) => l.length > 0);


    const nextLabels: string[] = [];
    const nextData: number[] = [];

    try {
      for (const line of lines) {
        const parts = line.split(delimiter).map((s: string) => s.trim());
        if (parts.length < 2) throw new Error(`Formato incorrecto en: "${line}"`);
        const numberStr = parts.pop()!;             // último token = número
        const label = parts.join(delimiter);        // resto = label (por si trae delimitadores)
        const val = Number(numberStr);
        if (!Number.isFinite(val)) throw new Error(`Valor no numérico: "${numberStr}"`);
        nextLabels.push(label);
        nextData.push(val);
      }

      this.parsedLabels = nextLabels;
      this.parsedData = nextData;
      this.loading = false;
      this.renderChart();
    } catch (err: any) {
      this.loading = false;
      this.parsedLabels = [];
      this.parsedData = [];
      if (showAlerts) alert('⚠️ Revisa el formato: ' + (err?.message || 'Error desconocido'));
      this.destroyChart();
    }
  }

  /** Renderiza Chart.js */
  renderChart(): void {
    const ctx = document.getElementById('studentsChartModal') as HTMLCanvasElement | null;
    if (!ctx || !this.hasParsedValues) { this.destroyChart(); return; }

    this.destroyChart();

    const type = this.importForm.value.chartType || 'bar';
    this.chartInstance = new ChartJS(ctx, {
      type,
      data: {
        labels: this.parsedLabels,
        datasets: [{
          label: 'Estudiantes',
          data: this.parsedData,
          // deja colores por defecto; Chart.js asigna paleta automáticamente
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: type !== 'bar' },
          title: { display: true, text: 'Distribución de Estudiantes' }
        },
        scales: (type === 'bar' || type === 'line') ? { y: { beginAtZero: true } } : {}
      }
    });
  }

  destroyChart(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }

  /** CSV file */
  onFileSelect(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;
    this.selectedFileName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      this.importForm.patchValue({ rawInput: String(reader.result || '') });
      this.activeTab = 'paste';
    };
    reader.readAsText(file);
  }

  onDragOver(event: DragEvent) { event.preventDefault(); } // necesario para drop
  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    this.selectedFileName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      this.importForm.patchValue({ rawInput: String(reader.result || '') });
      this.activeTab = 'paste';
    };
    reader.readAsText(file);
  }

  removeFile(): void {
    this.selectedFileName = null;
    this.importForm.patchValue({ rawInput: '' });
    this.clearParsed();
  }

  pasteSample(): void {
    this.importForm.patchValue({ rawInput: `Primero,32\nSegundo,35\nTercero,29\nCuarto,30` });
  }

  clearInput(): void {
    this.importForm.patchValue({ rawInput: '' });
    this.clearParsed();
  }

  clearParsed(): void {
    this.parsedLabels = [];
    this.parsedData = [];
    this.destroyChart();
  }

  closeModal(): void { this.close.emit(); }

  get totalStudents(): number {
    return (this.parsedData || []).reduce((sum, n) => sum + (Number(n) || 0), 0);
  }
  get hasParsedValues(): boolean {
    return this.parsedLabels.length > 0 && this.parsedData.length > 0;
  }
  get canImport(): boolean {
    return !!this.importForm.value.rawInput?.trim().length;
  }

  ngOnDestroy(): void {
    this.destroyChart();
    this.subs.unsubscribe();
  }
}

