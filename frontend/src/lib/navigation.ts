import type { User } from '../types/api';

export function homePath(user: Pick<User, 'role'> | null | undefined) {
  return user?.role === 'admin' ? '/admin' : '/dashboard';
}