// src/components/auth/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useSupabase } from '../../context/SupabaseContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  staffOnly?: boolean;
}

export const ProtectedRoute = ({ children, staffOnly = false }: ProtectedRouteProps) => {
  const { user, profile, loading } = useSupabase();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/student/login" />;
  }

  if (staffOnly && profile?.role !== 'staff') {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};