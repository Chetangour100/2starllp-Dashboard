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

import {
  formatCurrency,
  formatDate,
} from "@/lib/formatters";

import { ArrowRight } from "lucide-react";

interface Payment {
  _id?: string;
  id?: string;
  paymentId?: string;

  employee?: string;
  employeeName?: string;

  amount?: number;

  date?: string;
  paymentDate?: string;
  createdAt?: string;

  status?: string;

  paymentMethod?: string;
  transactionId?: string;
}

interface RecentPaymentsTableProps {
  payments: Payment[];
}

function getPaymentAmount(
  payment: Payment
): number {
  const amount =
    Number(payment.amount);

  return Number.isFinite(amount)
    ? amount
    : 0;
}

function getPaymentDate(
  payment: Payment
): string | null {
  return (
    payment.paymentDate ??
    payment.date ??
    payment.createdAt ??
    null
  );
}

function getStatusClass(
  status: string
): string {
  const normalized =
    status.toLowerCase();

  if (
    normalized === "paid" ||
    normalized === "completed" ||
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

export function RecentPaymentsTable({
  payments,
}: RecentPaymentsTableProps) {
  const navigate = useNavigate();

  const safePayments =
    Array.isArray(payments)
      ? payments
      : [];

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Recent Payments
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">
                Employee
              </TableHead>

              <TableHead>
                Amount
              </TableHead>

              <TableHead>
                Date
              </TableHead>

              <TableHead>
                Status
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {safePayments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              safePayments.map(
                (payment, index) => {
                  const employee =
                    payment.employeeName ??
                    payment.employee ??
                    "—";

                  const amount =
                    getPaymentAmount(
                      payment
                    );

                  const date =
                    getPaymentDate(
                      payment
                    );

                  const status =
                    payment.status ??
                    "Pending";

                  const rowId =
                    payment.paymentId ??
                    payment._id ??
                    payment.id ??
                    "";

                  return (
                    <TableRow
                      key={
                        payment._id ??
                        payment.id ??
                        index
                      }
                      onClick={() =>
                        navigate(
                          `/admin/payments/${rowId}`
                        )
                      }
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="pl-6 font-medium">
                        {employee}
                      </TableCell>

                      <TableCell>
                        {formatCurrency(
                          amount
                        )}
                      </TableCell>

                      <TableCell>
                        {formatDate(date)}
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
            to="/admin/payments"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            View All Payments

            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}