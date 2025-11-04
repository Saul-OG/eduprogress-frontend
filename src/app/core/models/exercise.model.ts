export interface Exercise {
  id: number;
  topic_id: number;
  question: string;
  options?: string[]; // <- en array si vienen agrupadas
  correct_answer?: number | string;
  difficulty?: string;
  order?: number;
  is_active?: boolean;

  // Campos ABCD (compatibles con tu backend)
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correct_option?: 'A' | 'B' | 'C' | 'D';
}

// Respuesta del backend al verificar respuesta
export interface AnswerResponse {
  is_correct: boolean;
  correct_answer: number; // 0..3
  message: string;
  lives: number;
  life_gained: boolean;
  progress: number;
}
