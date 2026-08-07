import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../providers/auth-context';

export function AdminRoute() {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
