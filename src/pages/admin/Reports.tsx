import { useState } from "react";
import { motion } from "framer-motion";
import PageHeader from "@/components/common/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { useReports } from "@/api/hooks/useReports";
import { reportPeriods, type ReportPeriod } from "@/data/reportsData";
import { formatCurrency } from "@/lib/formatters";
import { downloadCsv } from "@/lib/exportCsv";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Download,
  IndianRupee,
  Users,
  Percent,
  Building2,
  FileSpreadsheet,
} from "lucide-react";
import { isMockDataEnabled } from "@/api/mock";

const CHART_COLORS = [
  "hsl(var(--accent))",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
];

function statusBadgeVariant(status: string) {
  if (status === "Completed" || status === "Paid") return "default" as const;
  if (status === "Processing" || status === "Pending") return "secondary" as const;
  return "destructive" as const;
}

export default function Reports() {
  const [period, setPeriod] = useState<ReportPeriod>("ytd");
  const { data, isLoading } = useReports(period);

  const handleExportPayroll = () => {
    if (!data) return;
    downloadCsv(
      `payroll-summary-${period}.csv`,
      ["Month", "Payroll ID", "Employees", "Gross Pay", "Deductions", "Net Pay", "Status"],
      data.payrollSummary.map((row) => [
        row.month,
        row.payrollId,
        row.employees,
        row.grossPay,
        row.deductions,
        row.netPay,
        row.status,
      ]),
    );
  };

  const handleExportTax = () => {
    if (!data) return;
    downloadCsv(
      `tax-deductions-${period}.csv`,
      ["Month", "TDS", "PF", "ESI", "Professional Tax", "Total"],
      data.taxDeductions.map((row) => [
        row.month,
        row.tds,
        row.pf,
        row.esi,
        row.professionalTax,
        row.totalDeductions,
      ]),
    );
  };

  const handleExportDepartments = () => {
    if (!data) return;
    downloadCsv(
      "department-analytics.csv",
      ["Department", "Headcount", "Total Salary", "Avg Salary", "Payroll Share %"],
      data.departments.map((row) => [
        row.department,
        row.headcount,
        row.totalSalary,
        row.avgSalary,
        row.payrollShare,
      ]),
    );
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <PageHeader
          heading="Reports"
          subHeading="Analytics and payroll reporting for 2Star Staffing."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const { summary } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          heading="Reports"
          subHeading="Payroll summaries, tax breakdowns, department analytics, and payment status."
        />
        <div className="flex flex-wrap items-center gap-3">
          <Select value={period} onValueChange={(v) => setPeriod(v as ReportPeriod)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {reportPeriods.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isMockDataEnabled() && (
            <Badge variant="outline" className="text-xs">
              Mock Data
            </Badge>
          )}
        </div>
      </div>

      <motion.div
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <StatCard
          title="Gross Payroll"
          value={formatCurrency(summary.totalPayrollYtd)}
          icon={IndianRupee}
          iconClassName="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          title="Total Deductions"
          value={formatCurrency(summary.totalDeductionsYtd)}
          icon={Percent}
          iconClassName="bg-orange-100 text-orange-600"
        />
        <StatCard
          title="Active Employees"
          value={`${summary.activeEmployees} / ${summary.totalEmployees}`}
          icon={Users}
          iconClassName="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Payment Success Rate"
          value={`${summary.paymentSuccessRate}%`}
          subtitle={`Avg salary ${formatCurrency(summary.avgSalary)}`}
          icon={Building2}
          iconClassName="bg-violet-100 text-violet-600"
        />
      </motion.div>

      <motion.div
        className="grid gap-4 lg:grid-cols-2"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Monthly Net Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyPayrollChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                    width={48}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [formatCurrency(value), "Net Pay"]}
                  />
                  <Bar dataKey="value" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Payroll by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <Pie
                    data={data.departmentChart}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="42%"
                    outerRadius={75}
                    label={({ percent }) =>
                      `${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {data.departmentChart.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [formatCurrency(value), "Salary"]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Tabs defaultValue="payroll" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="payroll">Payroll Summary</TabsTrigger>
            <TabsTrigger value="tax">Tax & Deductions</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="payments">Payment Status</TabsTrigger>
          </TabsList>

          <TabsContent value="payroll">
            <Card className="border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-semibold">Payroll Summary Report</CardTitle>
                <Button variant="outline" size="sm" onClick={handleExportPayroll}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Month</TableHead>
                        <TableHead>Payroll ID</TableHead>
                        <TableHead>Employees</TableHead>
                        <TableHead>Gross Pay</TableHead>
                        <TableHead>Deductions</TableHead>
                        <TableHead>Net Pay</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.payrollSummary.map((row) => (
                        <TableRow key={row.payrollId}>
                          <TableCell className="font-medium">{row.month}</TableCell>
                          <TableCell>{row.payrollId}</TableCell>
                          <TableCell>{row.employees}</TableCell>
                          <TableCell>{formatCurrency(row.grossPay)}</TableCell>
                          <TableCell>{formatCurrency(row.deductions)}</TableCell>
                          <TableCell>{formatCurrency(row.netPay)}</TableCell>
                          <TableCell>
                            <Badge variant={statusBadgeVariant(row.status)}>{row.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tax">
            <Card className="border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-semibold">Tax & Deduction Report</CardTitle>
                <Button variant="outline" size="sm" onClick={handleExportTax}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Month</TableHead>
                        <TableHead>TDS</TableHead>
                        <TableHead>PF</TableHead>
                        <TableHead>ESI</TableHead>
                        <TableHead>Prof. Tax</TableHead>
                        <TableHead>Total Deductions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.taxDeductions.map((row) => (
                        <TableRow key={row.month}>
                          <TableCell className="font-medium">{row.month}</TableCell>
                          <TableCell>{formatCurrency(row.tds)}</TableCell>
                          <TableCell>{formatCurrency(row.pf)}</TableCell>
                          <TableCell>{formatCurrency(row.esi)}</TableCell>
                          <TableCell>{formatCurrency(row.professionalTax)}</TableCell>
                          <TableCell>{formatCurrency(row.totalDeductions)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments">
            <Card className="border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-semibold">Department Analytics</CardTitle>
                <Button variant="outline" size="sm" onClick={handleExportDepartments}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Department</TableHead>
                        <TableHead>Headcount</TableHead>
                        <TableHead>Total Salary</TableHead>
                        <TableHead>Avg Salary</TableHead>
                        <TableHead>Payroll Share</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.departments.map((row) => (
                        <TableRow key={row.department}>
                          <TableCell className="font-medium">{row.department}</TableCell>
                          <TableCell>{row.headcount}</TableCell>
                          <TableCell>{formatCurrency(row.totalSalary)}</TableCell>
                          <TableCell>{formatCurrency(row.avgSalary)}</TableCell>
                          <TableCell>{row.payrollShare}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Payment Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  {data.paymentStatus.map((row) => (
                    <div
                      key={row.status}
                      className="rounded-lg border bg-muted/30 p-4 text-center"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Badge variant={statusBadgeVariant(row.status)}>{row.status}</Badge>
                        <span className="text-sm text-muted-foreground">{row.percentage}%</span>
                      </div>
                      <p className="mt-2 text-2xl font-bold">{row.count}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(row.amount)} total
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  <FileSpreadsheet className="h-4 w-4 shrink-0" />
                  Detailed payment transaction reports are available on the Payments page.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
