export type {
  ReportPeriod,
  ReportSummary,
  PayrollSummaryRow,
  TaxDeductionRow,
  DepartmentReportRow,
  PaymentStatusRow,
  ReportChartPoint,
} from "@/data/reportsData";

export type { Employee, EmployeeStatus } from "@/data/employeesData";
export type { PayrollRun, PayrollStatus } from "@/data/payrollData";
export type { Transaction, PaymentStatus, PaymentMethod } from "@/data/paymentsData";

export interface DashboardData {
  stats: {
    totalEmployees: number;
    employeesTrend: string;
    payrollThisMonth: number;
    payrollMonthTrend: string;
    payrollThisYear: number;
    payrollYearTrend: string;
    nextPayrollDate: string;
    payrollFrequency: string;
  };
  employeesChart: { month: string; value: number }[];
  payrollChart: { month: string; value: number }[];
  recentEmployees: {
    id: string;
    name: string;
    department: string;
    joiningDate: string;
  }[];
  recentPayrolls: {
    month: string;
    totalEmployees: number;
    totalPayroll: number;
    status: "Completed" | "Processing" | "Pending";
  }[];
  recentPayments: {
    employee: string;
    amount: number;
    date: string;
    status: "Paid" | "Pending" | "Failed";
  }[];
}

export interface ReportsData {
  summary: import("@/data/reportsData").ReportSummary;
  payrollSummary: import("@/data/reportsData").PayrollSummaryRow[];
  taxDeductions: import("@/data/reportsData").TaxDeductionRow[];
  departments: import("@/data/reportsData").DepartmentReportRow[];
  paymentStatus: import("@/data/reportsData").PaymentStatusRow[];
  departmentChart: import("@/data/reportsData").ReportChartPoint[];
  monthlyPayrollChart: import("@/data/reportsData").ReportChartPoint[];
}

export interface EmployeeListParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
}

export interface PayrollListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface PaymentListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  method?: string;
}

export interface ReportParams {
  period?: import("@/data/reportsData").ReportPeriod;
}
