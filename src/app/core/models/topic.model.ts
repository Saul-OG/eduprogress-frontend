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
  id: number;                        // ✅ requerido
  subject_id: number;
  title: string;
  description?: string;
  theory_content?: string;
  order?: number;
  is_active: boolean;

  type?: 'texto' | 'video' | 'ABCD';
  video_url?: string;

  // sólo para ABCD si decides mantenerlo plano en topic
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correct_option?: 'A' | 'B' | 'C' | 'D';

  exercises?: Exercise[];
  created_at?: string;
  updated_at?: string;
}
