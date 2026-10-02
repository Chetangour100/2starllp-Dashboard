import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import apiClient from "@/api/client";
import { API_CONFIG } from "@/api/config";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";

/* =====================================================
   TYPES
===================================================== */

interface EmployeePayrollPreview {
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  monthlySalary: number;
  workingDays: number;
  totalDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  totalDeductions: number;
  netSalary: number;
}

interface DepartmentBreakdownPreview {
  department: string;
  employees: number;
  amount: number;
}

interface PayrollPreview {
  totalEmployees: number;
  grossPayroll: number;
  deductions: number;
  netPayroll: number;
  employeePayrolls: EmployeePayrollPreview[];
  departmentBreakdown: DepartmentBreakdownPreview[];
}

/* =====================================================
   HELPERS
===================================================== */

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getMonthLabel(monthValue: string): string {
  // monthValue is "YYYY-MM"
  const [year, month] = monthValue.split("-").map(Number);
  if (!year || !month) return "";
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

function getPeriodDates(monthValue: string): {
  periodStart: string;
  periodEnd: string;
} {
  const [year, month] = monthValue.split("-").map(Number);

  const periodStart = `${monthValue}-01`;

  // last day of the month
  const lastDay = new Date(year, month, 0).getDate();

  const periodEnd = `${monthValue}-${String(lastDay).padStart(2, "0")}`;

  return { periodStart, periodEnd };
}

/* =====================================================
   COMPONENT
===================================================== */

export default function CreatePayroll() {
  const navigate = useNavigate();

  const [selectedMonth, setSelectedMonth] = useState("");
  const [notes, setNotes] = useState("");

  const [preview, setPreview] = useState<PayrollPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const [creating, setCreating] = useState(false);

  /* ===================================================
     FETCH PREVIEW
     Jaise hi month select ho, backend se
     asli calculation (har employee ki salary,
     leave, deduction) le aao — bina kuch
     save kiye.
  =================================================== */

  const fetchPreview = async (monthValue: string) => {
    if (!monthValue) {
      setPreview(null);
      return;
    }

    setPreviewLoading(true);
    setPreviewError("");
    setPreview(null);

    try {
      const { periodStart, periodEnd } = getPeriodDates(monthValue);

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.PAYROLL.PREVIEW,
        { periodStart, periodEnd }
      );

      if (!response.success) {
        throw new Error(
          response.message || "Failed to calculate payroll preview"
        );
      }

      setPreview(response.data as PayrollPreview);
    } catch (err: any) {
      setPreviewError(
        err?.message ||
          "Failed to calculate payroll for this month. Please try again."
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
    fetchPreview(value);
  };

  /* ===================================================
     CREATE PAYROLL
     Preview me jo calculate hua hai, wahi
     backend dobara calculate karke save
     karega (dono me hamesha same formula
     use hota hai, isliye result match karega).
  =================================================== */

  const handleCreate = async () => {
    if (!selectedMonth) {
      toast.error("Please select a payroll month.");
      return;
    }

    if (!preview) {
      toast.error("Please wait for the payroll calculation to finish.");
      return;
    }

    const { periodStart, periodEnd } = getPeriodDates(selectedMonth);

    try {
      setCreating(true);

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.PAYROLL.CREATE,
        {
          month: getMonthLabel(selectedMonth),
          periodStart,
          periodEnd,
          notes: notes.trim() || null,
        }
      );

      if (!response.success) {
        throw new Error(
          response.message || "Failed to create payroll"
        );
      }

      toast.success("Payroll created successfully!");
      navigate("/admin/payroll");
    } catch (err: any) {
      toast.error(
        err?.message || "Failed to create payroll. Please try again."
      );
    } finally {
      setCreating(false);
    }
  };

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/admin/payroll")}
          title="Back to Payroll"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create Payroll
          </h1>
          <p className="text-sm text-muted-foreground">
            Select a month — salary, leave deductions and department
            totals are calculated automatically from employee records.
          </p>
        </div>
      </div>

      {/* MONTH SELECTION */}

      <Card>
        <CardHeader>
          <CardTitle>Select Payroll Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Input
                id="month"
                type="month"
                value={selectedMonth}
                onChange={(event) =>
                  handleMonthChange(event.target.value)
                }
              />
            </div>

            {selectedMonth && (
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fetchPreview(selectedMonth)}
                  disabled={previewLoading}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Recalculate
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* LOADING */}

      {previewLoading && (
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Calculating salaries, leave and deductions...
          </div>
        </div>
      )}

      {/* ERROR */}

      {previewError && !previewLoading && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {previewError}
        </div>
      )}

      {/* PREVIEW */}

      {preview && !previewLoading && (
        <>
          {/* SUMMARY CARDS */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  Total Employees
                </p>
                <p className="text-2xl font-bold">
                  {preview.totalEmployees}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  Gross Payroll
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(preview.grossPayroll)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  Total Deductions
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(preview.deductions)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  Net Payroll (to be paid)
                </p>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(preview.netPayroll)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* EMPLOYEE-WISE REVIEW */}

          <Card>
            <CardHeader>
              <CardTitle>
                Employee-wise Salary (Review before creating)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Working Days</TableHead>
                      <TableHead>Paid / Unpaid Leave</TableHead>
                      <TableHead className="text-right">Deduction</TableHead>
                      <TableHead className="text-right">Net Salary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.employeePayrolls.map((row) => (
                      <TableRow key={row.employeeId}>
                        <TableCell>
                          <div className="font-medium">{row.employeeName}</div>
                          <div className="text-xs text-muted-foreground">
                            {row.employeeId} · {row.department}
                          </div>
                        </TableCell>
                        <TableCell>
                          {row.workingDays} / {row.totalDays}
                        </TableCell>
                        <TableCell>
                          {row.paidLeaveDays} paid · {row.unpaidLeaveDays} unpaid
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(row.totalDeductions)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(row.netSalary)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* DEPARTMENT BREAKDOWN */}

          <Card>
            <CardHeader>
              <CardTitle>Department Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.departmentBreakdown.map((department) => (
                      <TableRow key={department.department}>
                        <TableCell>
                          <Badge variant="secondary">
                            {department.department}
                          </Badge>
                        </TableCell>
                        <TableCell>{department.employees}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(department.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* NOTES */}

          <Card>
            <CardHeader>
              <CardTitle>Notes (optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add payroll notes..."
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* ACTIONS */}

          <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/payroll")}
              disabled={creating}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleCreate}
              disabled={creating || previewLoading}
            >
              {creating ? "Creating Payroll..." : "Create Payroll"}
            </Button>
          </div>
        </>
      )}

      {/* EMPTY STATE */}

      {!selectedMonth && !previewLoading && (
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border text-sm text-muted-foreground">
          Select a month above to calculate payroll for all active employees.
        </div>
      )}
    </div>
  );
}
