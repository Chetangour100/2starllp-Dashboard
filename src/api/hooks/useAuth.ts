import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '../services/authService';
import { LoginRequest, User, Verify2FARequest } from '../types';
import { useNavigate } from 'react-router-dom';

// Query keys for authentication
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Get current user
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: authKeys.user(),
    queryFn: () => AuthService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => {
      return AuthService.login(credentials);
    },
    onSuccess: async (response) => {
      if (response.success && response.data) {
        // TODO: 2FA logic commented out - no APIs available yet
        // Check if 2FA is required (legacy support)
        // const loginData = response.data as any;
        // if (loginData.requiresOTP) {
        //   // Don't navigate - 2FA verification is needed
        //   return;
        // }
        
        // Small delay to ensure localStorage is fully written
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Get user from localStorage (stored by AuthService.login)
        const user = AuthService.getCurrentUser();
        if (user) {
          // Update user in cache
          queryClient.setQueryData(authKeys.user(), user);
        }
        
        // Invalidate and refetch user to ensure context is updated
        await queryClient.invalidateQueries({ queryKey: authKeys.user() });
        
        // Navigate to admin dashboard after successful login
        // Use setTimeout to ensure React has time to update context
        setTimeout(() => {
          navigate('/admin', { replace: true });
        }, 100);
      }
    },
    onError: (error) => {
      // Don't navigate on error - let the component handle it
    },
  });

  // Verify 2FA mutation - COMMENTED OUT: No 2FA APIs available yet
  // const verify2FAMutation = useMutation({
  //   mutationFn: (otpData: Verify2FARequest) => {
  //     return AuthService.verify2FA(otpData);
  //   },
  //   onSuccess: (response) => {
  //     if (response.success && response.data) {
  //       // Update user in cache
  //       queryClient.setQueryData(authKeys.user(), response.data.user);
  //       
  //       // Navigate to admin dashboard after successful 2FA verification
  //       navigate('/admin', { replace: true });
  //     }
  //   },
  //   onError: (error) => {
  //     // Don't navigate on error - let the component handle it
  //   },
  // });
  
  // Placeholder mutation to prevent errors
  const verify2FAMutation = {
    mutate: () => {},
    isPending: false,
    error: null,
  };

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => AuthService.logout(),
    onSuccess: () => {
      // Clear all queries from cache
      queryClient.clear();
      
      // Navigate to login page
      navigate('/');
    },
    onError: () => {
      // Clear cache even if API call fails
      queryClient.clear();
      navigate('/');
    },
  });

  // Refresh token mutation
  const refreshTokenMutation = useMutation({
    mutationFn: () => Promise.resolve(AuthService.getRefreshToken()),
    onSuccess: (success) => {
      if (!success) {
        // Token refresh failed, logout user
        logoutMutation.mutate();
      }
    },
    onError: () => {
      // Token refresh failed, logout user
      logoutMutation.mutate();
    },
  });

  // Calculate isAuthenticated based on both user query and localStorage
  const isAuthenticated = AuthService.isAuthenticated() || !!user;
  
  return {
    // State
    user,
    isAuthenticated,
    isLoading: isLoadingUser,
    
    // Actions
    login: loginMutation.mutate,
    verify2FA: verify2FAMutation.mutate, // COMMENTED OUT: No 2FA APIs available yet
    logout: logoutMutation.mutate,
    refreshToken: refreshTokenMutation.mutate,
    
    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isVerifying2FA: verify2FAMutation.isPending, // COMMENTED OUT: No 2FA APIs available yet
    isLoggingOut: logoutMutation.isPending,
    isRefreshingToken: refreshTokenMutation.isPending,
    
    // Errors
    loginError: loginMutation.error,
    verify2FAError: verify2FAMutation.error, // COMMENTED OUT: No 2FA APIs available yet
    logoutError: logoutMutation.error,
    refreshTokenError: refreshTokenMutation.error,
  };
}; 