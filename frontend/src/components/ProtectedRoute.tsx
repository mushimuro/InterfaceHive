import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  requireVerified?: boolean;
  redirectTo?: string;
}

/**
 * Protected route wrapper component.
 * 
 * Requires authentication to access nested routes.
 * Optionally requires email verification.
 * 
 * Usage:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/profile" element={<Profile />} />
 *   </Route>
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  requireVerified = false,
  redirectTo = '/auth/login'
}) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Redirect to verification notice if email not verified (when required)
  if (requireVerified && !user.email_verified) {
    return <Navigate to="/auth/verify-email-required" replace />;
  }

  // Render nested routes
  return <Outlet />;
};

export default ProtectedRoute;

