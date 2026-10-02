import { apiClient } from "../client";
import { API_CONFIG } from "../config";
import { isMockDataEnabled, mockDelay } from "../mock";
import type { Employee } from "../types/payrollTypes";
import { employees, getEmployeeById } from "@/data/employeesData";

export const employeeService = {
  async getAll(): Promise<Employee[]> {
    if (isMockDataEnabled()) {
      return mockDelay(employees);
    }

    const response = await apiClient.get<Employee[]>(
      API_CONFIG.ENDPOINTS.EMPLOYEES.LIST,
    );
    return response.data ?? [];
  },

  async getById(id: string): Promise<Employee | undefined> {
    if (isMockDataEnabled()) {
      return mockDelay(getEmployeeById(id));
    }

    const response = await apiClient.get<Employee>(
      API_CONFIG.ENDPOINTS.EMPLOYEES.DETAIL(id),
    );
    return response.data;
  },
};
