import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Hash,
  IndianRupee,
  User,
  AlertCircle,
  RefreshCw,
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

import { formatCurrency, formatDate } from "@/lib/formatters";

import apiClient from "@/api/client";
import { API_CONFIG } from "@/api/config";

/* =====================================================
   TYPES
===================================================== */

type PaymentStatus =
  | "Paid"
  | "Pending"
  | "Failed";

type PaymentMethod =
  | "NEFT"
  | "IMPS"
  | "RTGS"
  | "UPI";

interface Transaction {
  id: string;

  employeeId: string;
  employeeName: string;
  department: string;

  amount: number;
  date: string;

  status: PaymentStatus;
  method: PaymentMethod;

  bankReference: string;
  utrNumber: string;

  accountNumber: string;
  bankName: string;

  payrollId: string;
  payrollMonth: string;

  initiatedAt: string | null;
  completedAt: string | null;

  failureReason?: string | null;
  remarks?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

/* =====================================================
   API RESPONSE
===================================================== */

interface PaymentApiResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;

  data?: Transaction;
}

/* =====================================================
   HELPERS
===================================================== */

function statusVariant(
  status: PaymentStatus,
) {
  switch (status) {
    case "Paid":
      return "default" as const;

    case "Pending":
      return "secondary" as const;

    case "Failed":
      return "destructive" as const;

    default:
      return "outline" as const;
  }
}

/* =====================================================
   DATE TIME FORMAT
===================================================== */

function formatDateTime(
  value: string | null | undefined,
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

/* =====================================================
   DETAIL ITEM
===================================================== */

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 break-all text-sm font-semibold">
          {value !== null &&
          value !== undefined &&
          value !== ""
            ? value
            : "—"}
        </p>
      </div>
    </div>
  );
}

/* =====================================================
   PAGE
===================================================== */

