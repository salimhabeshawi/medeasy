import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/auth-context';

export function ProtectedRoute() {
  const { token, isBooting } = useAuth();
  const location = useLocation();

  if (isBooting) {
    return null;
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
