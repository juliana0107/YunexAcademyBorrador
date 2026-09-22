import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@yunexacademy/shared-types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  /** Última vez que se sincronizó el usuario desde el backend */
  lastFetchedAt: number | null;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  setUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      lastFetchedAt: null,

      setAuth: (user, token) => {
        localStorage.setItem('yunex.auth.token', token);
        set({
          user,
          token,
          isAuthenticated: true,
          lastFetchedAt: Date.now(),
        });
      },

      setUser: (user) => {
        set({ user, lastFetchedAt: Date.now() });
      },

      clearAuth: () => {
        localStorage.removeItem('yunex.auth.token');
        localStorage.removeItem('yunex.auth.user');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          lastFetchedAt: null,
        });
      },
    }),
    {
      name: 'yunex.auth.user',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        lastFetchedAt: state.lastFetchedAt,
      }),
    }
  )
);