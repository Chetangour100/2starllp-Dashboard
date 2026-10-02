import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Edit,
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  MapPin,
  CreditCard,
  FileText,
  AlertCircle,
  Loader2,
  Download,
} from "lucide-react";

import { apiClient } from "@/api/client";
import { API_CONFIG } from "@/api/config";
import { payrollService } from "@/api/services/payrollService";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

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

import { Badge } from "@/components/ui/badge";

/* =========================================================
   SALARY HISTORY TYPE
========================================================= */

interface SalaryHistoryRow {
  payrollId: string;
  month: string;
  payrollStatus: string;
  workingDays: number;
  totalDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  totalDeductions: number;
  netSalary: number;
  paymentStatus: string;
}

/* =========================================================
   TYPES
========================================================= */

interface Employee {
  _id?: string;
  id?: string;
  employeeId?: string;

  /* BASIC DETAILS */
  name?: string;
  firstName?: string;
  lastName?: string;

  email?: string;
  phone?: string;

  /* JOB DETAILS */
  department?: string;
  designation?: string;

  joiningDate?: string;
  dateOfJoining?: string;

  salary?: number | string;

  status?: string;

  /* ADDRESS */
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;

  /* EMERGENCY */
  emergencyContact?: string;

  /* BANK DETAILS */
  bankName?: string;
  bankAccount?: string;
  accountNumber?: string;
  ifscCode?: string;

  /* TAX */
  panNumber?: string;
  pan?: string;

  /* PERSONAL */
  gender?: string;
  dateOfBirth?: string;

  /* SYSTEM */
  createdAt?: string;
  updatedAt?: string;
}

/* =========================================================
   HELPERS
========================================================= */

