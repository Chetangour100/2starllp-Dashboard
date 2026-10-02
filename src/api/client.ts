import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";

import {
  API_CONFIG,
  HTTP_STATUS,
  API_ERROR_TYPES,
} from "./config";

import {
  ApiResponse,
  ApiError,
  ApiRequestOptions,
} from "./types";

/* =====================================================
   API CLIENT
===================================================== */

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.defaultHeaders =
      API_CONFIG.DEFAULT_HEADERS;

    this.timeout = API_CONFIG.TIMEOUT;

    console.log(
      "API BASE URL:",
      this.baseURL
    );

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: this.defaultHeaders,
    });

    /* =================================================
       REQUEST INTERCEPTOR
    ================================================= */

    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token =
          this.getAuthToken();

        if (token) {
          config.headers.Authorization =
            `Bearer ${token}`;
        }

        console.log(
          "========== API REQUEST =========="
        );

        console.log(
          "Method:",
          config.method?.toUpperCase()
        );

        console.log(
          "URL:",
          `${this.baseURL}${config.url}`
        );

        console.log(
          "Body:",
          config.data
        );

        console.log(
          "Token:",
          token
            ? "Present"
            : "Missing"
        );

        console.log(
          "=================================="
        );

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    /* =================================================
       RESPONSE INTERCEPTOR
    ================================================= */

    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(
          "API RESPONSE:",
          response.status,
          response.config.url,
          response.data
        );

        return response;
      },

      (error) => {
        console.error(
          "API ERROR:",
          error.response?.status,
          error.config?.url,
          error.message
        );

        /* ---------------------------------------------
           UNAUTHORIZED
        --------------------------------------------- */

        if (
          error.response?.status ===
          HTTP_STATUS.UNAUTHORIZED
        ) {
          const isLoginRequest =
            error.config?.url?.includes(
              "/auth/login"
            );

          if (!isLoginRequest) {
            this.clearAuthTokens();

            if (
              typeof window !==
              "undefined"
            ) {
              window.dispatchEvent(
                new CustomEvent(
                  "auth:logout"
                )
              );
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /* =====================================================
     GET AUTH TOKEN
  ===================================================== */

  private getAuthToken(): string | null {
    if (
      typeof window ===
      "undefined"
    ) {
      return null;
    }

    return localStorage.getItem(
      "accessToken"
    );
  }

  /* =====================================================
     CLEAR AUTH TOKENS
  ===================================================== */

  private clearAuthTokens(): void {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    localStorage.removeItem(
      "accessToken"
    );

    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "isAuthenticated"
    );
  }

  /* =====================================================
     ERROR HANDLER
  ===================================================== */

  private handleError(
    error: any
  ): ApiError {
    let apiError: ApiError = {
      type:
        API_ERROR_TYPES.UNKNOWN_ERROR,

      message:
        "An unexpected error occurred",

      timestamp:
        new Date().toISOString(),
    };

    /* ---------------------------------------------
       TIMEOUT
    --------------------------------------------- */

    if (
      error?.code ===
      "ECONNABORTED"
    ) {
      apiError = {
        type:
          API_ERROR_TYPES.TIMEOUT_ERROR,

        message:
          "Request timeout",

        timestamp:
          new Date().toISOString(),
      };
    }

    /* ---------------------------------------------
       NETWORK ERROR
    --------------------------------------------- */

    else if (
      error?.message ===
      "Network Error"
    ) {
      apiError = {
        type:
          API_ERROR_TYPES.NETWORK_ERROR,

        message:
          "Network error - please check your connection",

        timestamp:
          new Date().toISOString(),
      };
    }

    /* ---------------------------------------------
       SERVER RESPONSE ERROR
    --------------------------------------------- */

    else if (error?.response) {
      const {
        status,
        data,
      } = error.response;

      apiError = {
        type:
          this.getErrorType(
            status
          ),

        message:
          data?.message ||
          data?.error ||
          `HTTP ${status} error`,

        status,

        errors:
          data?.errors,

        timestamp:
          new Date().toISOString(),
      };
    }

    /* ---------------------------------------------
       NO SERVER RESPONSE
    --------------------------------------------- */

    else if (error?.request) {
      apiError = {
        type:
          API_ERROR_TYPES.NETWORK_ERROR,

        message:
          "No response received from server",

        timestamp:
          new Date().toISOString(),
      };
    }

    /* ---------------------------------------------
       NORMAL ERROR
    --------------------------------------------- */

    else if (error?.message) {
      apiError = {
        type:
          API_ERROR_TYPES.UNKNOWN_ERROR,

        message:
          error.message,

        timestamp:
          new Date().toISOString(),
      };
    }

    return apiError;
  }

  /* =====================================================
     ERROR TYPE
  ===================================================== */

  private getErrorType(
    status: number
  ): string {
    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
      case HTTP_STATUS.UNPROCESSABLE_ENTITY:
        return API_ERROR_TYPES.VALIDATION_ERROR;

      case HTTP_STATUS.UNAUTHORIZED:
        return API_ERROR_TYPES.AUTHENTICATION_ERROR;

      case HTTP_STATUS.FORBIDDEN:
        return API_ERROR_TYPES.AUTHORIZATION_ERROR;

      case HTTP_STATUS.NOT_FOUND:
        return API_ERROR_TYPES.NOT_FOUND_ERROR;

      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return API_ERROR_TYPES.SERVER_ERROR;

      default:
        return API_ERROR_TYPES.UNKNOWN_ERROR;
    }
  }

  /* =====================================================
     REQUEST
  ===================================================== */

  async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = "GET",
      headers = {},
      body,
      timeout = this.timeout,
      signal,
    } = options;

    const config: AxiosRequestConfig = {
      method,
      url: endpoint,
      headers,
      timeout,
      signal,
    };

    /* ---------------------------------------------
       REQUEST BODY
    --------------------------------------------- */

    if (
      body !== undefined &&
      method !== "GET"
    ) {
      config.data = body;
    }

    try {
      const response:
        AxiosResponse<any> =
        await this.axiosInstance.request(
          config
        );

      const responseData =
        response.data;

      /* ---------------------------------------------
         EMPTY RESPONSE
      --------------------------------------------- */

      if (!responseData) {
        return {
          success: true,
          data: undefined,
        };
      }

      /* =================================================
         STANDARD BACKEND RESPONSE
         
         {
           statusCode: 200,
           responseCode: "SUCCESS",
           message: "...",
           data: {...}
         }
      ================================================= */

      if (
        typeof responseData ===
          "object" &&
        responseData !== null &&
        "statusCode" in responseData
      ) {
        const statusCode =
          Number(
            responseData.statusCode
          );

        const success =
          statusCode >= 200 &&
          statusCode < 300;

        if (!success) {
          throw {
            type:
              this.getErrorType(
                statusCode
              ),

            message:
              responseData.message ||
              `Request failed with status ${statusCode}`,

            status: statusCode,

            timestamp:
              new Date().toISOString(),
          };
        }

        /*
         * IMPORTANT:
         *
         * Backend:
         *
         * responseData.data
         *
         * is returned as:
         *
         * ApiResponse.data
         */

        return {
          success: true,

          data:
            responseData.data,

          message:
            responseData.message,
        };
      }

      /* =================================================
         ALREADY NORMALIZED RESPONSE
      ================================================= */

      return responseData as ApiResponse<T>;
    } catch (error: any) {
      /* ---------------------------------------------
         ALREADY FORMATTED API ERROR
      --------------------------------------------- */

      if (
        error &&
        typeof error ===
          "object" &&
        "type" in error &&
        "message" in error
      ) {
        throw error;
      }

      throw this.handleError(
        error
      );
    }
  }

  /* =====================================================
     GET
  ===================================================== */

  async get<T = any>(
    endpoint: string,
    options?: Omit<
      ApiRequestOptions,
      "method"
    >
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        ...options,
        method: "GET",
      }
    );
  }

  /* =====================================================
     POST
  ===================================================== */

  async post<T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<
      ApiRequestOptions,
      "method" | "body"
    >
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        ...options,
        method: "POST",
        body,
      }
    );
  }

  /* =====================================================
     PUT
  ===================================================== */

  async put<T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<
      ApiRequestOptions,
      "method" | "body"
    >
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        ...options,
        method: "PUT",
        body,
      }
    );
  }

  /* =====================================================
     PATCH
  ===================================================== */

  async patch<T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<
      ApiRequestOptions,
      "method" | "body"
    >
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        ...options,
        method: "PATCH",
        body,
      }
    );
  }

  /* =====================================================
     DELETE
  ===================================================== */

  async delete<T = any>(
    endpoint: string,
    options?: Omit<
      ApiRequestOptions,
      "method"
    >
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        ...options,
        method: "DELETE",
      }
    );
  }

  /* =====================================================
     UPLOAD
  ===================================================== */

  async upload<T = any>(
    endpoint: string,
    formData: FormData,
    options?: Omit<
      ApiRequestOptions,
      "method" | "body"
    >
  ): Promise<ApiResponse<T>> {
    try {
      const response =
        await this.axiosInstance.post(
          endpoint,
          formData,
          {
            ...options,

            headers: {
              ...options?.headers,

              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      const responseData =
        response.data;

      /* ---------------------------------------------
         STANDARD RESPONSE
      --------------------------------------------- */

      if (
        responseData &&
        typeof responseData ===
          "object" &&
        "statusCode" in
          responseData
      ) {
        return {
          success: true,

          data:
            responseData.data,

          message:
            responseData.message,
        };
      }

      return responseData;
    } catch (error) {
      throw this.handleError(
        error
      );
    }
  }

  /* =====================================================
     REFRESH TOKEN
  ===================================================== */

  async refreshToken(): Promise<boolean> {
    /*
     * Refresh-token functionality
     * is not implemented yet.
     */

    return false;
  }

  /* =====================================================
     LOGOUT
  ===================================================== */

  logout(): void {
    this.clearAuthTokens();
  }
}

/* =====================================================
   API CLIENT INSTANCE
===================================================== */

export const apiClient =
  new ApiClient();

export default apiClient;