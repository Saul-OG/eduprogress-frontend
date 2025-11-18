// topic.model.ts


export interface Exercise {
  id: number;
  topic_id: number;
  question: string;
  difficulty: number;
  order: number;
  is_active: boolean;
  options?: string[];                // opcional si los traes normalizados
  correct_answer?: number;           // opcional si aplica
}

export interface Topic {
  id: number;                        // âœ… requerido
  subject_id: number;
  title: string;
  description?: string;
  theory_content?: string;
  example_content?: string;
  order?: number;
  level?: number;                    // Nivel del tema (1..n)
  unit?: number;
  is_active: boolean;

  type?: 'texto' | 'video' | 'ABCD';
  video_url?: string;
  estimated_time?: number;

  // solo para ABCD si decides mantenerlo plano en topic
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correct_option?: 'A' | 'B' | 'C' | 'D';
  exercise_description?: string;

  exercises?: Exercise[];
  created_at?: string;
  updated_at?: string;
  progress_percentage?: number;
}

