import { useQuery } from "@tanstack/react-query";
import { employeeService } from "../services/employeeService";

export const employeeKeys = {
  all: ["employees"] as const,
  list: () => [...employeeKeys.all, "list"] as const,
  detail: (id: string) => [...employeeKeys.all, "detail", id] as const,
};

export function useEmployees() {
  return useQuery({
    queryKey: employeeKeys.list(),
    queryFn: () => employeeService.getAll(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => employeeService.getById(id),
    enabled: !!id,
  });
}