export default function PaymentDetails() {
  const navigate = useNavigate();

  const { id } = useParams<{
    id: string;
  }>();

  /* ===================================================
     STATE
  =================================================== */

  const [transaction, setTransaction] =
    useState<Transaction | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  /* ===================================================
     FETCH PAYMENT DETAIL
  =================================================== */

  const fetchPayment = async () => {
    if (!id) {
      setError(
        "Payment ID is missing.",
      );

      setLoading(false);

      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(
        "Fetching payment:",
        id,
      );

      const response =
        await apiClient.get<
          Transaction | PaymentApiResponse
        >(
          API_CONFIG.ENDPOINTS.PAYMENTS.DETAIL(
            id,
          ),
        );

      console.log(
        "Payment Detail API Response:",
        response,
      );

      /*
       * Backend response can be:
       *
       * 1. { data: payment }
       *
       * OR
       *
       * 2. payment directly
       */

      const responseData =
        response?.data;

      let payment: Transaction | undefined;

      if (
        responseData &&
        typeof responseData === "object" &&
        "data" in responseData &&
        responseData.data
      ) {
        payment =
          responseData.data as Transaction;
      } else {
        payment =
          responseData as Transaction;
      }

      if (!payment) {
        throw new Error(
          "Payment record not found.",
        );
      }

      setTransaction(payment);
    } catch (err: any) {
      console.error(
        "Payment detail fetch error:",
        err,
      );

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load payment details.";

      setError(message);
      setTransaction(null);
    } finally {
      setLoading(false);
    }
  };

  /* ===================================================
     INITIAL FETCH
  =================================================== */

  useEffect(() => {
    fetchPayment();
  }, [id]);

  /* ===================================================
     LOADING
  =================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <RefreshCw className="mb-4 h-8 w-8 animate-spin text-primary" />

            <h2 className="text-xl font-semibold">
              Loading Payment
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Fetching payment information...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ===================================================
     ERROR / NOT FOUND
  =================================================== */

  if (error || !transaction) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <FileText className="h-7 w-7 text-destructive" />
            </div>

            <h2 className="text-xl font-semibold">
              Payment Not Found
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              {error ||
                "The payment transaction you are looking for does not exist or may have been removed."}
            </p>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  navigate(
                    "/admin/payments",
                  )
                }
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <Button
                onClick={fetchPayment}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
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
      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              navigate(
                "/admin/payments",
              )
            }
            title="Back to Payments"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Payment Details
            </h1>

            <p className="text-sm text-muted-foreground">
              View complete transaction information
            </p>
          </div>
        </div>

        <Badge
          variant={statusVariant(
            transaction.status,
          )}
          className="w-fit text-sm"
        >
          {transaction.status}
        </Badge>
      </div>

      {/* ==========================================
          PAYMENT SUMMARY
      ========================================== */}

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Transaction ID
              </p>

              <h2 className="mt-1 break-all text-2xl font-bold">
                {transaction.id}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {transaction.employeeName} ·{" "}
                {transaction.employeeId}
              </p>
            </div>

            <div className="rounded-lg border bg-muted/30 p-5 lg:min-w-[220px]">
              <p className="text-xs text-muted-foreground">
                Payment Amount
              </p>

              <p className="mt-1 text-2xl font-bold text-emerald-600">
                {formatCurrency(
                  transaction.amount,
                )}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {transaction.method}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ==========================================
          STATUS CARDS
      ========================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Amount */}

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <IndianRupee className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Amount
                </p>

                <p className="text-lg font-bold">
                  {formatCurrency(
                    transaction.amount,
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Method */}

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
                <CreditCard className="h-5 w-5 text-violet-600" />
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Method
                </p>

                <p className="text-lg font-bold">
                  {transaction.method}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Status
                </p>

                <p className="text-lg font-bold">
                  {transaction.status}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date */}

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Payment Date
                </p>

                <p className="text-lg font-bold">
                  {formatDate(
                    transaction.date,
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ==========================================
          EMPLOYEE INFORMATION
      ========================================== */}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Employee Information
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem
              icon={User}
              label="Employee Name"
              value={
                transaction.employeeName
              }
            />

            <DetailItem
              icon={Hash}
              label="Employee ID"
              value={
                transaction.employeeId
              }
            />

            <DetailItem
              icon={Building2}
              label="Department"
              value={
                transaction.department
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* ==========================================
          BANK INFORMATION
      ========================================== */}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Bank & Payment Information
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem
              icon={CreditCard}
              label="Payment Method"
              value={
                transaction.method
              }
            />

            <DetailItem
              icon={Building2}
              label="Bank Name"
              value={
                transaction.bankName
              }
            />

            <DetailItem
              icon={Hash}
              label="Account Number"
              value={
                transaction.accountNumber
              }
            />

            <DetailItem
              icon={Hash}
              label="Bank Reference"
              value={
                transaction.bankReference
              }
            />

            <DetailItem
              icon={Hash}
              label="UTR Number"
              value={
                transaction.utrNumber
              }
            />

            <DetailItem
              icon={IndianRupee}
              label="Amount"
              value={formatCurrency(
                transaction.amount,
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* ==========================================
          PAYROLL INFORMATION
      ========================================== */}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Payroll Information
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailItem
              icon={Hash}
              label="Payroll ID"
              value={
                transaction.payrollId
              }
            />

            <DetailItem
              icon={Calendar}
              label="Payroll Month"
              value={
                transaction.payrollMonth
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* ==========================================
          TRANSACTION TIMELINE
      ========================================== */}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Transaction Timeline
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Initiated */}

            <div className="flex items-start gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  Payment Initiated
                </p>

                <p className="text-sm text-muted-foreground">
                  {formatDateTime(
                    transaction.initiatedAt,
                  )}
                </p>
              </div>
            </div>

            <Separator />

            {/* Completed / Failed / Pending */}

            <div className="flex items-start gap-4">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  transaction.status ===
                  "Failed"
                    ? "bg-red-100"
                    : transaction.completedAt
                    ? "bg-emerald-100"
                    : "bg-orange-100"
                }`}
              >
                {transaction.status ===
                "Failed" ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : transaction.completedAt ? (
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Clock className="h-4 w-4 text-orange-600" />
                )}
              </div>

              <div>
                <p className="text-sm font-semibold">
                  {transaction.status ===
                  "Failed"
                    ? "Payment Failed"
                    : transaction.completedAt
                    ? "Payment Completed"
                    : "Payment Pending"}
                </p>

                <p className="text-sm text-muted-foreground">
                  {transaction.completedAt
                    ? formatDateTime(
                        transaction.completedAt,
                      )
                    : "Waiting for completion"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ==========================================
          FAILURE REASON
      ========================================== */}

      {transaction.failureReason && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Failure Reason
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="rounded-lg bg-destructive/5 p-4">
              <p className="text-sm text-destructive">
                {transaction.failureReason}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ==========================================
          REMARKS
      ========================================== */}

      {transaction.remarks && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Remarks
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">
              {transaction.remarks}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ==========================================
          BOTTOM ACTIONS
      ========================================== */}

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-between">
        <Button
          variant="outline"
          onClick={() =>
            navigate(
              "/admin/payments",
            )
          }
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payments
        </Button>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Hash className="h-4 w-4" />
          {transaction.id}
        </div>
      </div>
    </div>
  );
}