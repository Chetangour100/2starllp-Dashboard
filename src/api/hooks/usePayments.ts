import { useQuery } from "@tanstack/react-query";
import { paymentService } from "../services/paymentService";

export const paymentKeys = {
  all: ["payments"] as const,
  list: () => [...paymentKeys.all, "list"] as const,
  detail: (id: string) => [...paymentKeys.all, "detail", id] as const,
  stats: () => [...paymentKeys.all, "stats"] as const,
};

export function usePayments() {
  return useQuery({
    queryKey: paymentKeys.list(),
    queryFn: () => paymentService.getAll(),
    staleTime: 2 * 60 * 1000,
  });
}

export function usePaymentStats() {
  return useQuery({
    queryKey: paymentKeys.stats(),
    queryFn: () => paymentService.getStats(),
    staleTime: 2 * 60 * 1000,
  });
}
