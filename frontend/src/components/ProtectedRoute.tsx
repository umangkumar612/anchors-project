import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="py-10 text-center text-sm text-slate-500">Loading...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
