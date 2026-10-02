export const API_CONFIG = {
  BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:3000/api',

  TIMEOUT: 10000,

  ANALYTICS_TIMEOUT: 120000,

  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },

  ENDPOINTS: {
    // =====================================================
    // AUTH
    // =====================================================

    AUTH: {
      LOGIN: '/auth/login',
      SIGNUP: '/auth/signup',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      VERIFY_2FA: '/auth/verify-2fa',
    },

    // =====================================================
    // PASSWORD
    // =====================================================

    PASSWORD: {
      CHANGE: '/auth/change-password',

      FORGOT: '/auth/forgot-password',

      VERIFY_OTP: '/auth/verify-reset-otp',

      RESET: '/auth/reset-password',
    },

    // =====================================================
    // ADMIN PROFILE
    // =====================================================

    ADMIN_PROFILE: {
      PROFILE: '/admin-profile',
      PROFILE_AVATAR: '/admin-profile/avatar',
      PROFILE_PASSWORD: '/admin-profile/password',
      PROFILE_PASSWORD_VERIFY_OTP:
        '/admin-profile/password/verify-otp',
      PROFILE_PASSWORD_RESET_REQUEST:
        '/admin-profile/password/reset-request',
      PROFILE_PASSWORD_RESET:
        '/admin-profile/password/reset',
      PROFILE_PREFERENCES:
        '/admin-profile/preferences',
      PROFILE_ACTIVITY:
        '/admin-profile/activity',
      PROFILE_2FA_SETUP:
        '/admin-profile/2fa/setup',
      PROFILE_2FA_ENABLE:
        '/admin-profile/2fa/enable',
      PROFILE_2FA_DISABLE:
        '/admin-profile/2fa/disable',
    },

    // =====================================================
// DASHBOARD
// =====================================================

DASHBOARD: {
  STATS: '/dashboard/stats',
  OVERVIEW: '/dashboard',
},
    // =====================================================
    // EMPLOYEES
    // =====================================================

    EMPLOYEES: {
      LIST: '/employees',

      DETAIL: (id: string) =>
        `/employees/${id}`,
    },

    // =====================================================
    // PAYROLL
    // Backend route:
    // /api/payrolls
    // =====================================================

    PAYROLL: {
      LIST: '/payrolls',

      DETAIL: (id: string) =>
        `/payrolls/${id}`,

      CREATE: '/payrolls',

      PREVIEW: '/payrolls/preview',

      UPDATE: (id: string) =>
        `/payrolls/${id}`,

      DELETE: (id: string) =>
        `/payrolls/${id}`,

      STATS: '/payrolls/stats',

      BANK_FILE: (id: string) =>
        `/payrolls/${id}/bank-file`,

      PAYSLIP: (
        id: string,
        employeeId: string
      ) =>
        `/payrolls/${id}/payslip/${employeeId}`,

      EMPLOYEE_HISTORY: (employeeId: string) =>
        `/payrolls/employee/${employeeId}`,
    },

    // =====================================================
    // PAYMENTS
    // Backend route:
    // /api/payments
    // =====================================================

    PAYMENTS: {
      LIST: '/payments',

      DETAIL: (id: string) =>
        `/payments/${id}`,

      CREATE: '/payments',

      UPDATE: (id: string) =>
        `/payments/${id}`,

      DELETE: (id: string) =>
        `/payments/${id}`,

      STATS: '/payments/stats',
    },

    // =====================================================
    // REPORTS
    // =====================================================

    REPORTS: {
      SUMMARY: '/reports/summary',

      PAYROLL: '/reports/payroll',

      TAX: '/reports/tax-deductions',

      DEPARTMENTS:
        '/reports/departments',

      PAYMENT_STATUS:
        '/reports/payment-status',
    },
  },
} as const;

// =========================================================
// HTTP STATUS CODES
// =========================================================

export const HTTP_STATUS = {
  OK: 200,

  CREATED: 201,

  NO_CONTENT: 204,

  BAD_REQUEST: 400,

  UNAUTHORIZED: 401,

  FORBIDDEN: 403,

  NOT_FOUND: 404,

  CONFLICT: 409,

  UNPROCESSABLE_ENTITY: 422,

  INTERNAL_SERVER_ERROR: 500,
} as const;

// =========================================================
// API ERROR TYPES
// =========================================================

export const API_ERROR_TYPES = {
  NETWORK_ERROR:
    'NETWORK_ERROR',

  TIMEOUT_ERROR:
    'TIMEOUT_ERROR',

  VALIDATION_ERROR:
    'VALIDATION_ERROR',

  AUTHENTICATION_ERROR:
    'AUTHENTICATION_ERROR',

  AUTHORIZATION_ERROR:
    'AUTHORIZATION_ERROR',

  NOT_FOUND_ERROR:
    'NOT_FOUND_ERROR',

  SERVER_ERROR:
    'SERVER_ERROR',

  UNKNOWN_ERROR:
    'UNKNOWN_ERROR',
} as const;