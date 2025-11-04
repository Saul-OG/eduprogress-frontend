// subject.model.ts
import { Topic } from './topic.model';

export interface Subject {
  id: number;
  name: string;
  icon?: string;
  description?: string;
  order?: number;
  is_active: boolean;

  // si guardas los temas aquí:
  topics?: Topic[];
}

export interface Progress {
  subject_id: number;
  percentage: number;
  completed_topics: number;
  total_topics: number;
}
