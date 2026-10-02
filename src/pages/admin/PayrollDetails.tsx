import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  IndianRupee,
  User,
  Users,
  Clock,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatCurrency, formatDate } from "@/lib/formatters";

import apiClient from "@/api/client";
import { API_CONFIG } from "@/api/config";
import { payrollService } from "@/api/services/payrollService";
import { Download } from "lucide-react";
import { toast } from "sonner";

/* =====================================================
   TYPES
===================================================== */

type PayrollStatus =
  | "Completed"
  | "Pending"
  | "Processing";

interface DepartmentBreakdown {
  department: string;
  employees: number;
  amount: number;
}

interface Payroll {
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

  departmentBreakdown: DepartmentBreakdown[];

  employeePayrolls?: any[];

  notes?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

/* =====================================================
   STATUS
===================================================== */

function statusVariant(status: PayrollStatus) {
  switch (status) {
    case "Completed":
      return "default" as const;

    case "Processing":
      return "secondary" as const;

    case "Pending":
      return "outline" as const;

    default:
      return "outline" as const;
  }
}

/* =====================================================
   INFO ITEM
===================================================== */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold">
        {value || "—"}
      </p>
    </div>
  );
}

/* =====================================================
   PAGE
===================================================== */

export default function PayrollDetails() {
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();

  /* ===================================================
     STATE
  =================================================== */

  const [payroll, setPayroll] =
    useState<Payroll | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ===================================================
     FETCH PAYROLL
  =================================================== */

  useEffect(() => {
    const fetchPayroll = async () => {
      if (!id) {
        setError("Payroll ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        console.log(
          "Fetching payroll:",
          id
        );

        const response =
          await apiClient.get<Payroll>(
            API_CONFIG.ENDPOINTS.PAYROLL.DETAIL(id)
          );

        console.log(
          "Payroll details response:",
          response
        );

        if (!response.success || !response.data) {
          throw new Error(
            response.message ||
              "Payroll not found"
          );
        }

        setPayroll(response.data);
      } catch (err: any) {
        console.error(
          "Payroll details error:",
          err
        );

        setError(
          err?.message ||
            "Failed to load payroll details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPayroll();
  }, [id]);

  /* ===================================================
     LOADING
  =================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />

            <h2 className="text-lg font-semibold">
              Loading Payroll...
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Please wait while payroll details are
              being fetched.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ===================================================
     ERROR / NOT FOUND
  =================================================== */

  if (!payroll) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center p-8 text-center">

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <FileText className="h-7 w-7 text-destructive" />
            </div>

            <h2 className="text-xl font-semibold">
              Payroll Not Found
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              {error ||
                "The payroll run you are looking for does not exist."}
            </p>

            <Button
              className="mt-6"
              onClick={() =>
                navigate("/admin/payroll")
              }
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Payroll
            </Button>

          </CardContent>
        </Card>
      </div>
    );
  }

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              navigate("/admin/payroll")
            }
            title="Back to Payroll"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>

            <h1 className="text-2xl font-bold tracking-tight">
              Payroll Details
            </h1>

            <p className="text-sm text-muted-foreground">
              View complete payroll information
            </p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <Button
            variant="outline"
            onClick={async () => {
              try {
                await payrollService.downloadBankFile(
                  payroll.id
                );
              } catch {
                toast.error(
                  "Failed to download bank transfer file"
                );
              }
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Bank Transfer File
          </Button>

          <Badge
            variant={statusVariant(
              payroll.status
            )}
            className="w-fit text-sm"
          >
            {payroll.status}
          </Badge>

        </div>

      </div>

      {/* =================================================
          PAYROLL SUMMARY
      ================================================= */}

      <Card>

        <CardContent className="p-6">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-sm text-muted-foreground">
                Payroll ID
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                {payroll.id}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {payroll.month}
              </p>

            </div>

            <div className="rounded-lg border bg-muted/30 p-5 lg:min-w-[220px]">

              <p className="text-xs text-muted-foreground">
                Net Payroll
              </p>

              <p className="mt-1 text-2xl font-bold text-emerald-600">
                {formatCurrency(
                  payroll.netPayroll
                )}
              </p>

            </div>

          </div>

        </CardContent>

      </Card>

      {/* =================================================
          FINANCIAL SUMMARY
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Employees */}

        <Card>
          <CardContent className="p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>

              <div>

                <p className="text-xs text-muted-foreground">
                  Employees
                </p>

                <p className="text-xl font-bold">
                  {payroll.totalEmployees}
                </p>

              </div>

            </div>

          </CardContent>
        </Card>

        {/* Gross */}

        <Card>
          <CardContent className="p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
                <IndianRupee className="h-5 w-5 text-violet-600" />
              </div>

              <div>

                <p className="text-xs text-muted-foreground">
                  Gross Payroll
                </p>

                <p className="text-xl font-bold">
                  {formatCurrency(
                    payroll.grossPayroll
                  )}
                </p>

              </div>

            </div>

          </CardContent>
        </Card>

        {/* Deductions */}

        <Card>
          <CardContent className="p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <IndianRupee className="h-5 w-5 text-orange-600" />
              </div>

              <div>

                <p className="text-xs text-muted-foreground">
                  Deductions
                </p>

                <p className="text-xl font-bold">
                  {formatCurrency(
                    payroll.deductions
                  )}
                </p>

              </div>

            </div>

          </CardContent>
        </Card>

        {/* Net */}

        <Card>
          <CardContent className="p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>

              <div>

                <p className="text-xs text-muted-foreground">
                  Net Payroll
                </p>

                <p className="text-xl font-bold text-emerald-600">
                  {formatCurrency(
                    payroll.netPayroll
                  )}
                </p>

              </div>

            </div>

          </CardContent>
        </Card>

      </div>

      {/* =================================================
          PAYROLL INFORMATION
      ================================================= */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">

            <Calendar className="h-5 w-5" />

            Payroll Information

          </CardTitle>

        </CardHeader>

        <CardContent>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <InfoItem
              label="Payroll ID"
              value={payroll.id}
            />

            <InfoItem
              label="Payroll Month"
              value={payroll.month}
            />

            <InfoItem
              label="Status"
              value={payroll.status}
            />

            <InfoItem
              label="Period Start"
              value={formatDate(
                payroll.periodStart
              )}
            />

            <InfoItem
              label="Period End"
              value={formatDate(
                payroll.periodEnd
              )}
            />

            <InfoItem
              label="Total Employees"
              value={payroll.totalEmployees}
            />

            <InfoItem
              label="Processed Date"
              value={
                payroll.processedDate
                  ? formatDate(
                      payroll.processedDate
                    )
                  : "Not processed"
              }
            />

            <InfoItem
              label="Processed By"
              value={
                payroll.processedBy ||
                "Not processed"
              }
            />

          </div>

        </CardContent>

      </Card>

      {/* =================================================
          FINANCIAL DETAILS
      ================================================= */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">

            <IndianRupee className="h-5 w-5" />

            Financial Details

          </CardTitle>

        </CardHeader>

        <CardContent>

          <div className="grid gap-4 sm:grid-cols-3">

            <InfoItem
              label="Gross Payroll"
              value={formatCurrency(
                payroll.grossPayroll
              )}
            />

            <InfoItem
              label="Total Deductions"
              value={formatCurrency(
                payroll.deductions
              )}
            />

            <InfoItem
              label="Net Payroll"
              value={formatCurrency(
                payroll.netPayroll
              )}
            />

          </div>

          <Separator className="my-6" />

          <div className="rounded-lg bg-muted/40 p-4">

            <div className="flex items-center justify-between">

              <span className="text-sm text-muted-foreground">
                Gross Payroll
              </span>

              <span className="font-medium">
                {formatCurrency(
                  payroll.grossPayroll
                )}
              </span>

            </div>

            <div className="mt-3 flex items-center justify-between">

              <span className="text-sm text-muted-foreground">
                Deductions
              </span>

              <span className="font-medium text-red-600">
                -{" "}
                {formatCurrency(
                  payroll.deductions
                )}
              </span>

            </div>

            <Separator className="my-3" />

            <div className="flex items-center justify-between">

              <span className="font-semibold">
                Net Payroll
              </span>

              <span className="text-lg font-bold text-emerald-600">
                {formatCurrency(
                  payroll.netPayroll
                )}
              </span>

            </div>

          </div>

        </CardContent>

      </Card>

      {/* =================================================
          EMPLOYEE-WISE BREAKDOWN
      ================================================= */}

      <Card>

        <CardHeader>

          <CardTitle>
            Employee-wise Breakdown
          </CardTitle>

        </CardHeader>

        <CardContent>

          {payroll.employeePayrolls &&
          payroll.employeePayrolls.length > 0 ? (

            <div className="overflow-x-auto">

              <Table>

                <TableHeader>

                  <TableRow>

                    <TableHead>
                      Employee
                    </TableHead>

                    <TableHead>
                      Working / Total Days
                    </TableHead>

                    <TableHead>
                      Paid / Unpaid Leave
                    </TableHead>

                    <TableHead className="text-right">
                      Deduction
                    </TableHead>

                    <TableHead className="text-right">
                      Net Salary
                    </TableHead>

                    <TableHead>
                      Payment
                    </TableHead>

                    <TableHead className="text-right">
                      Payslip
                    </TableHead>

                  </TableRow>

                </TableHeader>

                <TableBody>

                  {payroll.employeePayrolls.map(
                    (employeePayroll) => (
                      <TableRow
                        key={
                          employeePayroll.employeeId
                        }
                      >

                        <TableCell>
                          <div className="font-medium">
                            {employeePayroll.employeeName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {employeePayroll.employeeId} · {employeePayroll.department}
                          </div>
                        </TableCell>

                        <TableCell>
                          {employeePayroll.workingDays} / {employeePayroll.totalDays}
                        </TableCell>

                        <TableCell>
                          {employeePayroll.paidLeaveDays} paid · {employeePayroll.unpaidLeaveDays} unpaid
                        </TableCell>

                        <TableCell className="text-right">
                          {formatCurrency(
                            employeePayroll.totalDeductions
                          )}
                        </TableCell>

                        <TableCell className="text-right font-medium">
                          {formatCurrency(
                            employeePayroll.netSalary
                          )}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              employeePayroll.paymentStatus ===
                              "Paid"
                                ? "default"
                                : employeePayroll.paymentStatus ===
                                  "Failed"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {employeePayroll.paymentStatus}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              try {
                                await payrollService.downloadPayslip(
                                  payroll.id,
                                  employeePayroll.employeeId
                                );
                              } catch {
                                toast.error(
                                  "Failed to download payslip"
                                );
                              }
                            }}
                          >
                            <Download className="mr-1 h-3.5 w-3.5" />
                            Download
                          </Button>
                        </TableCell>

                      </TableRow>
                    )
                  )}

                </TableBody>

              </Table>

            </div>

          ) : (

            <div className="py-8 text-center text-sm text-muted-foreground">
              No employee-wise data available for this payroll.
            </div>

          )}

        </CardContent>

      </Card>

      {/* =================================================
          DEPARTMENT BREAKDOWN
      ================================================= */}

      <Card>

        <CardHeader>

          <CardTitle>
            Department Breakdown
          </CardTitle>

        </CardHeader>

        <CardContent>

          {payroll.departmentBreakdown &&
          payroll.departmentBreakdown.length > 0 ? (

            <div className="overflow-x-auto">

              <Table>

                <TableHeader>

                  <TableRow>

                    <TableHead>
                      Department
                    </TableHead>

                    <TableHead>
                      Employees
                    </TableHead>

                    <TableHead className="text-right">
                      Amount
                    </TableHead>

                  </TableRow>

                </TableHeader>

                <TableBody>

                  {payroll.departmentBreakdown.map(
                    (department) => (
                      <TableRow
                        key={
                          department.department
                        }
                      >

                        <TableCell className="font-medium">
                          {department.department}
                        </TableCell>

                        <TableCell>
                          {department.employees}
                        </TableCell>

                        <TableCell className="text-right font-medium">
                          {formatCurrency(
                            department.amount
                          )}
                        </TableCell>

                      </TableRow>
                    )
                  )}

                </TableBody>

              </Table>

            </div>

          ) : (

            <div className="py-8 text-center text-sm text-muted-foreground">
              No department breakdown available.
            </div>

          )}

        </CardContent>

      </Card>

      {/* =================================================
          PROCESSING INFORMATION
      ================================================= */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">

            {payroll.status ===
            "Completed" ? (
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            ) : (
              <Clock className="h-5 w-5 text-orange-600" />
            )}

            Processing Information

          </CardTitle>

        </CardHeader>

        <CardContent>

          <div className="grid gap-4 sm:grid-cols-2">

            <InfoItem
              label="Processing Status"
              value={payroll.status}
            />

            <InfoItem
              label="Processed By"
              value={
                payroll.processedBy ||
                "Not processed yet"
              }
            />

            <InfoItem
              label="Processed Date"
              value={
                payroll.processedDate
                  ? formatDate(
                      payroll.processedDate
                    )
                  : "Not processed yet"
              }
            />

            <InfoItem
              label="Payroll Period"
              value={`${formatDate(
                payroll.periodStart
              )} – ${formatDate(
                payroll.periodEnd
              )}`}
            />

          </div>

        </CardContent>

      </Card>

      {/* =================================================
          NOTES
      ================================================= */}

      {payroll.notes && (
        <Card>

          <CardHeader>

            <CardTitle className="flex items-center gap-2">

              <FileText className="h-5 w-5" />

              Notes

            </CardTitle>

          </CardHeader>

          <CardContent>

            <p className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">
              {payroll.notes}
            </p>

          </CardContent>

        </Card>
      )}

      {/* =================================================
          BOTTOM ACTIONS
      ================================================= */}

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-between">

        <Button
          variant="outline"
          onClick={() =>
            navigate("/admin/payroll")
          }
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payroll
        </Button>

        {payroll.processedBy && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">

            <User className="h-4 w-4" />

            Processed by{" "}
            {payroll.processedBy}

          </div>
        )}

      </div>

    </div>
  );
}