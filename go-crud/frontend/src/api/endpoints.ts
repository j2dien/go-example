import { apiClient } from './client';
import { ApiResponse, AuthTokens, User, Post, Meta, UserRole } from '../types/global.types';
import { LoginInput, RegisterInput, PostInput, AdminUpdateUserInput } from '../lib/schemas';

export const authApi = {
  login: async (data: LoginInput): Promise<AuthTokens> => {
    const res = await apiClient.post<ApiResponse<AuthTokens>>('/auth/login', data);
    return res.data.data!;
  },
  register: async (data: RegisterInput): Promise<AuthTokens> => {
    const res = await apiClient.post<ApiResponse<AuthTokens>>('/auth/register', data);
    return res.data.data!;
  },
  getMe: async (): Promise<User> => {
    const res = await apiClient.get<ApiResponse<User>>('/users/me');
    return res.data.data!;
  },
};

export const usersApi = {
  getAll: async (page = 1, limit = 10, query = ''): Promise<{ data: User[]; meta: Meta }> => {
    const res = await apiClient.get<ApiResponse<User[]>>('/users', {
      params: { page, limit, query },
    });
    return { data: res.data.data || [], meta: res.data.meta! };
  },
  getById: async (id: string): Promise<User> => {
    const res = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return res.data.data!;
  },
  update: async (id: string, data: Partial<{ name: string; email: string }>): Promise<User> => {
    const res = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data);
    return res.data.data!;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};

export const adminApi = {
  updateUser: async (id: string, data: AdminUpdateUserInput): Promise<User> => {
    const res = await apiClient.put<ApiResponse<User>>(`/admin/users/${id}`, data);
    return res.data.data!;
  },
  changeRole: async (id: string, role: UserRole): Promise<User> => {
    const res = await apiClient.patch<ApiResponse<User>>(`/admin/users/${id}/role`, { role });
    return res.data.data!;
  },
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`);
  },
};

export const postsApi = {
  getAll: async (page = 1, limit = 10, query = ''): Promise<{ data: Post[]; meta: Meta }> => {
    const res = await apiClient.get<ApiResponse<Post[]>>('/posts', {
      params: { page, limit, query },
    });
    return { data: res.data.data || [], meta: res.data.meta! };
  },
  getById: async (id: string): Promise<Post> => {
    const res = await apiClient.get<ApiResponse<Post>>(`/posts/${id}`);
    return res.data.data!;
  },
  create: async (data: PostInput): Promise<Post> => {
    const res = await apiClient.post<ApiResponse<Post>>('/posts', data);
    return res.data.data!;
  },
  update: async (id: string, data: Partial<PostInput>): Promise<Post> => {
    const res = await apiClient.put<ApiResponse<Post>>(`/posts/${id}`, data);
    return res.data.data!;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/posts/${id}`);
  },
};
