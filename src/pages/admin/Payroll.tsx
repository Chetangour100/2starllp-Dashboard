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

import {
  formatCurrency,
  formatDate,
} from "@/lib/formatters";

import { getVisiblePages } from "@/lib/pagination";

import apiClient from "@/api/client";
import { API_CONFIG } from "@/api/config";

import {
  CheckCircle,
  Eye,
  IndianRupee,
  Search,
  Users,
  X,
  Plus,
  RefreshCw,
  Clock,
} from "lucide-react";

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

interface PayrollRun {
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
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/* =====================================================
   API RESPONSE
===================================================== */

interface PayrollApiResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: PayrollRun[];
}

/* =====================================================
   SORT TYPES
===================================================== */

type SortKey =
  | "month"
  | "totalEmployees"
  | "netPayroll"
  | "status";

type SortDirection = "asc" | "desc";

/* =====================================================
   CONSTANTS
===================================================== */

const PAGE_SIZE_OPTIONS = [5, 10, 25];

const ALL_FILTER = "all";

/* =====================================================
   STATUS BADGE
===================================================== */

function statusVariant(
  status: PayrollStatus
) {
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
   COMPONENT
===================================================== */

export default function Payroll() {
  const navigate = useNavigate();

  /* ===================================================
     STATE
  =================================================== */

  const [payrolls, setPayrolls] = useState<
    PayrollRun[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState(ALL_FILTER);

  const [sortKey, setSortKey] =
    useState<SortKey>("month");

  const [sortDirection, setSortDirection] =
    useState<SortDirection>("desc");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(10);

  /* ===================================================
     FETCH PAYROLLS
  =================================================== */

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        await apiClient.get<PayrollRun[]>(
          API_CONFIG.ENDPOINTS.PAYROLL.LIST
        );

      console.log(
        "Payroll API Response:",
        response
      );

      const data =
        response?.data ?? [];

      setPayrolls(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err: any) {
      console.error(
        "Payroll fetch error:",
        err
      );

      setError(
        err?.message ||
          "Failed to fetch payroll records"
      );

      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  };

  /* ===================================================
     INITIAL FETCH
  =================================================== */

  useEffect(() => {
    fetchPayrolls();
  }, []);

  /* ===================================================
     SORT
  =================================================== */

  const handleSort = (
    key: string
  ) => {
    const typedKey =
      key as SortKey;

    if (sortKey === typedKey) {
      setSortDirection(
        (previous) =>
          previous === "asc"
            ? "desc"
            : "asc"
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

  const filteredPayrolls =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return payrolls
        .filter((payroll) => {
          const matchesSearch =
            !query ||
            payroll.id
              .toLowerCase()
              .includes(query) ||
            payroll.month
              .toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter ===
              ALL_FILTER ||
            payroll.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        })
        .sort((a, b) => {
          let comparison = 0;

          switch (sortKey) {
            case "month":
              comparison =
                new Date(
                  a.periodStart
                ).getTime() -
                new Date(
                  b.periodStart
                ).getTime();
              break;

            case "totalEmployees":
              comparison =
                a.totalEmployees -
                b.totalEmployees;
              break;

            case "netPayroll":
              comparison =
                a.netPayroll -
                b.netPayroll;
              break;

            case "status":
              comparison =
                a.status.localeCompare(
                  b.status
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
      payrolls,
      search,
      statusFilter,
      sortKey,
      sortDirection,
    ]);

  /* ===================================================
     PAGINATION
  =================================================== */

  const totalItems =
    filteredPayrolls.length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalItems / pageSize
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedPayrolls =
    useMemo(() => {
      const start =
        (safePage - 1) *
        pageSize;

      return filteredPayrolls.slice(
        start,
        start + pageSize
      );
    }, [
      filteredPayrolls,
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
    totalItems
  );

  /* ===================================================
     STATISTICS
  =================================================== */

  const totalRuns =
    payrolls.length;

  const completedRuns =
    payrolls.filter(
      (payroll) =>
        payroll.status ===
        "Completed"
    ).length;

  const processingRuns =
    payrolls.filter(
      (payroll) =>
        payroll.status ===
        "Processing"
    ).length;

  const pendingRuns =
    payrolls.filter(
      (payroll) =>
        payroll.status ===
        "Pending"
    ).length;

  const latestPayroll =
    [...payrolls].sort(
      (a, b) =>
        new Date(
          b.periodStart
        ).getTime() -
        new Date(
          a.periodStart
        ).getTime()
    )[0];

  const latestNetPayroll =
    latestPayroll?.netPayroll ??
    0;

  /* ===================================================
     OPEN PAYROLL DETAILS
  =================================================== */

  const openPayrollDetails = (
    payrollId: string
  ) => {
    navigate(
      `/admin/payroll/${payrollId}`
    );
  };

  /* ===================================================
     CREATE PAYROLL
  =================================================== */

  const openCreatePayroll = () => {
    navigate(
      "/admin/payroll/create"
    );
  };

  /* ===================================================
     CLEAR FILTERS
  =================================================== */

  const clearFilters = () => {
    setSearch("");
    setStatusFilter(
      ALL_FILTER
    );
    setCurrentPage(1);
  };

  /* ===================================================
     LOADING
  =================================================== */

  if (loading) {
    return (
      <div className="space-y-6">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <PageHeader
            heading="Payroll"
            subHeading="Process and review monthly payroll runs."
          />

          <Button
            onClick={
              openCreatePayroll
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Payroll
          </Button>
        </div>

        <Card>
          <CardContent className="flex min-h-[300px] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">

              <RefreshCw className="h-6 w-6 animate-spin" />

              <p>
                Loading payroll records...
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

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <PageHeader
            heading="Payroll"
            subHeading="Process and review monthly payroll runs."
          />

          <Button
            onClick={
              openCreatePayroll
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Payroll
          </Button>

        </div>

        <Card>
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center text-center">

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <X className="h-7 w-7 text-destructive" />
            </div>

            <h2 className="text-lg font-semibold">
              Failed to load payroll
            </h2>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {error}
            </p>

            <Button
              className="mt-5"
              onClick={
                fetchPayrolls
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <PageHeader
          heading="Payroll"
          subHeading="Process and review monthly payroll runs."
        />

        <Button
          onClick={
            openCreatePayroll
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Payroll
        </Button>

      </div>

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

        {/* Total Runs */}

        <StatCard
          title="Total Runs"
          value={String(
            totalRuns
          )}
          icon={
            IndianRupee
          }
          iconClassName="bg-violet-100 text-violet-600"
        />

        {/* Completed */}

        <StatCard
          title="Completed"
          value={String(
            completedRuns
          )}
          icon={
            CheckCircle
          }
          iconClassName="bg-emerald-100 text-emerald-600"
        />

        {/* Processing */}

        <StatCard
          title="Processing"
          value={String(
            processingRuns
          )}
          icon={Clock}
          iconClassName="bg-orange-100 text-orange-600"
        />

        {/* Latest Net Payroll */}

        <StatCard
          title="Latest Net Payroll"
          value={formatCurrency(
            latestNetPayroll
          )}
          icon={
            IndianRupee
          }
          iconClassName="bg-blue-100 text-blue-600"
        />

      </motion.div>

      {/* =================================================
          PAYROLL TABLE
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
                SEARCH + FILTER
            ================================================= */}

            <div className="flex flex-col gap-4 border-b p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

              {/* Search */}

              <div className="relative w-full lg:max-w-sm">

                <Search
                  className="
                    absolute
                    left-3
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-muted-foreground
                  "
                />

                <Input
                  placeholder="Search by month or payroll ID..."
                  value={search}
                  onChange={(
                    event
                  ) => {
                    setSearch(
                      event.target.value
                    );

                    setCurrentPage(
                      1
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
                    value
                  ) => {
                    setStatusFilter(
                      value
                    );

                    setCurrentPage(
                      1
                    );
                  }}
                >

                  <SelectTrigger className="w-[160px]">
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

                    <SelectItem value="Completed">
                      Completed
                    </SelectItem>

                    <SelectItem value="Processing">
                      Processing
                    </SelectItem>

                    <SelectItem value="Pending">
                      Pending
                    </SelectItem>

                  </SelectContent>

                </Select>

                {/* Refresh */}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={
                    fetchPayrolls
                  }
                >
                  <RefreshCw className="mr-1 h-4 w-4" />
                  Refresh
                </Button>

                {/* Clear */}

                {(search.trim() !== "" ||
                  statusFilter !==
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

                {/* TABLE HEADER */}

                <TableHeader>

                  <TableRow className="hover:bg-transparent">

                    <TableHead>
                      Payroll ID
                    </TableHead>

                    <SortableHeader
                      sortKey="month"
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
                      Month
                    </SortableHeader>

                    <SortableHeader
                      sortKey="totalEmployees"
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
                      Employees
                    </SortableHeader>

                    <TableHead>
                      Gross Pay
                    </TableHead>

                    <SortableHeader
                      sortKey="netPayroll"
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
                      Net Pay
                    </SortableHeader>

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

                    <TableHead>
                      Processed
                    </TableHead>

                    <TableHead className="pr-6 text-right">
                      Action
                    </TableHead>

                  </TableRow>

                </TableHeader>

                {/* TABLE BODY */}

                <TableBody>

                  {paginatedPayrolls.length ===
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
                            No payroll runs found
                          </p>

                          <p className="mt-1 text-sm text-muted-foreground">
                            Create your first payroll run to see it here.
                          </p>

                          <Button
                            className="mt-4"
                            onClick={
                              openCreatePayroll
                            }
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Create Payroll
                          </Button>

                        </div>

                      </TableCell>

                    </TableRow>

                  ) : (

                    paginatedPayrolls.map(
                      (
                        payroll
                      ) => (

                        <TableRow
                          key={
                            payroll.id
                          }
                          className="
                            cursor-pointer
                            transition-colors
                          "
                          onClick={() =>
                            openPayrollDetails(
                              payroll.id
                            )
                          }
                        >

                          {/* Payroll ID */}

                          <TableCell className="font-medium">
                            {
                              payroll.id
                            }
                          </TableCell>

                          {/* Month */}

                          <TableCell>
                            {
                              payroll.month
                            }
                          </TableCell>

                          {/* Employees */}

                          <TableCell>
                            {
                              payroll.totalEmployees
                            }
                          </TableCell>

                          {/* Gross */}

                          <TableCell>
                            {formatCurrency(
                              payroll.grossPayroll
                            )}
                          </TableCell>

                          {/* Net */}

                          <TableCell>
                            {formatCurrency(
                              payroll.netPayroll
                            )}
                          </TableCell>

                          {/* Status */}

                          <TableCell>

                            <Badge
                              variant={statusVariant(
                                payroll.status
                              )}
                            >
                              {
                                payroll.status
                              }
                            </Badge>

                          </TableCell>

                          {/* Processed */}

                          <TableCell>
                            {payroll.processedDate
                              ? formatDate(
                                  payroll.processedDate
                                )
                              : "—"}
                          </TableCell>

                          {/* Action */}

                          <TableCell className="pr-6 text-right">

                            <Button
                              variant="ghost"
                              size="icon"
                              className="
                                h-8
                                w-8
                                text-accent
                              "
                              onClick={(
                                event
                              ) => {
                                event.stopPropagation();

                                openPayrollDetails(
                                  payroll.id
                                );
                              }}
                            >

                              <Eye className="h-4 w-4" />

                              <span className="sr-only">
                                View{" "}
                                {
                                  payroll.month
                                }
                              </span>

                            </Button>

                          </TableCell>

                        </TableRow>

                      )
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
                  totalPages
                )}
                onPageChange={
                  setCurrentPage
                }
                onPageSizeChange={(
                  size
                ) => {
                  setPageSize(
                    size
                  );

                  setCurrentPage(
                    1
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