export type PayrollStatus = "Completed" | "Pending" | "Processing";

export interface EmployeePayrollRow {
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  monthlySalary: number;
  grossSalary: number;
  totalDays: number;
  workingDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  absentDays: number;
  leaveDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  bankName: string | null;
  bankAccount: string | null;
  ifscCode: string | null;
  paymentStatus: "Pending" | "Processing" | "Paid" | "Failed";
  transactionId: string | null;
  paidAt: string | null;
  paymentMethod: string;
}

export interface PayrollRun {
  id: string;
  month: string;
  periodStart: string;
  periodEnd: string;
  totalEmployees: number;
  grossPayroll: number;
  deductions: number;
  netPayroll: number;
  status: PayrollStatus;
  processedDate: string | null;
  processedBy: string | null;
  employeePayrolls?: EmployeePayrollRow[];
  departmentBreakdown: {
    department: string;
    employees: number;
    amount: number;
  }[];
  notes?: string;
}

export const payrollRuns: PayrollRun[] = [
  {
    id: "PR-2025-05",
    month: "May 2025",
    periodStart: "2025-05-01",
    periodEnd: "2025-05-31",
    totalEmployees: 128,
    grossPayroll: 1980000,
    deductions: 105000,
    netPayroll: 1875000,
    status: "Completed",
    processedDate: "2025-05-31",
    processedBy: "Admin User",
    departmentBreakdown: [
      { department: "IT", employees: 32, amount: 520000 },
      { department: "HR", employees: 12, amount: 180000 },
      { department: "Finance", employees: 18, amount: 290000 },
      { department: "Operations", employees: 28, amount: 380000 },
      { department: "Sales", employees: 22, amount: 310000 },
      { department: "Marketing", employees: 16, amount: 195000 },
    ],
    notes: "May payroll processed successfully. All payments disbursed.",
  },
  {
    id: "PR-2025-04",
    month: "Apr 2025",
    periodStart: "2025-04-01",
    periodEnd: "2025-04-30",
    totalEmployees: 123,
    grossPayroll: 1850000,
    deductions: 100000,
    netPayroll: 1750000,
    status: "Completed",
    processedDate: "2025-04-30",
    processedBy: "Admin User",
    departmentBreakdown: [
      { department: "IT", employees: 30, amount: 490000 },
      { department: "HR", employees: 11, amount: 170000 },
      { department: "Finance", employees: 17, amount: 275000 },
      { department: "Operations", employees: 27, amount: 360000 },
      { department: "Sales", employees: 21, amount: 295000 },
      { department: "Marketing", employees: 17, amount: 160000 },
    ],
  },
  {
    id: "PR-2025-03",
    month: "Mar 2025",
    periodStart: "2025-03-01",
    periodEnd: "2025-03-31",
    totalEmployees: 118,
    grossPayroll: 1780000,
    deductions: 100000,
    netPayroll: 1680000,
    status: "Completed",
    processedDate: "2025-03-31",
    processedBy: "Admin User",
    departmentBreakdown: [
      { department: "IT", employees: 28, amount: 470000 },
      { department: "HR", employees: 10, amount: 165000 },
      { department: "Finance", employees: 16, amount: 260000 },
      { department: "Operations", employees: 26, amount: 345000 },
      { department: "Sales", employees: 20, amount: 280000 },
      { department: "Marketing", employees: 18, amount: 160000 },
    ],
  },
  {
    id: "PR-2025-02",
    month: "Feb 2025",
    periodStart: "2025-02-01",
    periodEnd: "2025-02-28",
    totalEmployees: 112,
    grossPayroll: 1705000,
    deductions: 95000,
    netPayroll: 1610000,
    status: "Completed",
    processedDate: "2025-02-28",
    processedBy: "Admin User",
    departmentBreakdown: [
      { department: "IT", employees: 26, amount: 450000 },
      { department: "HR", employees: 10, amount: 155000 },
      { department: "Finance", employees: 15, amount: 245000 },
      { department: "Operations", employees: 25, amount: 330000 },
      { department: "Sales", employees: 19, amount: 265000 },
      { department: "Marketing", employees: 17, amount: 160000 },
    ],
  },
  {
    id: "PR-2025-01",
    month: "Jan 2025",
    periodStart: "2025-01-01",
    periodEnd: "2025-01-31",
    totalEmployees: 105,
    grossPayroll: 1640000,
    deductions: 90000,
    netPayroll: 1550000,
    status: "Completed",
    processedDate: "2025-01-31",
    processedBy: "Admin User",
    departmentBreakdown: [
      { department: "IT", employees: 24, amount: 430000 },
      { department: "HR", employees: 9, amount: 145000 },
      { department: "Finance", employees: 14, amount: 235000 },
      { department: "Operations", employees: 24, amount: 315000 },
      { department: "Sales", employees: 18, amount: 255000 },
      { department: "Marketing", employees: 16, amount: 150000 },
    ],
  },
  {
    id: "PR-2025-06",
    month: "Jun 2025",
    periodStart: "2025-06-01",
    periodEnd: "2025-06-30",
    totalEmployees: 130,
    grossPayroll: 2050000,
    deductions: 110000,
    netPayroll: 1940000,
    status: "Processing",
    processedDate: null,
    processedBy: null,
    departmentBreakdown: [
      { department: "IT", employees: 33, amount: 535000 },
      { department: "HR", employees: 12, amount: 185000 },
      { department: "Finance", employees: 18, amount: 295000 },
      { department: "Operations", employees: 29, amount: 390000 },
      { department: "Sales", employees: 23, amount: 320000 },
      { department: "Marketing", employees: 15, amount: 200000 },
    ],
    notes: "June payroll is currently being calculated.",
  },
];

export function getPayrollById(id: string): PayrollRun | undefined {
  return payrollRuns.find((p) => p.id === id);
}

export const payrollStats = {
  totalRuns: payrollRuns.length,
  completedRuns: payrollRuns.filter((p) => p.status === "Completed").length,
  processingRuns: payrollRuns.filter((p) => p.status === "Processing").length,
  pendingRuns: payrollRuns.filter((p) => p.status === "Pending").length,
  latestNetPayroll: payrollRuns.find((p) => p.status === "Completed")?.netPayroll ?? 0,
};
