import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store/store';
import { AuthService } from '@/api/services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, loadingState } = useSelector((state: RootState) => state.auth);
  
  // Also check localStorage as fallback (in case Redux hasn't rehydrated yet)
  const isAuthFromStorage = AuthService.isAuthenticated();

  // Show loading state while checking authentication
  if (loadingState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check both Redux state and localStorage
  if (!isAuthenticated && !isAuthFromStorage) {
    // Redirect to login page with the intended destination
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}; 