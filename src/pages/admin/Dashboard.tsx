import PageHeader from "@/components/common/PageHeader";

import {
  DashboardChart,
  PayrollChart,
} from "@/components/dashboard/DashboardChart";

import { RecentEmployeesTable } from "@/components/dashboard/RecentEmployeesTable";
import { RecentPayrollsTable } from "@/components/dashboard/RecentPayrollsTable";
import { RecentPaymentsTable } from "@/components/dashboard/RecentPaymentsTable";
import { StatCard } from "@/components/dashboard/StatCard";

import { useDashboard } from "@/api/hooks/useDashboard";

import {
  formatCurrency,
  formatDate,
} from "@/lib/formatters";

import {
  Calendar,
  IndianRupee,
  Users,
} from "lucide-react";

import { motion } from "framer-motion";

export default function Dashboard() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useDashboard();

  /* =====================================================
     LOADING
  ===================================================== */

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          heading="Dashboard"
          subHeading="Welcome to your 2Star Staffing payroll dashboard."
        />

        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />

            <p className="text-sm text-muted-foreground">
              Loading dashboard data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <PageHeader
          heading="Dashboard"
          subHeading="Welcome to your 2Star Staffing payroll dashboard."
        />

        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
          <div className="space-y-3">
            <h2 className="font-semibold text-destructive">
              Unable to load dashboard
            </h2>

            <p className="text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Something went wrong while loading dashboard data."}
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     DASHBOARD DATA
  ===================================================== */

  const stats = data.stats;

  const employeesChart = Array.isArray(
    data.employeesChart
  )
    ? data.employeesChart
    : [];

  const payrollChart = Array.isArray(
    data.payrollChart
  )
    ? data.payrollChart
    : [];

  const recentEmployees = Array.isArray(
    data.recentEmployees
  )
    ? data.recentEmployees
    : [];

  const recentPayrolls = Array.isArray(
    data.recentPayrolls
  )
    ? data.recentPayrolls
    : [];

  const recentPayments = Array.isArray(
    data.recentPayments
  )
    ? data.recentPayments
    : [];

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="space-y-6">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <PageHeader
        heading="Dashboard"
        subHeading="Welcome to your 2Star Staffing payroll dashboard."
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

        {/* -------------------------------------------------
            TOTAL EMPLOYEES
        ------------------------------------------------- */}

        <StatCard
          title="Total Employees"
          value={String(
            stats.totalEmployees ?? 0
          )}
          trend={
            stats.employeesTrend
          }
          icon={Users}
          iconClassName="bg-blue-100 text-blue-600"
        />

        {/* -------------------------------------------------
            THIS MONTH PAYROLL
        ------------------------------------------------- */}

        <StatCard
          title="Total Payroll (This Month)"
          value={formatCurrency(
            stats.payrollThisMonth ?? 0
          )}
          trend={
            stats.payrollMonthTrend
          }
          icon={IndianRupee}
          iconClassName="bg-emerald-100 text-emerald-600"
        />

        {/* -------------------------------------------------
            THIS YEAR PAYROLL
        ------------------------------------------------- */}

        <StatCard
          title="Total Payroll (This Year)"
          value={formatCurrency(
            stats.payrollThisYear ?? 0
          )}
          trend={
            stats.payrollYearTrend
          }
          icon={Calendar}
          iconClassName="bg-orange-100 text-orange-600"
        />

        {/* -------------------------------------------------
            NEXT PAYROLL DATE
        ------------------------------------------------- */}

        <StatCard
          title="Next Payroll Date"
          value={
            stats.nextPayrollDate
              ? formatDate(
                  stats.nextPayrollDate
                )
              : "Not scheduled"
          }
          subtitle={
            stats.payrollFrequency ||
            "Monthly"
          }
          icon={Calendar}
          iconClassName="bg-violet-100 text-violet-600"
        />

      </motion.div>

      {/* =================================================
          CHARTS
      ================================================= */}

      <motion.div
        className="grid gap-4 lg:grid-cols-2"
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

        {/* Employee Chart */}

        <DashboardChart
          title="Total Employees (Month Wise)"
          data={employeesChart}
        />

        {/* Payroll Chart */}

        <PayrollChart
          title="Total Payroll (Month Wise)"
          data={payrollChart}
        />

      </motion.div>

      {/* =================================================
          RECENT DATA
      ================================================= */}

      <motion.div
        className="grid gap-4 xl:grid-cols-3"
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
          delay: 0.2,
        }}
      >

        {/* Recent Employees */}

        <RecentEmployeesTable
          employees={recentEmployees}
        />

        {/* Recent Payrolls */}

        <RecentPayrollsTable
          payrolls={recentPayrolls}
        />

        {/* Recent Payments */}

        <RecentPaymentsTable
          payments={recentPayments}
        />

      </motion.div>

    </div>
  );
}