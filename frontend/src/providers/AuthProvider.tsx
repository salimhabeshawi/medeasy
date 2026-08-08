import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, tokenStore } from '../lib/api';
import type { User } from '../types/api';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => tokenStore.get());
  const [user, setUser] = useState<User | null>(null);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    let active = true;

    async function boot() {
      if (!token) {
        setIsBooting(false);
        return;
      }

      try {
        const me = await api.me();
        if (active) {
          setUser(me);
        }
      } catch {
        tokenStore.clear();
        if (active) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) {
          setIsBooting(false);
        }
      }
    }

    boot();

    return () => {
      active = false;
    };
  }, [token]);

  const login = useCallback(async (input: { email: string; password: string }) => {
    const response = await api.login(input);
    tokenStore.set(response.token);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  }, []);

  const register = useCallback(
    async (input: { name: string; email: string; password: string; password_confirmation: string; year: number; semester: number }) => {
      const response = await api.register(input);
      tokenStore.set(response.token);
      setToken(response.token);
      setUser(response.user);
      return response.user;
    },
    [],
  );

  const updateProfile = useCallback(async (input: { name?: string; email?: string; password?: string; password_confirmation?: string }) => {
    const response = await api.updateProfile(input);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      tokenStore.clear();
      setToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, token, isBooting, login, register, updateProfile, logout }),
    [user, token, isBooting, login, register, updateProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