const formatDate = (date?: string) => {
  if (!date) {
    return "Not available";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* =========================================================
   FORMAT SALARY
========================================================= */

const formatSalary = (
  salary?: number | string
) => {
  if (
    salary === undefined ||
    salary === null ||
    salary === ""
  ) {
    return "Not available";
  }

  const numericSalary = Number(salary);

  if (Number.isNaN(numericSalary)) {
    return String(salary);
  }

  return `₹${numericSalary.toLocaleString("en-IN")}`;
};

/* =========================================================
   EMPLOYEE NAME
========================================================= */

const getEmployeeName = (
  employee: Employee
) => {
  if (employee.name) {
    return employee.name;
  }

  const fullName = [
    employee.firstName,
    employee.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    fullName ||
    "Unknown Employee"
  );
};

/* =========================================================
   EMPLOYEE ID
========================================================= */

const getEmployeeId = (
  employee: Employee
) => {
  return (
    employee.employeeId ||
    employee.id ||
    employee._id ||
    "N/A"
  );
};

/* =========================================================
   INFO ROW
========================================================= */

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string | number;
}

const InfoRow = ({
  icon,
  label,
  value,
}: InfoRowProps) => {
  return (
    <div className="flex items-start gap-3 py-3">

      {/* ICON */}

      <div className="mt-0.5 text-slate-500">
        {icon}
      </div>

      {/* CONTENT */}

      <div className="min-w-0">

        <p className="text-sm text-slate-500">
          {label}
        </p>

        <p className="mt-1 break-words font-medium text-slate-900">
          {value !== undefined &&
          value !== null &&
          String(value).trim() !== ""
            ? value
            : "Not available"}
        </p>

      </div>

    </div>
  );
};

/* =========================================================
   EMPLOYEE DETAILS
========================================================= */

const EmployeeDetails = () => {
  const { id } =
    useParams<{ id: string }>();

  const navigate =
    useNavigate();

  const [
    employee,
    setEmployee,
  ] = useState<Employee | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    salaryHistory,
    setSalaryHistory,
  ] = useState<SalaryHistoryRow[]>([]);

  const [
    salaryHistoryLoading,
    setSalaryHistoryLoading,
  ] = useState(false);

  /* =======================================================
     FETCH EMPLOYEE
  ======================================================= */

  useEffect(() => {
    const fetchEmployee =
      async () => {
        if (!id) {
          setError(
            "Employee ID is missing."
          );

          setLoading(false);

          return;
        }

        try {
          setLoading(true);
          setError(null);

          console.log(
            "Fetching employee:",
            id
          );

          /* =================================================
             FIRST TRY:
             GET /api/employees/:id
          ================================================= */

          try {
            const detailResponse =
              await apiClient.get<any>(
                API_CONFIG.ENDPOINTS.EMPLOYEES.DETAIL(
                  id
                )
              );

            console.log(
              "Employee detail response:",
              detailResponse
            );

            /*
             * Possible backend responses:
             *
             * {
             *   success: true,
             *   data: {...}
             * }
             *
             * OR
             *
             * {
             *   data: {
             *     employee: {...}
             *   }
             * }
             *
             * OR direct employee object
             */

            const responseData =
              detailResponse?.data;

            /* ---------------------------------------------
               CASE 1:
               data.employee
            --------------------------------------------- */

            if (
              responseData?.employee
            ) {
              setEmployee(
                responseData.employee
              );

              return;
            }

            /* ---------------------------------------------
               CASE 2:
               data.data
            --------------------------------------------- */

            if (
              responseData?.data
            ) {
              setEmployee(
                responseData.data
              );

              return;
            }

            /* ---------------------------------------------
               CASE 3:
               data itself is employee
            --------------------------------------------- */

            if (
              responseData &&
              !Array.isArray(
                responseData
              ) &&
              (
                responseData.employeeId ||
                responseData.id ||
                responseData._id
              )
            ) {
              setEmployee(
                responseData
              );

              return;
            }

            /* ---------------------------------------------
               CASE 4:
               direct response data
            --------------------------------------------- */

            if (
              detailResponse &&
              (
                (detailResponse as any).employeeId ||
                (detailResponse as any).id ||
                (detailResponse as any)._id
              )
            ) {
              setEmployee(
                detailResponse as any
              );

              return;
            }

          } catch (
            detailError
          ) {
            console.log(
              "Detail API failed, trying employee list...",
              detailError
            );
          }

          /* =================================================
             FALLBACK:
             GET /api/employees
          ================================================= */

          const listResponse =
            await apiClient.get<any>(
              API_CONFIG.ENDPOINTS.EMPLOYEES.LIST
            );

          console.log(
            "Employee list response:",
            listResponse
          );

          let employees: Employee[] =
            [];

          const responseData =
            listResponse?.data;

          /* ---------------------------------------------
             CASE 1:
             data is array
          --------------------------------------------- */

          if (
            Array.isArray(
              responseData
            )
          ) {
            employees =
              responseData;
          }

          /* ---------------------------------------------
             CASE 2:
             data.employees
          --------------------------------------------- */

          else if (
            Array.isArray(
              responseData?.employees
            )
          ) {
            employees =
              responseData.employees;
          }

          /* ---------------------------------------------
             CASE 3:
             data.data
          --------------------------------------------- */

          else if (
            Array.isArray(
              responseData?.data
            )
          ) {
            employees =
              responseData.data;
          }

          /* ---------------------------------------------
             CASE 4:
             data.items
          --------------------------------------------- */

          else if (
            Array.isArray(
              responseData?.items
            )
          ) {
            employees =
              responseData.items;
          }

          /* ---------------------------------------------
             CASE 5:
             response itself array
          --------------------------------------------- */

          else if (
            Array.isArray(
              listResponse
            )
          ) {
            employees =
              listResponse;
          }

          console.log(
            "Employees found:",
            employees
          );

          /* =================================================
             FIND EMPLOYEE
          ================================================= */

          const foundEmployee =
            employees.find(
              (
                employee
              ) => {
                const employeeId =
                  employee.employeeId;

                const mongoId =
                  employee._id;

                const normalId =
                  employee.id;

                return (
                  employeeId === id ||
                  mongoId === id ||
                  normalId === id
                );
              }
            );

          if (!foundEmployee) {
            throw new Error(
              `Employee ${id} not found`
            );
          }

          setEmployee(
            foundEmployee
          );

        } catch (err: any) {
          console.error(
            "Employee API Error:",
            err
          );

          setError(
            err?.message ||
              "Employee details load nahi ho pa rahe hain."
          );

        } finally {
          setLoading(false);
        }
      };

    fetchEmployee();
  }, [id]);

  /* =======================================================
     FETCH SALARY HISTORY
     (employee ki ab tak ki saari payroll history —
     employeeId ready hote hi fetch hoti hai)
  ======================================================= */

  useEffect(() => {
    const employeeCode =
      employee?.employeeId;

    if (!employeeCode) {
      return;
    }

    const fetchSalaryHistory =
      async () => {
        try {
          setSalaryHistoryLoading(true);

          const response =
            await apiClient.get<any>(
              API_CONFIG.ENDPOINTS.PAYROLL.EMPLOYEE_HISTORY(
                employeeCode
              )
            );

          const rows =
            response?.data ?? [];

          setSalaryHistory(
            Array.isArray(rows)
              ? rows
              : []
          );
        } catch (err) {
          console.error(
            "Failed to load salary history:",
            err
          );
        } finally {
          setSalaryHistoryLoading(false);
        }
      };

    fetchSalaryHistory();
  }, [employee?.employeeId]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">

        <div className="flex flex-col items-center gap-3">

          <Loader2 className="h-8 w-8 animate-spin text-blue-700" />

          <p className="text-sm text-slate-500">
            Loading employee details...
          </p>

        </div>

      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (
    error ||
    !employee
  ) {
    return (
      <div className="flex min-h-[500px] items-center justify-center px-4">

        <Card className="w-full max-w-lg">

          <CardContent className="flex flex-col items-center p-8 text-center">

            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">

              <AlertCircle className="h-8 w-8 text-red-600" />

            </div>

            <h2 className="text-xl font-semibold text-slate-900">
              Employee Not Found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error ||
                "The employee you are looking for does not exist."}
            </p>

            <div className="mt-6 flex gap-3">

              <Button
                variant="outline"
                onClick={() =>
                  navigate(
                    "/admin/employees"
                  )
                }
              >
                <ArrowLeft className="mr-2 h-4 w-4" />

                Back to Employees
              </Button>

              <Button
                onClick={() =>
                  window.location.reload()
                }
              >
                Try Again
              </Button>

            </div>

          </CardContent>

        </Card>

      </div>
    );
  }

  /* =======================================================
     EMPLOYEE DATA
  ======================================================= */

  const employeeName =
    getEmployeeName(
      employee
    );

  const employeeId =
    getEmployeeId(
      employee
    );

  const status =
    employee.status ||
    "Active";

  /* =======================================================
     ADDRESS
  ======================================================= */

  const address = [
    employee.address,
    employee.city,
    employee.state,
    employee.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  /* =======================================================
     BANK DETAILS
  ======================================================= */

  const bankName =
    employee.bankName ||
    "";

  const bankAccount =
    employee.bankAccount ||
    employee.accountNumber ||
    "";

  const ifscCode =
    employee.ifscCode
      ?.toUpperCase() ||
    "";

  const panNumber =
    employee.panNumber ||
    employee.pan ||
    "";

  /* =======================================================
     AVATAR INITIALS
  ======================================================= */

  const initials =
    employeeName
      .split(" ")
      .map(
        (name) =>
          name.charAt(0)
      )
      .slice(0, 2)
      .join("")
      .toUpperCase();

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="space-y-6 p-6">

      {/* =================================================
          TOP BAR
      ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <Button
            variant="ghost"
            className="mb-2 -ml-3"
            onClick={() =>
              navigate(
                "/admin/employees"
              )
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />

            Back to Employees
          </Button>

          <h1 className="text-2xl font-bold text-slate-900">
            Employee Details
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View complete employee information.
          </p>

        </div>

        <Link
          to={`/admin/employees/${employeeId}/edit`}
        >
          <Button>

            <Edit className="mr-2 h-4 w-4" />

            Edit Employee

          </Button>
        </Link>

      </div>

      {/* =================================================
          EMPLOYEE HEADER
      ================================================= */}

      <Card>

        <CardContent className="p-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            {/* AVATAR */}

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-100">

              <span className="text-2xl font-bold text-blue-700">
                {initials}
              </span>

            </div>

            {/* BASIC INFO */}

            <div className="flex-1">

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

                <h2 className="text-2xl font-bold text-slate-900">
                  {employeeName}
                </h2>

                <Badge>
                  {status}
                </Badge>

              </div>

              <p className="mt-1 text-sm text-slate-500">

                Employee ID:{" "}

                <span className="font-medium text-slate-700">
                  {employeeId}
                </span>

              </p>

              <p className="mt-1 text-sm text-slate-500">

                {employee.designation ||
                  "Designation not available"}

                {employee.department
                  ? ` • ${employee.department}`
                  : ""}

              </p>

            </div>

          </div>

        </CardContent>

      </Card>

      {/* =================================================
          PERSONAL INFORMATION
      ================================================= */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">

            <User className="h-5 w-5" />

            Personal Information

          </CardTitle>

        </CardHeader>

        <CardContent>

          <div className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">

            {/* LEFT */}

            <div className="pr-0 sm:pr-6">

              <InfoRow
                icon={
                  <Mail className="h-4 w-4" />
                }
                label="Email"
                value={
                  employee.email
                }
              />

              <InfoRow
                icon={
                  <Phone className="h-4 w-4" />
                }
                label="Phone"
                value={
                  employee.phone
                }
              />

              <InfoRow
                icon={
                  <User className="h-4 w-4" />
                }
                label="Gender"
                value={
                  employee.gender
                }
              />

            </div>

            {/* RIGHT */}

            <div className="pl-0 sm:pl-6">

              <InfoRow
                icon={
                  <Calendar className="h-4 w-4" />
                }
                label="Date of Birth"
                value={formatDate(
                  employee.dateOfBirth
                )}
              />

              <InfoRow
                icon={
                  <MapPin className="h-4 w-4" />
                }
                label="Address"
                value={
                  address ||
                  "Not available"
                }
              />

              <InfoRow
                icon={
                  <Phone className="h-4 w-4" />
                }
                label="Emergency Contact"
                value={
                  employee.emergencyContact
                }
              />

            </div>

          </div>

        </CardContent>

      </Card>

      {/* =================================================
          EMPLOYMENT INFORMATION
      ================================================= */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">

            <Briefcase className="h-5 w-5" />

            Employment Information

          </CardTitle>

        </CardHeader>

        <CardContent>

          <div className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">

            {/* LEFT */}

            <div className="pr-0 sm:pr-6">

              <InfoRow
                icon={
                  <Briefcase className="h-4 w-4" />
                }
                label="Department"
                value={
                  employee.department
                }
              />

              <InfoRow
                icon={
                  <Briefcase className="h-4 w-4" />
                }
                label="Designation"
                value={
                  employee.designation
                }
              />

            </div>

            {/* RIGHT */}

            <div className="pl-0 sm:pl-6">

              <InfoRow
                icon={
                  <Calendar className="h-4 w-4" />
                }
                label="Joining Date"
                value={formatDate(
                  employee.joiningDate ||
                    employee.dateOfJoining
                )}
              />

              <InfoRow
                icon={
                  <CreditCard className="h-4 w-4" />
                }
                label="Salary"
                value={formatSalary(
                  employee.salary
                )}
              />

            </div>

          </div>

        </CardContent>

      </Card>

      {/* =================================================
          BANK INFORMATION
      ================================================= */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">

            <CreditCard className="h-5 w-5" />

            Bank Information

          </CardTitle>

        </CardHeader>

        <CardContent>

          <div className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">

            {/* LEFT COLUMN */}

            <div className="pr-0 sm:pr-6">

              {/* BANK NAME */}

              <InfoRow
                icon={
                  <CreditCard className="h-4 w-4" />
                }
                label="Bank Name"
                value={
                  bankName ||
                  "Not available"
                }
              />

              {/* ACCOUNT NUMBER */}

              <InfoRow
                icon={
                  <CreditCard className="h-4 w-4" />
                }
                label="Account Number"
                value={
                  bankAccount ||
                  "Not available"
                }
              />

            </div>

            {/* RIGHT COLUMN */}

            <div className="pl-0 sm:pl-6">

              {/* IFSC CODE */}

              <InfoRow
                icon={
                  <CreditCard className="h-4 w-4" />
                }
                label="IFSC Code"
                value={
                  ifscCode ||
                  "Not available"
                }
              />

              {/* PAN */}

              <InfoRow
                icon={
                  <FileText className="h-4 w-4" />
                }
                label="PAN Number"
                value={
                  panNumber ||
                  "Not available"
                }
              />

            </div>

          </div>

        </CardContent>

      </Card>

      {/* =================================================
          SALARY HISTORY
      ================================================= */}

      <Card>

        <CardHeader>
          <CardTitle>
            Salary History
          </CardTitle>
        </CardHeader>

        <CardContent>

          {salaryHistoryLoading ? (

            <div className="flex items-center justify-center py-8 text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading salary history...
            </div>

          ) : salaryHistory.length === 0 ? (

            <div className="py-8 text-center text-sm text-slate-500">
              No payroll has been run for this employee yet.
            </div>

          ) : (

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Working Days</TableHead>
                    <TableHead>Leave (Paid/Unpaid)</TableHead>
                    <TableHead className="text-right">Deduction</TableHead>
                    <TableHead className="text-right">Net Salary</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Payslip</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaryHistory.map((row) => (
                    <TableRow key={row.payrollId}>
                      <TableCell>
                        <div className="font-medium">{row.month}</div>
                        <div className="text-xs text-muted-foreground">
                          {row.payrollId}
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
                      <TableCell>
                        <Badge
                          variant={
                            row.paymentStatus === "Paid"
                              ? "default"
                              : row.paymentStatus === "Failed"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {row.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              await payrollService.downloadPayslip(
                                row.payrollId,
                                employee?.employeeId ?? ""
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
                  ))}
                </TableBody>
              </Table>
            </div>

          )}

        </CardContent>

      </Card>

      {/* =================================================
          SYSTEM INFORMATION
      ================================================= */}

      {(
        employee.createdAt ||
        employee.updatedAt
      ) && (

        <Card>

          <CardHeader>

            <CardTitle>
              Record Information
            </CardTitle>

          </CardHeader>

          <CardContent>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* CREATED */}

              {employee.createdAt && (
                <div>

                  <p className="text-sm text-slate-500">
                    Created At
                  </p>

                  <p className="mt-1 font-medium">
                    {formatDate(
                      employee.createdAt
                    )}
                  </p>

                </div>
              )}

              {/* UPDATED */}

              {employee.updatedAt && (
                <div>

                  <p className="text-sm text-slate-500">
                    Updated At
                  </p>

                  <p className="mt-1 font-medium">
                    {formatDate(
                      employee.updatedAt
                    )}
                  </p>

                </div>
              )}

            </div>

          </CardContent>

        </Card>

      )}

    </div>
  );
};

export default EmployeeDetails;