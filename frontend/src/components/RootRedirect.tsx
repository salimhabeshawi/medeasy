import { Navigate } from 'react-router-dom';
import { homePath } from '../lib/navigation';
import { useAuth } from '../providers/auth-context';

export function RootRedirect() {
  const { user, isBooting } = useAuth();

  if (isBooting) {
    return null;
  }

  return <Navigate to={homePath(user)} replace />;
}