import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../providers/auth-context';

export function StudentRoute() {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}