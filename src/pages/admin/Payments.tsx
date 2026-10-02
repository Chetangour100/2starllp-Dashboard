import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import PageHeader from "@/components/common/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import SortableHeader from "@/components/ui/tableSorting";
import PaginationControls from "@/components/ui/paginationComp";

import { formatCurrency, formatDate } from "@/lib/formatters";
import { getVisiblePages } from "@/lib/pagination";

import apiClient from "@/api/client";
import { API_CONFIG } from "@/api/config";

import {
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  IndianRupee,
  Search,
  X,
  RefreshCw,
} from "lucide-react";

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
  failureReason: string | null;
  remarks: string | null;
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
  data?: unknown;
}

/* =====================================================
   SORT
===================================================== */

type SortKey =
  | "date"
  | "employeeName"
  | "amount"
  | "status";

type SortDirection =
  | "asc"
  | "desc";

/* =====================================================
   CONSTANTS
===================================================== */

const PAGE_SIZE_OPTIONS = [
  5,
  10,
  25,
  50,
];

const ALL_FILTER = "all";

/* =====================================================
   STATUS BADGE
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
   NORMALIZE PAYMENT
===================================================== */

function normalizePayment(
  payment: any,
): Transaction {
  return {
    id:
      payment.id ??
      payment.paymentId ??
      payment.transactionId ??
      payment._id ??
      "",

    employeeId:
      payment.employeeId ?? "",

    employeeName:
      payment.employeeName ?? "",

    department:
      payment.department ?? "",

    amount:
      Number(payment.amount ?? 0),

    date:
      payment.date ??
      payment.paymentDate ??
      payment.createdAt ??
      "",

    status:
      payment.status ?? "Pending",

    method:
      payment.method ??
      payment.paymentMethod ??
      "NEFT",

    bankReference:
      payment.bankReference ?? "",

    utrNumber:
      payment.utrNumber ?? "",

    accountNumber:
      payment.accountNumber ?? "",

    bankName:
      payment.bankName ?? "",

    payrollId:
      payment.payrollId ?? "",

    payrollMonth:
      payment.payrollMonth ?? "",

    initiatedAt:
      payment.initiatedAt ?? null,

    completedAt:
      payment.completedAt ?? null,

    failureReason:
      payment.failureReason ?? null,

    remarks:
      payment.remarks ?? null,

    createdAt:
      payment.createdAt,

    updatedAt:
      payment.updatedAt,
  };
}

/* =====================================================
   COMPONENT
===================================================== */

