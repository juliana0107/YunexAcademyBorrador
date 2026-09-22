import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoginInput } from '@yunexacademy/shared-types';
import { useAuthStore } from '../store/auth.store';
import * as authApi from '../api/auth.api';

/**
 * Hook principal de autenticación.
 * Expone el usuario, estado y acciones (login, logout).
 */
export function useAuth() {
  const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const login = useCallback(
    async (input: LoginInput) => {
      const result = await authApi.login(input);
      setAuth(result.user, result.tokens.accessToken);
      return result;
    },
    [setAuth]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Si el backend falla, igual cerramos sesión en el cliente
    }
    clearAuth();
    navigate('/login', { replace: true });
  }, [clearAuth, navigate]);

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
  };
}