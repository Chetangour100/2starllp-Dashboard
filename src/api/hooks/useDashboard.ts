import { useQuery } from "@tanstack/react-query";

import { dashboardService } from "../services/dashboardService";

export const dashboardKeys = {
  all: ["dashboard"] as const,

  overview: () =>
    [...dashboardKeys.all, "overview"] as const,
};

export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.overview(),

    queryFn: () =>
      dashboardService.getOverview(),

    staleTime: 2 * 60 * 1000,

    retry: 1,
  });
}