import { apiClient } from "../client";
import { API_CONFIG } from "../config";
import { isMockDataEnabled, mockDelay } from "../mock";
import type { Transaction } from "../types/payrollTypes";
import { transactions, paymentStats, getTransactionById } from "@/data/paymentsData";

export const paymentService = {
  async getAll(): Promise<Transaction[]> {
    if (isMockDataEnabled()) {
      return mockDelay(transactions);
    }

    const response = await apiClient.get<Transaction[]>(
      API_CONFIG.ENDPOINTS.PAYMENTS.LIST,
    );
    return response.data ?? [];
  },

  async getById(id: string): Promise<Transaction | undefined> {
    if (isMockDataEnabled()) {
      return mockDelay(getTransactionById(id));
    }

    const response = await apiClient.get<Transaction>(
      API_CONFIG.ENDPOINTS.PAYMENTS.DETAIL(id),
    );
    return response.data;
  },

  async getStats() {
    if (isMockDataEnabled()) {
      return mockDelay(paymentStats);
    }

    const response = await apiClient.get(API_CONFIG.ENDPOINTS.PAYMENTS.STATS);
    return response.data ?? paymentStats;
  },
};
