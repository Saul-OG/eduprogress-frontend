// chart.model.ts
export interface AppChart {
  id: number;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar';
  data: number[];
  labels: string[];
  options?: any;      // si guardas opciones por gráfico
  order: number;
  is_active: boolean;
}

export interface ChartRequest {
  title: string;
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar';
  data: number[];
  labels: string[];
  options?: any;
  order?: number;
  is_active?: boolean;
}
