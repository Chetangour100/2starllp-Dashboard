import apiClient from "@/api/client";

/* =====================================================
   DASHBOARD STATS
===================================================== */

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

/* =====================================================
   CHART DATA
===================================================== */

export interface DashboardChartData {
  month: string;
  value: number;
}

/* =====================================================
   RECENT EMPLOYEE
===================================================== */

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

  salary?: number;
  status?: string;
}

/* =====================================================
   RECENT PAYROLL
===================================================== */

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

/* =====================================================
   RECENT PAYMENT
===================================================== */

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

/* =====================================================
   COMPLETE DASHBOARD DATA
===================================================== */

export interface DashboardData {
  stats: DashboardStats;

  employeesChart: DashboardChartData[];

  payrollChart: DashboardChartData[];

  recentEmployees: DashboardEmployee[];

  recentPayrolls: DashboardPayroll[];

  recentPayments: DashboardPayment[];
}

/* =====================================================
   DEFAULT STATS
===================================================== */

const defaultStats: DashboardStats = {
  totalEmployees: 0,

  payrollThisMonth: 0,

  payrollThisYear: 0,

  nextPayrollDate: null,

  payrollFrequency: "Monthly",

  employeesTrend: 0,

  payrollMonthTrend: 0,

  payrollYearTrend: 0,
};

/* =====================================================
   LAST 6 MONTHS
===================================================== */

function getLastSixMonths(): string[] {
  const months: string[] = [];

  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - i,
      1
    );

    months.push(
      date.toLocaleString("en-US", {
        month: "short",
      })
    );
  }

  return months;
}

/* =====================================================
   NORMALIZE CHART
===================================================== */

function normalizeChartData(
  chart: unknown
): DashboardChartData[] {
  if (!Array.isArray(chart)) {
    return [];
  }

  return chart
    .map((item: any) => ({
      month:
        item?.month ??
        item?.label ??
        item?.name ??
        "",

      value:
        Number(
          item?.value ??
          item?.count ??
          item?.total ??
          item?.amount ??
          0
        ) || 0,
    }))
    .filter(
      (item) => item.month !== ""
    );
}

/* =====================================================
   KEEP ONLY LAST 6 MONTHS
===================================================== */

function getSixMonthChart(
  chart: unknown
): DashboardChartData[] {
  const months = getLastSixMonths();

  const normalized =
    normalizeChartData(chart);

  /*
   * If backend already returns 6 months,
   * use them directly.
   */

  if (normalized.length <= 6) {
    return normalized;
  }

  /*
   * If backend returns more than 6 months,
   * keep the latest 6 records.
   */

  return normalized.slice(-6);
}

/* =====================================================
   DASHBOARD SERVICE
===================================================== */

export const dashboardService = {
  async getOverview(): Promise<DashboardData> {
    const response =
      await apiClient.get<any>("/dashboard");

    console.log(
      "========== DASHBOARD SERVICE =========="
    );

    console.log(
      "API CLIENT RESPONSE:",
      response
    );

    /*
     * Supports both:
     *
     * 1. Wrapped:
     * {
     *   success: true,
     *   data: {
     *     stats: ...
     *   }
     * }
     *
     * 2. Direct:
     * {
     *   stats: ...
     * }
     */

    const rawData =
      response?.data ??
      response;

    console.log(
      "DASHBOARD RAW DATA:",
      rawData
    );

    console.log(
      "========================================"
    );

    if (
      !rawData ||
      typeof rawData !== "object"
    ) {
      throw new Error(
        "Dashboard data not found in server response."
      );
    }

    const data = rawData as any;

    /* =================================================
       STATS
    ================================================= */

    const stats: DashboardStats = {
      totalEmployees:
        Number(
          data?.stats?.totalEmployees ??
          data?.totalEmployees ??
          0
        ) || 0,

      payrollThisMonth:
        Number(
          data?.stats?.payrollThisMonth ??
          data?.payrollThisMonth ??
          0
        ) || 0,

      payrollThisYear:
        Number(
          data?.stats?.payrollThisYear ??
          data?.payrollThisYear ??
          0
        ) || 0,

      nextPayrollDate:
        data?.stats?.nextPayrollDate ??
        data?.nextPayrollDate ??
        null,

      payrollFrequency:
        data?.stats?.payrollFrequency ??
        data?.payrollFrequency ??
        "Monthly",

      employeesTrend:
        Number(
          data?.stats?.employeesTrend ??
          data?.employeesTrend ??
          0
        ) || 0,

      payrollMonthTrend:
        Number(
          data?.stats?.payrollMonthTrend ??
          data?.payrollMonthTrend ??
          0
        ) || 0,

      payrollYearTrend:
        Number(
          data?.stats?.payrollYearTrend ??
          data?.payrollYearTrend ??
          0
        ) || 0,
    };

    /* =================================================
       CHARTS
    ================================================= */

    const employeesChart = getSixMonthChart(
      data?.employeesChart ??
      data?.employeeChart ??
      data?.employeeMonthlyData ??
      []
    );

    const payrollChart = getSixMonthChart(
      data?.payrollChart ??
      data?.payrollMonthlyData ??
      []
    );

    /* =================================================
       RECENT DATA
    ================================================= */

    const recentEmployees =
      Array.isArray(
        data?.recentEmployees
      )
        ? data.recentEmployees
        : [];

    const recentPayrolls =
      Array.isArray(
        data?.recentPayrolls
      )
        ? data.recentPayrolls
        : [];

    const recentPayments =
      Array.isArray(
        data?.recentPayments
      )
        ? data.recentPayments
        : [];

    /* =================================================
       FINAL DATA
    ================================================= */

    return {
      stats,

      employeesChart,

      payrollChart,

      recentEmployees,

      recentPayrolls,

      recentPayments,
    };
  },
};

export default dashboardService;