// ─── Generic API Types ────────────────────────────────────────────────────────

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
}

export interface ApiError {
  message: string;
  type?: string;
  code?: string;
  statusCode?: number;
  status?: number;
  errors?: any[];
  timestamp?: string;
}

export interface ApiRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  signal?: AbortSignal;
}

// ─── Auth / User Types ────────────────────────────────────────────────────────

export interface UserPermission {
  permissionName: string;
  allowedActions: string[] | null;
}

export interface User {
  id: string;
  name?: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  profilePic?: string;
  phone?: string;
  location?: string;
  isActive?: boolean;
  isSuperAdmin?: boolean;
  roles?: { roleName: string }[];
  permissions?: UserPermission[];
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface LoginResponseLegacy {
  accessToken: string;
  refreshToken?: string;
  user?: User;
}

export interface Verify2FARequest {
  code: string;
  tempToken?: string;
}

// ─── Password Types ───────────────────────────────────────────────────────────

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ChangePasswordRequest {
  userId?: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface ChangePasswordResponse {
  message: string;
}

// ─── Address Types ────────────────────────────────────────────────────────────

export interface BusinessAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
}

// ─── UI Component Interface Types ─────────────────────────────────────────────

export interface PaginationControlInterface {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  startItem?: number;
  endItem?: number;
  visiblePages?: (number | string)[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export interface TableSortingInterface {
  children?: React.ReactNode;
  sortKey: string;
  currentSortKey: string;
  currentDirection: 'asc' | 'desc';
  onSort: (key: string) => void;
}

// ─── Dashboard Types ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalEmployees: number;
  payrollThisMonth: number;
  payrollThisYear: number;
  nextPayrollDate: string | null;
  payrollFrequency: string;
  employeesTrend: number;
  payrollMonthTrend: number;
  payrollYearTrend: number;
}

export interface DashboardChartData {
  month: string;
  value: number;
}

export interface DashboardEmployee {
  _id?: string;
  id?: string;
  employeeId?: string;
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  designation?: string;
  joiningDate?: string;
  createdAt?: string;
}

export interface DashboardPayroll {
  _id?: string;
  id?: string;
  payrollId?: string;

  month?: string;
  payrollMonth?: string;

  totalEmployees?: number;

  netPayroll?: number;
  netAmount?: number;
  amount?: number;
  totalPayroll?: number;
  grossPayroll?: number;

  deductions?: number;

  status?: string;

  processedDate?: string;
  payrollDate?: string;
  date?: string;
  createdAt?: string;
}

export interface DashboardPayment {
  _id?: string;
  id?: string;
  paymentId?: string;

  employee?: string;
  employeeId?: string;
  employeeName?: string;
  department?: string;

  amount?: number;

  date?: string;
  paymentDate?: string;
  createdAt?: string;

  status?: string;

  paymentMethod?: string;
  method?: string;

  transactionId?: string;
  bankReference?: string;
  utrNumber?: string;
}

export interface DashboardData {
  stats: DashboardStats;

  employeesChart: DashboardChartData[];

  payrollChart: DashboardChartData[];

  recentEmployees: DashboardEmployee[];

  recentPayrolls: DashboardPayroll[];

  recentPayments: DashboardPayment[];
}