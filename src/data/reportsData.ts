import { employees } from "./employeesData";
import { payrollRuns } from "./payrollData";
import { transactions } from "./paymentsData";

export type ReportPeriod = "ytd" | "last-6-months" | "last-3-months" | "this-month";

export interface ReportSummary {
  totalPayrollYtd: number;
  totalDeductionsYtd: number;
  netPayrollYtd: number;
  avgSalary: number;
  activeEmployees: number;
  totalEmployees: number;
  paymentSuccessRate: number;
}

export interface PayrollSummaryRow {
  month: string;
  payrollId: string;
  employees: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  status: string;
}

export interface TaxDeductionRow {
  month: string;
  tds: number;
  pf: number;
  esi: number;
  professionalTax: number;
  totalDeductions: number;
}

export interface DepartmentReportRow {
  department: string;
  headcount: number;
  totalSalary: number;
  avgSalary: number;
  payrollShare: number;
}

export interface PaymentStatusRow {
  status: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface ReportChartPoint {
  label: string;
  value: number;
}

export const reportPeriods: { value: ReportPeriod; label: string }[] = [
  { value: "ytd", label: "Year to Date" },
  { value: "last-6-months", label: "Last 6 Months" },
  { value: "last-3-months", label: "Last 3 Months" },
  { value: "this-month", label: "This Month" },
];

function filterPayrollsByPeriod(period: ReportPeriod) {
  const completed = payrollRuns.filter((p) => p.status === "Completed");
  switch (period) {
    case "this-month":
      return completed.slice(0, 1);
    case "last-3-months":
      return completed.slice(0, 3);
    case "last-6-months":
      return completed.slice(0, 6);
    case "ytd":
    default:
      return completed;
  }
}

export function getReportSummary(period: ReportPeriod = "ytd"): ReportSummary {
  const filtered = filterPayrollsByPeriod(period);
  const totalGross = filtered.reduce((sum, p) => sum + p.grossPayroll, 0);
  const totalDeductions = filtered.reduce((sum, p) => sum + p.deductions, 0);
  const netPayroll = filtered.reduce((sum, p) => sum + p.netPayroll, 0);
  const activeEmployees = employees.filter((e) => e.status === "Active").length;
  const avgSalary =
    employees.length > 0
      ? Math.round(employees.reduce((sum, e) => sum + e.salary, 0) / employees.length)
      : 0;
  const paidCount = transactions.filter((t) => t.status === "Paid").length;
  const paymentSuccessRate =
    transactions.length > 0 ? Math.round((paidCount / transactions.length) * 100) : 0;

  return {
    totalPayrollYtd: totalGross,
    totalDeductionsYtd: totalDeductions,
    netPayrollYtd: netPayroll,
    avgSalary,
    activeEmployees,
    totalEmployees: employees.length,
    paymentSuccessRate,
  };
}

export function getPayrollSummaryRows(period: ReportPeriod = "ytd"): PayrollSummaryRow[] {
  return filterPayrollsByPeriod(period).map((p) => ({
    month: p.month,
    payrollId: p.id,
    employees: p.totalEmployees,
    grossPay: p.grossPayroll,
    deductions: p.deductions,
    netPay: p.netPayroll,
    status: p.status,
  }));
}

/** Mock tax split — replace with backend fields when API is ready */
export function getTaxDeductionRows(period: ReportPeriod = "ytd"): TaxDeductionRow[] {
  return filterPayrollsByPeriod(period).map((p) => {
    const tds = Math.round(p.deductions * 0.45);
    const pf = Math.round(p.deductions * 0.35);
    const esi = Math.round(p.deductions * 0.12);
    const professionalTax = p.deductions - tds - pf - esi;
    return {
      month: p.month,
      tds,
      pf,
      esi,
      professionalTax,
      totalDeductions: p.deductions,
    };
  });
}

export function getDepartmentReportRows(): DepartmentReportRow[] {
  const deptMap = new Map<string, { count: number; totalSalary: number }>();

  for (const emp of employees) {
    const existing = deptMap.get(emp.department) ?? { count: 0, totalSalary: 0 };
    deptMap.set(emp.department, {
      count: existing.count + 1,
      totalSalary: existing.totalSalary + emp.salary,
    });
  }

  const totalSalary = employees.reduce((sum, e) => sum + e.salary, 0);

  return Array.from(deptMap.entries())
    .map(([department, data]) => ({
      department,
      headcount: data.count,
      totalSalary: data.totalSalary,
      avgSalary: Math.round(data.totalSalary / data.count),
      payrollShare: totalSalary > 0 ? Math.round((data.totalSalary / totalSalary) * 100) : 0,
    }))
    .sort((a, b) => b.totalSalary - a.totalSalary);
}

export function getPaymentStatusRows(): PaymentStatusRow[] {
  const statuses = ["Paid", "Pending", "Failed"] as const;
  const total = transactions.length;

  return statuses.map((status) => {
    const matching = transactions.filter((t) => t.status === status);
    return {
      status,
      count: matching.length,
      amount: matching.reduce((sum, t) => sum + t.amount, 0),
      percentage: total > 0 ? Math.round((matching.length / total) * 100) : 0,
    };
  });
}

export function getDepartmentChartData(): ReportChartPoint[] {
  return getDepartmentReportRows().map((row) => ({
    label: row.department,
    value: row.totalSalary,
  }));
}

export function getMonthlyPayrollChartData(period: ReportPeriod = "ytd"): ReportChartPoint[] {
  return filterPayrollsByPeriod(period)
    .slice()
    .reverse()
    .map((p) => ({
      label: p.month,
      value: p.netPayroll,
    }));
}
