import { apiClient } from "../client";
import { API_CONFIG } from "../config";
import { isMockDataEnabled, mockDelay } from "../mock";
import type { PayrollRun } from "../types/payrollTypes";
import { payrollRuns, payrollStats, getPayrollById } from "@/data/payrollData";

export const payrollService = {
  async getAll(): Promise<PayrollRun[]> {
    if (isMockDataEnabled()) {
      return mockDelay(payrollRuns);
    }

    const response = await apiClient.get<PayrollRun[]>(
      API_CONFIG.ENDPOINTS.PAYROLL.LIST,
    );
    return response.data ?? [];
  },

  async getById(id: string): Promise<PayrollRun | undefined> {
    if (isMockDataEnabled()) {
      return mockDelay(getPayrollById(id));
    }

    const response = await apiClient.get<PayrollRun>(
      API_CONFIG.ENDPOINTS.PAYROLL.DETAIL(id),
    );
    return response.data;
  },

  async getStats() {
    if (isMockDataEnabled()) {
      return mockDelay(payrollStats);
    }

    const response = await apiClient.get(API_CONFIG.ENDPOINTS.PAYROLL.STATS);
    return response.data ?? payrollStats;
  },

  /**
   * Downloads the bank transfer CSV file for a payroll run
   * so the admin can upload it to the bank's NEFT bulk-transfer
   * portal, or send it to whoever processes salary transfers.
   */
  async downloadBankFile(id: string): Promise<void> {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYROLL.BANK_FILE(id)}`;

    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      throw new Error("Failed to download bank transfer file");
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `bank-transfer-${id}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(downloadUrl);
  },

  /**
   * Downloads a single employee's payslip (text file) for
   * a given payroll run.
   */
  async downloadPayslip(
    payrollId: string,
    employeeId: string,
  ): Promise<void> {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYROLL.PAYSLIP(payrollId, employeeId)}`;

    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      throw new Error("Failed to download payslip");
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `payslip-${employeeId}-${payrollId}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(downloadUrl);
  },
};
