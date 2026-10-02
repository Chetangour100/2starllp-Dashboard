import { useQuery } from "@tanstack/react-query";
import { reportService } from "../services/reportService";
import type { ReportPeriod } from "@/data/reportsData";

export const reportKeys = {
  all: ["reports"] as const,
  data: (period: ReportPeriod) => [...reportKeys.all, period] as const,
};

export function useReports(period: ReportPeriod = "ytd") {
  return useQuery({
    queryKey: reportKeys.data(period),
    queryFn: () => reportService.getReports({ period }),
    staleTime: 2 * 60 * 1000,
  });
}