export default function Payments() {
  const navigate = useNavigate();

  /* ===================================================
     STATE
  =================================================== */

  const [payments, setPayments] =
    useState<Transaction[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState(ALL_FILTER);

  const [methodFilter, setMethodFilter] =
    useState(ALL_FILTER);

  const [sortKey, setSortKey] =
    useState<SortKey>("date");

  const [sortDirection, setSortDirection] =
    useState<SortDirection>("desc");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(10);

  /* ===================================================
     FETCH PAYMENTS
  =================================================== */

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        await apiClient.get<
          PaymentApiResponse | Transaction[]
        >(
          API_CONFIG.ENDPOINTS.PAYMENTS.LIST,
        );

      console.log(
        "Payments API Response:",
        response,
      );

      /*
       * Axios response:
       *
       * response.data
       *
       * Backend may return:
       *
       * 1. []
       *
       * 2. { data: [] }
       *
       * 3. { success: true, data: [] }
       */

      const responseData =
        response?.data;

      let rawPayments: any[] = [];

      if (
        Array.isArray(responseData)
      ) {
        rawPayments =
          responseData;
      } else if (
        responseData &&
        typeof responseData ===
          "object"
      ) {
        const apiData =
          responseData as PaymentApiResponse;

        if (
          Array.isArray(
            apiData.data,
          )
        ) {
          rawPayments =
            apiData.data;
        }
      }

      const normalizedPayments =
        rawPayments.map(
          normalizePayment,
        );

      console.log(
        "Normalized Payments:",
        normalizedPayments,
      );

      setPayments(
        normalizedPayments,
      );
    } catch (err: any) {
      console.error(
        "Payment fetch error:",
        err,
      );

      const message =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to fetch payment records";

      setError(message);

      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  /* ===================================================
     INITIAL FETCH
  =================================================== */

  useEffect(() => {
    fetchPayments();
  }, []);

  /* ===================================================
     SORT
  =================================================== */

  const handleSort = (
    key: string,
  ) => {
    const typedKey =
      key as SortKey;

    if (
      sortKey === typedKey
    ) {
      setSortDirection(
        (previous) =>
          previous === "asc"
            ? "desc"
            : "asc",
      );
    } else {
      setSortKey(typedKey);
      setSortDirection("asc");
    }

    setCurrentPage(1);
  };

  /* ===================================================
     FILTER + SORT
  =================================================== */

  const filteredTransactions =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return [...payments]
        .filter((payment) => {
          const matchesSearch =
            !query ||
            payment.id
              .toLowerCase()
              .includes(query) ||
            payment.employeeName
              .toLowerCase()
              .includes(query) ||
            payment.employeeId
              .toLowerCase()
              .includes(query) ||
            payment.utrNumber
              .toLowerCase()
              .includes(query) ||
            payment.bankReference
              .toLowerCase()
              .includes(query) ||
            payment.payrollId
              .toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter ===
              ALL_FILTER ||
            payment.status ===
              statusFilter;

          const matchesMethod =
            methodFilter ===
              ALL_FILTER ||
            payment.method ===
              methodFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesMethod
          );
        })
        .sort((a, b) => {
          let comparison = 0;

          switch (sortKey) {
            case "date":
              comparison =
                new Date(
                  a.date,
                ).getTime() -
                new Date(
                  b.date,
                ).getTime();

              break;

            case "employeeName":
              comparison =
                a.employeeName.localeCompare(
                  b.employeeName,
                );

              break;

            case "amount":
              comparison =
                a.amount - b.amount;

              break;

            case "status":
              comparison =
                a.status.localeCompare(
                  b.status,
                );

              break;

            default:
              comparison = 0;
          }

          return sortDirection ===
            "asc"
            ? comparison
            : -comparison;
        });
    }, [
      payments,
      search,
      statusFilter,
      methodFilter,
      sortKey,
      sortDirection,
    ]);

  /* ===================================================
     PAGINATION
  =================================================== */

  const totalItems =
    filteredTransactions.length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalItems / pageSize,
    ),
  );

  const safePage = Math.min(
    currentPage,
    totalPages,
  );

  const paginatedTransactions =
    useMemo(() => {
      const start =
        (safePage - 1) *
        pageSize;

      return filteredTransactions.slice(
        start,
        start + pageSize,
      );
    }, [
      filteredTransactions,
      safePage,
      pageSize,
    ]);

  const startItem =
    totalItems === 0
      ? 0
      : (safePage - 1) *
          pageSize +
        1;

  const endItem = Math.min(
    safePage * pageSize,
    totalItems,
  );

  /* ===================================================
     STATISTICS
  =================================================== */

  const totalTransactions =
    payments.length;

  const paidCount =
    payments.filter(
      (payment) =>
        payment.status ===
        "Paid",
    ).length;

  const pendingCount =
    payments.filter(
      (payment) =>
        payment.status ===
        "Pending",
    ).length;

  const failedCount =
    payments.filter(
      (payment) =>
        payment.status ===
        "Failed",
    ).length;

  /* ===================================================
     OPEN DETAIL
  =================================================== */

  const openDetail = (
    payment: Transaction,
  ) => {
    navigate(
      `/admin/payments/${payment.id}`,
    );
  };

  /* ===================================================
     CLEAR FILTERS
  =================================================== */

  const clearFilters = () => {
    setSearch("");
    setStatusFilter(
      ALL_FILTER,
    );
    setMethodFilter(
      ALL_FILTER,
    );
    setCurrentPage(1);
  };

  /* ===================================================
     LOADING
  =================================================== */

  if (loading) {
    return (
      <div className="space-y-6">

        <PageHeader
          heading="Payments"
          subHeading="Track all salary disbursement transactions."
        />

        <Card>
          <CardContent className="flex min-h-[300px] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">

              <RefreshCw className="h-7 w-7 animate-spin" />

              <p>
                Loading payment records...
              </p>

            </div>
          </CardContent>
        </Card>

      </div>
    );
  }

  /* ===================================================
     ERROR
  =================================================== */

  if (error) {
    return (
      <div className="space-y-6">

        <PageHeader
          heading="Payments"
          subHeading="Track all salary disbursement transactions."
        />

        <Card>
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center text-center">

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>

            <h2 className="text-lg font-semibold">
              Failed to load payments
            </h2>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {error}
            </p>

            <Button
              className="mt-5"
              onClick={
                fetchPayments
              }
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
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
          PAGE HEADER
      ================================================= */}

      <PageHeader
        heading="Payments"
        subHeading="Track all salary disbursement transactions."
      />

      {/* =================================================
          STAT CARDS
      ================================================= */}

      <motion.div
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        initial={{
          opacity: 0,
          y: 16,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
        }}
      >

        {/* Total */}

        <StatCard
          title="Total Transactions"
          value={String(
            totalTransactions,
          )}
          icon={IndianRupee}
          iconClassName="bg-blue-100 text-blue-600"
        />

        {/* Paid */}

        <StatCard
          title="Paid"
          value={String(
            paidCount,
          )}
          icon={CheckCircle}
          iconClassName="bg-emerald-100 text-emerald-600"
        />

        {/* Pending */}

        <StatCard
          title="Pending"
          value={String(
            pendingCount,
          )}
          icon={Clock}
          iconClassName="bg-orange-100 text-orange-600"
        />

        {/* Failed */}

        <StatCard
          title="Failed"
          value={String(
            failedCount,
          )}
          icon={AlertCircle}
          iconClassName="bg-red-100 text-red-600"
        />

      </motion.div>

      {/* =================================================
          TRANSACTIONS CARD
      ================================================= */}

      <motion.div
        initial={{
          opacity: 0,
          y: 16,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
          delay: 0.1,
        }}
      >

        <Card className="border shadow-sm">

          <CardContent className="p-0">

            {/* =================================================
                SEARCH + FILTERS
            ================================================= */}

            <div className="flex flex-col gap-4 border-b p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

              {/* Search */}

              <div className="relative w-full lg:max-w-sm">

                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  placeholder="Search by txn ID, employee, UTR..."
                  value={search}
                  onChange={(event) => {
                    setSearch(
                      event.target.value,
                    );

                    setCurrentPage(
                      1,
                    );
                  }}
                  className="pl-9"
                />

              </div>

              {/* Filters */}

              <div className="flex flex-wrap items-center gap-3">

                {/* Status */}

                <Select
                  value={
                    statusFilter
                  }
                  onValueChange={(
                    value,
                  ) => {
                    setStatusFilter(
                      value,
                    );

                    setCurrentPage(
                      1,
                    );
                  }}
                >

                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>

                  <SelectContent>

                    <SelectItem
                      value={
                        ALL_FILTER
                      }
                    >
                      All Status
                    </SelectItem>

                    <SelectItem value="Paid">
                      Paid
                    </SelectItem>

                    <SelectItem value="Pending">
                      Pending
                    </SelectItem>

                    <SelectItem value="Failed">
                      Failed
                    </SelectItem>

                  </SelectContent>

                </Select>

                {/* Method */}

                <Select
                  value={
                    methodFilter
                  }
                  onValueChange={(
                    value,
                  ) => {
                    setMethodFilter(
                      value,
                    );

                    setCurrentPage(
                      1,
                    );
                  }}
                >

                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>

                  <SelectContent>

                    <SelectItem
                      value={
                        ALL_FILTER
                      }
                    >
                      All Methods
                    </SelectItem>

                    <SelectItem value="NEFT">
                      NEFT
                    </SelectItem>

                    <SelectItem value="IMPS">
                      IMPS
                    </SelectItem>

                    <SelectItem value="RTGS">
                      RTGS
                    </SelectItem>

                    <SelectItem value="UPI">
                      UPI
                    </SelectItem>

                  </SelectContent>

                </Select>

                {/* Refresh */}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={
                    fetchPayments
                  }
                >
                  <RefreshCw className="mr-1 h-4 w-4" />
                  Refresh
                </Button>

                {/* Clear */}

                {(search.trim() !== "" ||
                  statusFilter !==
                    ALL_FILTER ||
                  methodFilter !==
                    ALL_FILTER) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={
                      clearFilters
                    }
                  >
                    <X className="mr-1 h-4 w-4" />
                    Clear
                  </Button>
                )}

              </div>

            </div>

            {/* =================================================
                TABLE
            ================================================= */}

            <div className="overflow-x-auto">

              <Table>

                <TableHeader>

                  <TableRow className="hover:bg-transparent">

                    <TableHead>
                      Transaction ID
                    </TableHead>

                    <SortableHeader
                      sortKey="employeeName"
                      currentSortKey={
                        sortKey
                      }
                      currentDirection={
                        sortDirection
                      }
                      onSort={
                        handleSort
                      }
                    >
                      Employee
                    </SortableHeader>

                    <TableHead>
                      Department
                    </TableHead>

                    <SortableHeader
                      sortKey="amount"
                      currentSortKey={
                        sortKey
                      }
                      currentDirection={
                        sortDirection
                      }
                      onSort={
                        handleSort
                      }
                    >
                      Amount
                    </SortableHeader>

                    <SortableHeader
                      sortKey="date"
                      currentSortKey={
                        sortKey
                      }
                      currentDirection={
                        sortDirection
                      }
                      onSort={
                        handleSort
                      }
                    >
                      Date
                    </SortableHeader>

                    <TableHead>
                      Method
                    </TableHead>

                    <SortableHeader
                      sortKey="status"
                      currentSortKey={
                        sortKey
                      }
                      currentDirection={
                        sortDirection
                      }
                      onSort={
                        handleSort
                      }
                    >
                      Status
                    </SortableHeader>

                    <TableHead className="pr-6 text-right">
                      Action
                    </TableHead>

                  </TableRow>

                </TableHeader>

                <TableBody>

                  {/* =================================================
                      NO DATA
                  ================================================= */}

                  {paginatedTransactions.length ===
                  0 ? (

                    <TableRow>

                      <TableCell
                        colSpan={8}
                        className="h-40 text-center"
                      >

                        <div className="flex flex-col items-center justify-center">

                          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">

                            <IndianRupee className="h-6 w-6 text-muted-foreground" />

                          </div>

                          <p className="font-medium">
                            No transactions found
                          </p>

                          <p className="mt-1 text-sm text-muted-foreground">
                            No payment records match your current filters.
                          </p>

                          {(search ||
                            statusFilter !==
                              ALL_FILTER ||
                            methodFilter !==
                              ALL_FILTER) && (
                            <Button
                              variant="outline"
                              className="mt-4"
                              onClick={
                                clearFilters
                              }
                            >
                              Clear Filters
                            </Button>
                          )}

                        </div>

                      </TableCell>

                    </TableRow>

                  ) : (

                    /* =================================================
                       PAYMENT ROWS
                    ================================================= */

                    paginatedTransactions.map(
                      (payment) => (

                        <TableRow
                          key={
                            payment.id
                          }
                          className="cursor-pointer transition-colors"
                          onClick={() =>
                            openDetail(
                              payment,
                            )
                          }
                        >

                          {/* Transaction ID */}

                          <TableCell className="font-medium">
                            {
                              payment.id
                            }
                          </TableCell>

                          {/* Employee */}

                          <TableCell>
                            {
                              payment.employeeName ||
                              "—"
                            }
                          </TableCell>

                          {/* Department */}

                          <TableCell>
                            {
                              payment.department ||
                              "—"
                            }
                          </TableCell>

                          {/* Amount */}

                          <TableCell>
                            {formatCurrency(
                              payment.amount,
                            )}
                          </TableCell>

                          {/* Date */}

                          <TableCell>
                            {payment.date
                              ? formatDate(
                                  payment.date,
                                )
                              : "—"}
                          </TableCell>

                          {/* Method */}

                          <TableCell>
                            {payment.method ||
                              "—"}
                          </TableCell>

                          {/* Status */}

                          <TableCell>

                            <Badge
                              variant={statusVariant(
                                payment.status,
                              )}
                            >
                              {
                                payment.status
                              }
                            </Badge>

                          </TableCell>

                          {/* Action */}

                          <TableCell className="pr-6 text-right">

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-accent"
                              onClick={(
                                event,
                              ) => {
                                event.stopPropagation();

                                openDetail(
                                  payment,
                                );
                              }}
                            >

                              <Eye className="h-4 w-4" />

                              <span className="sr-only">
                                View{" "}
                                {
                                  payment.id
                                }
                              </span>

                            </Button>

                          </TableCell>

                        </TableRow>

                      ),
                    )

                  )}

                </TableBody>

              </Table>

            </div>

            {/* =================================================
                PAGINATION
            ================================================= */}

            {totalItems > 0 && (

              <PaginationControls
                currentPage={
                  safePage
                }
                totalPages={
                  totalPages
                }
                pageSize={
                  pageSize
                }
                totalItems={
                  totalItems
                }
                pageSizeOptions={
                  PAGE_SIZE_OPTIONS
                }
                startItem={
                  startItem
                }
                endItem={
                  endItem
                }
                visiblePages={getVisiblePages(
                  safePage,
                  totalPages,
                )}
                onPageChange={
                  setCurrentPage
                }
                onPageSizeChange={(
                  size,
                ) => {
                  setPageSize(
                    size,
                  );

                  setCurrentPage(
                    1,
                  );
                }}
              />

            )}

          </CardContent>

        </Card>

      </motion.div>

    </div>
  );
}