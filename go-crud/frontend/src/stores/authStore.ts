import { create } from 'zustand';
import type { User, UserRole } from '../types/global.types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  hasMinRole: (minRole: UserRole) => boolean;
}

const roleWeight: Record<UserRole, number> = {
  user: 1,
  admin: 2,
  superadmin: 3,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('auth_user') || 'null'),
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('auth_user', JSON.stringify(user));
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    set({ user, accessToken, refreshToken, isAuthenticated: true });
  },

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    set({ accessToken, refreshToken, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  isSuperAdmin: () => get().user?.role === 'superadmin',
  isAdmin: () => get().user?.role === 'admin' || get().user?.role === 'superadmin',
  hasMinRole: (minRole: UserRole) => {
    const userRole = get().user?.role || 'user';
    return roleWeight[userRole] >= roleWeight[minRole];
  },
}));
