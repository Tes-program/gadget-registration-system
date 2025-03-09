// src/components/auth/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useSupabase } from '../../context/SupabaseContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  staffOnly?: boolean;
  studentOnly?: boolean;
}

export const ProtectedRoute = ({ children, staffOnly = false, studentOnly = false }: ProtectedRouteProps) => {
  const { user, profile, loading } = useSupabase();

  // When authentication is being checked or profile is being fetched, show loading
  if (loading || (user && !profile)) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/student/login" />;
  }

  // Check role-based access
  if (profile) {
    // Staff trying to access student-only routes
    if (studentOnly && profile.role === 'staff') {
      return <Navigate to="/staff/dashboard" />;
    }
    
    // Student trying to access staff-only routes
    if (staffOnly && profile.role !== 'staff') {
      return <Navigate to="/student/dashboard" />;
    }
  }

  return <>{children}</>;
};