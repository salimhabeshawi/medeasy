import { createContext, useContext } from 'react';
import type { User } from '../types/api';

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isBooting: boolean;
  login: (input: { email: string; password: string }) => Promise<User>;
  register: (input: { name: string; email: string; password: string; password_confirmation: string; year: number; semester: number }) => Promise<User>;
  updateProfile: (input: { name?: string; email?: string; password?: string; password_confirmation?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
