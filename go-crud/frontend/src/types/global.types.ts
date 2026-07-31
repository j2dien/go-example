export type UserRole = 'user' | 'admin' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'published';
  user_id: string;
  author?: User;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  meta?: Meta;
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
  total_page: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user: User;
}
