import { apiClient } from "../client";
import { API_CONFIG } from "../config";
import { isMockDataEnabled, mockDelay } from "../mock";
import type { ReportParams, ReportsData } from "../types/payrollTypes";
import type { ReportPeriod } from "@/data/reportsData";
import {
  getReportSummary,
  getPayrollSummaryRows,
  getTaxDeductionRows,
  getDepartmentReportRows,
  getPaymentStatusRows,
  getDepartmentChartData,
  getMonthlyPayrollChartData,
} from "@/data/reportsData";

function buildReportsData(period: ReportPeriod = "ytd"): ReportsData {
  return {
    summary: getReportSummary(period),
    payrollSummary: getPayrollSummaryRows(period),
    taxDeductions: getTaxDeductionRows(period),
    departments: getDepartmentReportRows(),
    paymentStatus: getPaymentStatusRows(),
    departmentChart: getDepartmentChartData(),
    monthlyPayrollChart: getMonthlyPayrollChartData(period),
  };
}

export const reportService = {
  async getReports(params: ReportParams = {}): Promise<ReportsData> {
    const period = params.period ?? "ytd";

    if (isMockDataEnabled()) {
      return mockDelay(buildReportsData(period));
    }

    const response = await apiClient.get<ReportsData>(
      `${API_CONFIG.ENDPOINTS.REPORTS.SUMMARY}?period=${period}`,
    );
    return response.data ?? buildReportsData(period);
  },
};
