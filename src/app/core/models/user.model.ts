export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'student';
  lives: number;
  points: number;
  level: number;
  streak_days: number;
  created_at?: string;
  updated_at?: string;
  is_admin?: boolean; // Para compatibilidad con backend antiguo
}
export interface LoginRequest {
  username: string;
  password: string;
  code?: string; // Solo para admin
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}
