export const dashboardStats = {
  totalEmployees: 128,
  employeesTrend: "+5 this month",
  payrollThisMonth: 1875000,
  payrollMonthTrend: "+12.5% from last month",
  payrollThisYear: 9465000,
  payrollYearTrend: "+15.8% from last year",
  nextPayrollDate: "2025-05-31",
  payrollFrequency: "Monthly Payroll",
};

export const employeesChartData = [
  { month: "Dec 2024", value: 100 },
  { month: "Jan 2025", value: 105 },
  { month: "Feb 2025", value: 112 },
  { month: "Mar 2025", value: 118 },
  { month: "Apr 2025", value: 123 },
  { month: "May 2025", value: 128 },
];

export const payrollChartData = [
  { month: "Dec 2024", value: 1420000 },
  { month: "Jan 2025", value: 1550000 },
  { month: "Feb 2025", value: 1610000 },
  { month: "Mar 2025", value: 1680000 },
  { month: "Apr 2025", value: 1750000 },
  { month: "May 2025", value: 1875000 },
];

export const recentEmployees = [
  {
    id: "EMP-128",
    name: "Rahul Sharma",
    department: "IT",
    joiningDate: "2025-05-28",
  },
  {
    id: "EMP-127",
    name: "Neha Verma",
    department: "HR",
    joiningDate: "2025-05-25",
  },
  {
    id: "EMP-126",
    name: "Amit Patel",
    department: "Finance",
    joiningDate: "2025-05-20",
  },
  {
    id: "EMP-125",
    name: "Priya Singh",
    department: "Operations",
    joiningDate: "2025-05-15",
  },
];

export const recentPayrolls = [
  {
    month: "May 2025",
    totalEmployees: 128,
    totalPayroll: 1875000,
    status: "Completed" as const,
  },
  {
    month: "Apr 2025",
    totalEmployees: 123,
    totalPayroll: 1750000,
    status: "Completed" as const,
  },
  {
    month: "Mar 2025",
    totalEmployees: 118,
    totalPayroll: 1680000,
    status: "Completed" as const,
  },
  {
    month: "Feb 2025",
    totalEmployees: 112,
    totalPayroll: 1610000,
    status: "Completed" as const,
  },
];

export const recentPayments = [
  {
    employee: "Rahul Sharma",
    amount: 45000,
    date: "2025-05-31",
    status: "Paid" as const,
  },
  {
    employee: "Neha Verma",
    amount: 52000,
    date: "2025-05-31",
    status: "Paid" as const,
  },
  {
    employee: "Amit Patel",
    amount: 48000,
    date: "2025-05-31",
    status: "Paid" as const,
  },
  {
    employee: "Priya Singh",
    amount: 41000,
    date: "2025-05-31",
    status: "Paid" as const,
  },
];
