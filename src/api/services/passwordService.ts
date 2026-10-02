import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { 
  ApiResponse, 
  ForgotPasswordRequest, 
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  ChangePasswordResponse
} from '../types';

export class PasswordService {
  // Forgot password - request password reset link
  static async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse<ForgotPasswordResponse>> {
    try {
      const response = await apiClient.post<ForgotPasswordResponse>(
        API_CONFIG.ENDPOINTS.PASSWORD.FORGOT,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Reset password using token from email
  static async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<ResetPasswordResponse>> {
    try {
      const response = await apiClient.post<ResetPasswordResponse>(
        API_CONFIG.ENDPOINTS.PASSWORD.RESET,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Change password (requires authentication)
  static async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<ChangePasswordResponse>> {
    try {
      const response = await apiClient.post<ChangePasswordResponse>(
        API_CONFIG.ENDPOINTS.PASSWORD.CHANGE,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default PasswordService;

