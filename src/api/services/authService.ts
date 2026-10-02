import { apiClient } from '../client';
import { API_CONFIG } from '../config';

import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  LoginResponseLegacy,
  User,
} from '../types';

export interface BackendLoginUser {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

export interface BackendLoginResponse {
  user: BackendLoginUser;
  token: string;
}

export class AuthService {
  /*
   * Login
   *
   * Backend:
   * POST /admin/login
   *
   * Body:
   * {
   *   email,
   *   password
   * }
   *
   * Response:
   * {
   *   statusCode: 200,
   *   message: "Login successful",
   *   data: {
   *     user: {...},
   *     token: "..."
   *   }
   * }
   */
  static async login(
    credentials: LoginRequest
  ): Promise<ApiResponse<BackendLoginResponse>> {
    const loginData = {
      email: credentials.email.trim(),
      password: credentials.password,
    };

    const response =
      await apiClient.post<BackendLoginResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        loginData
      );

    if (
      !response.success ||
      !response.data
    ) {
      throw new Error(
        response.message ||
          'Login failed'
      );
    }

    const backendData = response.data;

    /*
     * Store JWT
     */
    localStorage.setItem(
      'accessToken',
      backendData.token
    );

    /*
     * Backend user -> frontend User
     */
    const userData: User = {
      id: backendData.user.id,

      username:
        backendData.user.email.split('@')[0],

      email: backendData.user.email,

      role: 'admin',

      profilePic: '',

      firstName:
        backendData.user.name
          .split(' ')[0] || '',

      lastName:
        backendData.user.name
          .split(' ')
          .slice(1)
          .join(' ') || '',

      fullName:
        backendData.user.name,

      phone: '',

      location: '',

      isActive:
        backendData.user.isActive,

      permissions: [],

      roles: [],

      isSuperAdmin: false,
    };

    /*
     * Store user
     */
    localStorage.setItem(
      'user',
      JSON.stringify(userData)
    );

    /*
     * Authentication flag
     */
    localStorage.setItem(
      'isAuthenticated',
      'true'
    );

    return response;
  }

  /*
   * Logout
   */
  static async logout(): Promise<
    ApiResponse<any>
  > {
    try {
      const token =
        this.getAccessToken();

      /*
       * Backend currently doesn't expose
       * logout route, so we don't call API.
       */

      if (token) {
        // Token exists, local logout is enough
      }

      this.clearLocalStorage();

      return {
        success: true,
        message:
          'Logged out successfully',
      };
    } catch (error) {
      this.clearLocalStorage();

      throw error;
    }
  }

  /*
   * Check authentication
   */
  static isAuthenticated(): boolean {
    const token =
      localStorage.getItem(
        'accessToken'
      );

    const user =
      localStorage.getItem('user');

    return Boolean(
      token && user
    );
  }

  /*
   * Current logged-in user
   */
  static getCurrentUser(): User | null {
    try {
      const user =
        localStorage.getItem('user');

      if (!user) {
        return null;
      }

      return JSON.parse(user) as User;
    } catch {
      return null;
    }
  }

  /*
   * Access token
   */
  static getAccessToken(): string | null {
    return localStorage.getItem(
      'accessToken'
    );
  }

  /*
   * Refresh token
   *
   * Backend currently doesn't provide one.
   */
  static getRefreshToken(): string | null {
    return null;
  }

  /*
   * Token expiration check
   */
  static isTokenExpired(): boolean {
    const token =
      this.getAccessToken();

    if (!token) {
      return true;
    }

    /*
     * JWT normally contains:
     * header.payload.signature
     */
    try {
      const parts =
        token.split('.');

      if (parts.length !== 3) {
        return false;
      }

      const payload =
        JSON.parse(
          atob(parts[1])
        );

      if (!payload.exp) {
        return false;
      }

      const currentTime =
        Math.floor(
          Date.now() / 1000
        );

      return (
        payload.exp <
        currentTime
      );
    } catch {
      return false;
    }
  }

  /*
   * Clear authentication data
   */
  static clearLocalStorage(): void {
    localStorage.removeItem(
      'accessToken'
    );

    localStorage.removeItem(
      'refreshToken'
    );

    localStorage.removeItem(
      'tempToken'
    );

    localStorage.removeItem(
      'user'
    );

    localStorage.removeItem(
      'sessionId'
    );

    localStorage.removeItem(
      'isSuperAdmin'
    );

    localStorage.removeItem(
      'isAuthenticated'
    );
  }
}

export default AuthService;