import { Link, useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatCurrency } from "@/lib/formatters";

import { ArrowRight } from "lucide-react";

interface Payroll {
  _id?: string;
  id?: string;
  payrollId?: string;

  month?: string;
  payrollMonth?: string;

  totalEmployees?: number;

  netPayroll?: number;
  netAmount?: number;
  amount?: number;
  totalPayroll?: number;
  grossPayroll?: number;

  status?: string;

  processedDate?: string;
  payrollDate?: string;
  date?: string;
  createdAt?: string;
}

interface RecentPayrollsTableProps {
  payrolls: Payroll[];
}

function getPayrollAmount(
  payroll: Payroll
): number {
  const amount =
    payroll.netPayroll ??
    payroll.netAmount ??
    payroll.amount ??
    payroll.totalPayroll ??
    payroll.grossPayroll ??
    0;

  const numericAmount =
    Number(amount);

  return Number.isFinite(
    numericAmount
  )
    ? numericAmount
    : 0;
}

function getPayrollMonth(
  payroll: Payroll
): string {
  return (
    payroll.month ??
    payroll.payrollMonth ??
    "—"
  );
}

function getStatusClass(
  status: string
): string {
  const normalized =
    status.toLowerCase();

  if (
    normalized === "completed" ||
    normalized === "paid" ||
    normalized === "success"
  ) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (
    normalized === "pending" ||
    normalized === "processing"
  ) {
    return "bg-amber-100 text-amber-700";
  }

  if (
    normalized === "failed" ||
    normalized === "cancelled"
  ) {
    return "bg-red-100 text-red-700";
  }

  return "bg-muted text-muted-foreground";
}

export function RecentPayrollsTable({
  payrolls,
}: RecentPayrollsTableProps) {
  const navigate = useNavigate();

  const safePayrolls =
    Array.isArray(payrolls)
      ? payrolls
      : [];

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Recent Payrolls
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">
                Month
              </TableHead>

              <TableHead>
                Total Employees
              </TableHead>

              <TableHead>
                Total Payroll
              </TableHead>

              <TableHead>
                Status
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {safePayrolls.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No payrolls found
                </TableCell>
              </TableRow>
            ) : (
              safePayrolls.map(
                (payroll, index) => {
                  const amount =
                    getPayrollAmount(
                      payroll
                    );

                  const month =
                    getPayrollMonth(
                      payroll
                    );

                  const employees =
                    Number(
                      payroll.totalEmployees
                    ) || 0;

                  const status =
                    payroll.status ??
                    "Pending";

                  const rowId =
                    payroll.payrollId ??
                    payroll._id ??
                    payroll.id ??
                    "";

                  return (
                    <TableRow
                      key={
                        payroll._id ??
                        payroll.id ??
                        index
                      }
                      onClick={() =>
                        navigate(
                          `/admin/payroll/${rowId}`
                        )
                      }
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="pl-6 font-medium">
                        {month}
                      </TableCell>

                      <TableCell>
                        {employees}
                      </TableCell>

                      <TableCell>
                        {formatCurrency(
                          amount
                        )}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                }
              )
            )}
          </TableBody>
        </Table>

        <div className="border-t px-6 py-3">
          <Link
            to="/admin/payroll"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            View All Payrolls

            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}