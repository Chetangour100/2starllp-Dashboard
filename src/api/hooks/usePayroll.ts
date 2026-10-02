import { useQuery } from "@tanstack/react-query";
import { payrollService } from "../services/payrollService";

export const payrollKeys = {
  all: ["payroll"] as const,
  list: () => [...payrollKeys.all, "list"] as const,
  detail: (id: string) => [...payrollKeys.all, "detail", id] as const,
  stats: () => [...payrollKeys.all, "stats"] as const,
};

export function usePayrollRuns() {
  return useQuery({
    queryKey: payrollKeys.list(),
    queryFn: () => payrollService.getAll(),
    staleTime: 2 * 60 * 1000,
  });
}

export function usePayrollStats() {
  return useQuery({
    queryKey: payrollKeys.stats(),
    queryFn: () => payrollService.getStats(),
    staleTime: 2 * 60 * 1000,
  });
}
