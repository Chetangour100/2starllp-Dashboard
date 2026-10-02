import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  Search,
  ChevronDown,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  CalendarDays,
  X,
  CheckCircle2,
} from "lucide-react";

import apiClient from "@/api/client";
import { API_CONFIG } from "@/api/config";

interface Employee {
  _id?: string;
  id?: string;
  employeeId?: string;

  name?: string;
  email?: string;
  phone?: string;

  department?: string;
  designation?: string;

  joiningDate?: string;
  salary?: number | string;

  status?: "Active" | "Inactive" | "On Leave" | string;

  address?: string;
  city?: string;
  state?: string;

  emergencyContact?: string;
  bankAccount?: string;
  panNumber?: string;

  gender?: string;
  dateOfBirth?: string;

  leaveStartDate?: string | null;
  leaveEndDate?: string | null;
}

interface LeaveModalData {
  employee: Employee | null;
  startDate: string;
  endDate: string;
}

type EmployeeStatus = "Active" | "Inactive";

const Employees = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState<Employee[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [department, setDepartment] =
    useState("All Departments");

  const [status, setStatus] =
    useState("All Status");

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [changingStatusId, setChangingStatusId] =
    useState<string | null>(null);

  const [givingLeaveId, setGivingLeaveId] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [leaveModal, setLeaveModal] =
    useState<LeaveModalData>({
      employee: null,
      startDate: "",
      endDate: "",
    });

  // =====================================================
  // GET BACKEND EMPLOYEE ID
  // =====================================================

  const getBackendEmployeeId = (
    employee: Employee
  ) => {
    return (
      employee.employeeId ||
      employee.id ||
      employee._id ||
      ""
    );
  };

  // =====================================================
  // DISPLAY EMPLOYEE ID
  // =====================================================

  const getEmployeeId = (
    employee: Employee
  ) => {
    return (
      employee.employeeId ||
      employee.id ||
      employee._id ||
      "-"
    );
  };

  // =====================================================
  // EMPLOYEE URL
  // =====================================================

  const getEmployeeUrl = (
    employee: Employee
  ) => {
    return `/admin/employees/${getBackendEmployeeId(
      employee
    )}`;
  };

  // =====================================================
  // DATE ONLY
  // =====================================================

  const getDateOnly = (
    date?: string | null
  ) => {
    if (!date) {
      return null;
    }

    return String(date).substring(0, 10);
  };

  // =====================================================
  // TODAY
  // =====================================================

  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =====================================================
  // CHECK CURRENT LEAVE
  // =====================================================

  const isCurrentlyOnLeave = (
    employee: Employee
  ) => {
    const startDate =
      getDateOnly(
        employee.leaveStartDate
      );

    const endDate =
      getDateOnly(
        employee.leaveEndDate
      );

    if (!startDate || !endDate) {
      return false;
    }

    const today = getTodayDate();

    return (
      today >= startDate &&
      today <= endDate
    );
  };

  // =====================================================
  // CHECK EXPIRED LEAVE
  // =====================================================

  const isLeaveExpired = (
    employee: Employee
  ) => {
    const endDate =
      getDateOnly(
        employee.leaveEndDate
      );

    if (!endDate) {
      return false;
    }

    const today = getTodayDate();

    return today > endDate;
  };

  // =====================================================
  // NORMALIZE STATUS
  //
  // IMPORTANT:
  //
  // Leave ke dauran:
  // On Leave -> Inactive
  //
  // Leave expire:
  // -> Active
  //
  // =====================================================

  const normalizeStatus = (
    employee: Employee
  ): EmployeeStatus => {
    const backendStatus =
      (
        employee.status ||
        "Active"
      )
        .trim()
        .toLowerCase();

    // -------------------------------------------------
    // CURRENT LEAVE
    // -------------------------------------------------

    if (
      isCurrentlyOnLeave(employee)
    ) {
      return "Inactive";
    }

    // -------------------------------------------------
    // EXPIRED LEAVE
    // -------------------------------------------------

    if (
      isLeaveExpired(employee)
    ) {
      return "Active";
    }

    // -------------------------------------------------
    // BACKEND ON LEAVE
    //
    // Agar backend On Leave bhej raha hai
    // aur date available nahi hai,
    // to Inactive treat karenge.
    // -------------------------------------------------

    if (
      backendStatus === "on leave" ||
      backendStatus === "on_leave" ||
      backendStatus === "on-leave" ||
      backendStatus === "leave"
    ) {
      return "Inactive";
    }

    // -------------------------------------------------
    // INACTIVE
    // -------------------------------------------------

    if (
      backendStatus === "inactive"
    ) {
      return "Inactive";
    }

    // -------------------------------------------------
    // ACTIVE
    // -------------------------------------------------

    return "Active";
  };

  // =====================================================
  // FETCH EMPLOYEES
  // =====================================================

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const endpoint =
        API_CONFIG.ENDPOINTS.EMPLOYEES.LIST;

      const response =
        await apiClient.get(endpoint);

      const responseData: any =
        response?.data;

      let employeeData: Employee[] = [];

      if (
        Array.isArray(responseData)
      ) {
        employeeData = responseData;
      } else if (
        responseData &&
        typeof responseData === "object"
      ) {
        if (
          Array.isArray(
            responseData.data
          )
        ) {
          employeeData =
            responseData.data;
        } else if (
          responseData.data &&
          typeof responseData.data ===
            "object"
        ) {
          if (
            Array.isArray(
              responseData.data.employees
            )
          ) {
            employeeData =
              responseData.data.employees;
          } else if (
            Array.isArray(
              responseData.data.items
            )
          ) {
            employeeData =
              responseData.data.items;
          } else if (
            Array.isArray(
              responseData.data.results
            )
          ) {
            employeeData =
              responseData.data.results;
          }
        } else if (
          Array.isArray(
            responseData.employees
          )
        ) {
          employeeData =
            responseData.employees;
        } else if (
          Array.isArray(
            responseData.items
          )
        ) {
          employeeData =
            responseData.items;
        } else if (
          Array.isArray(
            responseData.results
          )
        ) {
          employeeData =
            responseData.results;
        }
      }

      setEmployees(employeeData);
    } catch (err: any) {
      console.error(
        "Employees API Error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Employees load nahi ho rahe hain."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL FETCH
  // =====================================================

  useEffect(() => {
    fetchEmployees();
  }, []);

  // =====================================================
  // AUTO REFRESH
  //
  // Isse agar leave midnight par expire hoti hai
  // to page refresh ki zarurat nahi padegi.
  // =====================================================

  useEffect(() => {
    const interval =
      window.setInterval(() => {
        setEmployees(
          (previousEmployees) => [
            ...previousEmployees,
          ]
        );
      }, 60 * 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  // =====================================================
  // SUCCESS AUTO HIDE
  // =====================================================

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [successMessage]);

  // =====================================================
  // DEPARTMENTS
  // =====================================================

  const departments = useMemo(() => {
    const values = employees
      .map(
        (employee) =>
          employee.department
      )
      .filter(
        (value): value is string =>
          Boolean(value)
      );

    return Array.from(
      new Set(values)
    ).sort();
  }, [employees]);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredEmployees = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return employees.filter(
      (employee) => {
        const employeeStatus =
          normalizeStatus(employee);

        const matchesSearch =
          !searchValue ||
          employee.name
            ?.toLowerCase()
            .includes(searchValue) ||
          employee.email
            ?.toLowerCase()
            .includes(searchValue) ||
          employee.phone
            ?.toLowerCase()
            .includes(searchValue) ||
          employee.employeeId
            ?.toLowerCase()
            .includes(searchValue) ||
          employee.id
            ?.toLowerCase()
            .includes(searchValue);

        const matchesDepartment =
          department ===
            "All Departments" ||
          employee.department ===
            department;

        const matchesStatus =
          status === "All Status" ||
          employeeStatus.toLowerCase() ===
            status.toLowerCase();

        return (
          matchesSearch &&
          matchesDepartment &&
          matchesStatus
        );
      }
    );
  }, [
    employees,
    search,
    department,
    status,
  ]);

  // =====================================================
  // STATS
  // =====================================================

  const totalEmployees =
    employees.length;

  const activeEmployees =
    employees.filter(
      (employee) =>
        normalizeStatus(employee) ===
        "Active"
    ).length;

  const inactiveEmployees =
    employees.filter(
      (employee) =>
        normalizeStatus(employee) ===
        "Inactive"
    ).length;

  // =====================================================
  // LEAVE COUNT
  //
  // Leave ke dauran employee Inactive hai,
  // lekin alag Leave count bhi dikha sakte hain.
  // =====================================================

  const onLeaveEmployees =
    employees.filter(
      (employee) =>
        isCurrentlyOnLeave(employee)
    ).length;

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (
    date?: string | null
  ) => {
    if (!date) {
      return "-";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // LEAVE DAYS
  // =====================================================

  const getLeaveDays = (
    employee: Employee
  ) => {
    const startDate =
      getDateOnly(
        employee.leaveStartDate
      );

    const endDate =
      getDateOnly(
        employee.leaveEndDate
      );

    if (!startDate || !endDate) {
      return 0;
    }

    const start =
      new Date(
        `${startDate}T00:00:00`
      );

    const end =
      new Date(
        `${endDate}T00:00:00`
      );

    if (
      Number.isNaN(
        start.getTime()
      ) ||
      Number.isNaN(
        end.getTime()
      )
    ) {
      return 0;
    }

    const difference =
      end.getTime() -
      start.getTime();

    return (
      Math.floor(
        difference /
          (1000 *
            60 *
            60 *
            24)
      ) + 1
    );
  };

  // =====================================================
  // SALARY
  // =====================================================

  const formatSalary = (
    salary?: number | string
  ) => {
    if (
      salary === undefined ||
      salary === null ||
      salary === ""
    ) {
      return "-";
    }

    const numericSalary =
      Number(salary);

    if (
      Number.isNaN(
        numericSalary
      )
    ) {
      return String(salary);
    }

    return numericSalary.toLocaleString(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    );
  };

  // =====================================================
  // INITIALS
  // =====================================================

  const getInitials = (
    name?: string
  ) => {
    if (!name) {
      return "NA";
    }

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part
          .charAt(0)
          .toUpperCase()
      )
      .join("");
  };

  // =====================================================
  // LEAVE RANGE
  // =====================================================

  const formatLeaveRange = (
    employee: Employee
  ) => {
    if (
      !employee.leaveStartDate ||
      !employee.leaveEndDate
    ) {
      return "";
    }

    return `${formatDate(
      employee.leaveStartDate
    )} - ${formatDate(
      employee.leaveEndDate
    )}`;
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (
    employeeStatus: EmployeeStatus
  ) => {
    if (
      employeeStatus === "Active"
    ) {
      return "bg-[#153567] text-white";
    }

    return "bg-gray-200 text-gray-700";
  };

  // =====================================================
  // STATUS CHANGE
  // =====================================================

  const handleStatusChange = async (
    employee: Employee,
    newStatus: EmployeeStatus
  ) => {
    const employeeId =
      getBackendEmployeeId(
        employee
      );

    if (!employeeId) {
      alert(
        "Employee ID nahi mila."
      );
      return;
    }

    const currentStatus =
      normalizeStatus(employee);

    // ===================================================
    // SAME STATUS
    // ===================================================

    if (
      currentStatus === newStatus
    ) {
      return;
    }

    // ===================================================
    // INACTIVE -> ACTIVE
    //
    // Agar employee leave par hai,
    // Active karne par leave cancel hogi.
    // ===================================================

    if (
      currentStatus ===
        "Inactive" &&
      newStatus === "Active"
    ) {
      const hasLeave =
        Boolean(
          employee.leaveStartDate ||
            employee.leaveEndDate
        );

      const confirmed =
        window.confirm(
          hasLeave
            ? `Are you sure you want to cancel leave of ${
                employee.name ||
                "this employee"
              } and make them Active?`
            : `Are you sure you want to make ${
                employee.name ||
                "this employee"
              } Active?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setChangingStatusId(
          employeeId
        );

        setError("");

        // ------------------------------------------------
        // IF LEAVE EXISTS
        // PATCH /:id/cancel-leave
        // ------------------------------------------------

        if (hasLeave) {
          const cancelLeaveEndpoint =
            `${API_CONFIG.ENDPOINTS.EMPLOYEES.DETAIL(
              employeeId
            )}/cancel-leave`;

          await apiClient.patch(
            cancelLeaveEndpoint
          );
        }

        // ------------------------------------------------
        // MAKE ACTIVE
        // PATCH /:id/active
        // ------------------------------------------------

        const activeEndpoint =
          `${API_CONFIG.ENDPOINTS.EMPLOYEES.DETAIL(
            employeeId
          )}/active`;

        await apiClient.patch(
          activeEndpoint
        );

        setSuccessMessage(
          `${
            employee.name ||
            "Employee"
          } is now Active.`
        );

        await fetchEmployees();
      } catch (err: any) {
        console.error(
          "Activate Employee Error:",
          err
        );

        alert(
          err?.response?.data?.message ||
            err?.message ||
            "Employee Active nahi ho paya."
        );

        await fetchEmployees();
      } finally {
        setChangingStatusId(null);
      }

      return;
    }

    // ===================================================
    // ACTIVE -> INACTIVE
    //
    // Leave nahi hai to normal inactive.
    // ===================================================

    if (
      currentStatus === "Active" &&
      newStatus === "Inactive"
    ) {
      const confirmed =
        window.confirm(
          `Are you sure you want to make ${
            employee.name ||
            "this employee"
          } Inactive?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setChangingStatusId(
          employeeId
        );

        setError("");

        const inactiveEndpoint =
          `${API_CONFIG.ENDPOINTS.EMPLOYEES.DETAIL(
            employeeId
          )}/inactive`;

        await apiClient.patch(
          inactiveEndpoint
        );

        setSuccessMessage(
          `${
            employee.name ||
            "Employee"
          } is now Inactive.`
        );

        await fetchEmployees();
      } catch (err: any) {
        console.error(
          "Inactive Employee Error:",
          err
        );

        alert(
          err?.response?.data?.message ||
            err?.message ||
            "Employee Inactive nahi ho paya."
        );

        await fetchEmployees();
      } finally {
        setChangingStatusId(null);
      }

      return;
    }
  };

  // =====================================================
  // OPEN LEAVE MODAL
  // =====================================================

  const openLeaveModal = (
    employee: Employee
  ) => {
    setError("");

    setLeaveModal({
      employee,

      startDate:
        employee.leaveStartDate
          ? employee.leaveStartDate.substring(
              0,
              10
            )
          : "",

      endDate:
        employee.leaveEndDate
          ? employee.leaveEndDate.substring(
              0,
              10
            )
          : "",
    });
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeLeaveModal = () => {
    if (givingLeaveId) {
      return;
    }

    setLeaveModal({
      employee: null,
      startDate: "",
      endDate: "",
    });
  };

  // =====================================================
  // GIVE LEAVE
  // =====================================================

  const handleGiveLeave = async () => {
    const employee =
      leaveModal.employee;

    if (!employee) {
      return;
    }

    const employeeId =
      getBackendEmployeeId(
        employee
      );

    if (!employeeId) {
      alert(
        "Employee ID nahi mila."
      );
      return;
    }

    const startDate =
      leaveModal.startDate;

    const endDate =
      leaveModal.endDate;

    if (!startDate) {
      alert(
        "Leave start date select karein."
      );
      return;
    }

    if (!endDate) {
      alert(
        "Leave end date select karein."
      );
      return;
    }

    if (endDate < startDate) {
      alert(
        "Leave end date start date se pehle nahi ho sakti."
      );
      return;
    }

    try {
      setGivingLeaveId(
        employeeId
      );

      setError("");

      const endpoint =
        `${API_CONFIG.ENDPOINTS.EMPLOYEES.DETAIL(
          employeeId
        )}/leave`;

      const payload = {
        leaveStartDate:
          startDate,
        leaveEndDate:
          endDate,
      };

      const response =
        await apiClient.patch(
          endpoint,
          payload
        );

      console.log(
        "Leave Response:",
        response.data
      );

      setSuccessMessage(
        `${
          employee.name ||
          "Employee"
        } leave successfully assigned.`
      );

      setLeaveModal({
        employee: null,
        startDate: "",
        endDate: "",
      });

      await fetchEmployees();
    } catch (err: any) {
      console.error(
        "GIVE LEAVE ERROR:",
        err
      );

      alert(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Leave set nahi ho payi."
      );
    } finally {
      setGivingLeaveId(null);
    }
  };

  // =====================================================
  // DELETE EMPLOYEE
  // =====================================================

  const handleDelete = async (
    employee: Employee
  ) => {
    const employeeId =
      getBackendEmployeeId(
        employee
      );

    if (!employeeId) {
      alert(
        "Employee ID nahi mila."
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${
          employee.name ||
          "this employee"
        }?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        employeeId
      );

      setError("");

      const endpoint =
        API_CONFIG.ENDPOINTS.EMPLOYEES.DETAIL(
          employeeId
        );

      await apiClient.delete(
        endpoint
      );

      setEmployees(
        (previousEmployees) =>
          previousEmployees.filter(
            (item) =>
              getBackendEmployeeId(
                item
              ) !== employeeId
          )
      );

      setSuccessMessage(
        "Employee deleted successfully."
      );
    } catch (err: any) {
      console.error(
        "Delete Employee Error:",
        err
      );

      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Employee delete nahi ho paya."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-full bg-[#f5f9ff] p-5 md:p-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <Users
              size={30}
              className="text-[#153567]"
            />

            <h1 className="text-3xl font-bold text-[#153567]">
              Employees
            </h1>

          </div>

          <p className="mt-2 text-gray-600">
            Manage your organization's employees.
          </p>
        </div>

        <Link
          to="/admin/employees/add"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#153567] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#0f2850]"
        >
          <UserPlus size={20} />
          Add Employee
        </Link>

      </div>

      {/* =================================================
          SUCCESS
      ================================================= */}

      {successMessage && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">

          <CheckCircle2 size={20} />

          <p className="text-sm font-medium">
            {successMessage}
          </p>

        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

          <AlertCircle size={22} />

          <div>

            <p className="font-semibold">
              Employees load nahi ho rahe
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>

            <button
              type="button"
              onClick={
                fetchEmployees
              }
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>

          </div>

        </div>
      )}

      {/* =================================================
          STATS
      ================================================= */}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* TOTAL */}

        <div className="rounded-xl border border-[#dce7f5] bg-white p-5 shadow-sm">

          <p className="text-sm text-gray-600">
            Total Employees
          </p>

          <p className="mt-2 text-3xl font-bold text-[#153567]">
            {totalEmployees}
          </p>

        </div>

        {/* ACTIVE */}

        <div className="rounded-xl border border-[#dce7f5] bg-white p-5 shadow-sm">

          <p className="text-sm text-gray-600">
            Active
          </p>

          <p className="mt-2 text-3xl font-bold text-[#153567]">
            {activeEmployees}
          </p>

        </div>

        {/* LEAVE */}

        <div className="rounded-xl border border-[#dce7f5] bg-white p-5 shadow-sm">

          <p className="text-sm text-gray-600">
            On Leave
          </p>

          <p className="mt-2 text-3xl font-bold text-[#b7791f]">
            {onLeaveEmployees}
          </p>

        </div>

        {/* INACTIVE */}

        <div className="rounded-xl border border-[#dce7f5] bg-white p-5 shadow-sm">

          <p className="text-sm text-gray-600">
            Inactive
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-700">
            {inactiveEmployees}
          </p>

        </div>

      </div>

      {/* =================================================
          EMPLOYEE CARD
      ================================================= */}

      <div className="mt-6 w-full rounded-xl border border-[#dce7f5] bg-white p-5 shadow-sm md:p-6">

        <div>

          <h2 className="text-2xl font-bold text-[#153567]">
            Employee List
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage employee status and leave.
          </p>

        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_200px_170px]">

          {/* SEARCH */}

          <div className="relative">

            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search by name, ID, email, phone..."
              className="h-11 w-full rounded-xl border border-[#d8e4f3] bg-[#f8fbff] pl-11 pr-4 text-sm outline-none focus:border-[#153567] focus:ring-2 focus:ring-[#153567]/10"
            />

          </div>

          {/* DEPARTMENT */}

          <div className="relative">

            <select
              value={department}
              onChange={(e) =>
                setDepartment(
                  e.target.value
                )
              }
              className="h-11 w-full appearance-none rounded-xl border border-[#d8e4f3] bg-[#f8fbff] px-4 pr-9 text-sm text-[#153567] outline-none"
            >

              <option>
                All Departments
              </option>

              {departments.map(
                (dept) => (
                  <option
                    key={dept}
                    value={dept}
                  >
                    {dept}
                  </option>
                )
              )}

            </select>

            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            />

          </div>

          {/* STATUS */}

          <div className="relative">

            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value
                )
              }
              className="h-11 w-full appearance-none rounded-xl border border-[#d8e4f3] bg-[#f8fbff] px-4 pr-9 text-sm text-[#153567] outline-none"
            >

              <option>
                All Status
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>

            </select>

            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            />

          </div>

        </div>

        {/* =================================================
            COUNT
        ================================================= */}

        <div className="mt-5">

          <p className="text-sm text-gray-600">

            Showing{" "}

            <span className="font-semibold text-[#153567]">
              {filteredEmployees.length}
            </span>{" "}

            of{" "}

            <span className="font-semibold text-[#153567]">
              {employees.length}
            </span>{" "}

            employees

          </p>

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="flex min-h-[250px] items-center justify-center">

            <div className="flex items-center gap-3 text-[#153567]">

              <Loader2
                size={27}
                className="animate-spin"
              />

              <span className="font-medium">
                Employees loading...
              </span>

            </div>

          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          !error &&
          filteredEmployees.length ===
            0 && (
            <div className="flex min-h-[220px] flex-col items-center justify-center text-center">

              <Users
                size={44}
                className="text-gray-400"
              />

              <h3 className="mt-4 text-lg font-semibold text-gray-700">
                No employees found
              </h3>

            </div>
          )}

        {/* =================================================
            TABLE
        ================================================= */}

        {!loading &&
          filteredEmployees.length >
            0 && (
            <div className="mt-4 w-full overflow-hidden rounded-xl border border-[#dce7f5]">

              <div className="w-full">

                <table className="w-full table-fixed border-collapse">

                  <thead>

                    <tr className="border-b border-[#dce7f5] bg-[#f8fbff]">

                      <th className="w-[22%] px-3 py-3 text-left text-xs font-semibold text-[#153567]">
                        Employee
                      </th>

                      <th className="w-[13%] px-2 py-3 text-left text-xs font-semibold text-[#153567]">
                        Department
                      </th>

                      <th className="w-[13%] px-2 py-3 text-left text-xs font-semibold text-[#153567]">
                        Designation
                      </th>

                      <th className="w-[13%] px-2 py-3 text-left text-xs font-semibold text-[#153567]">
                        Joining Date
                      </th>

                      <th className="w-[10%] px-2 py-3 text-left text-xs font-semibold text-[#153567]">
                        Salary
                      </th>

                      <th className="w-[13%] px-2 py-3 text-left text-xs font-semibold text-[#153567]">
                        Status
                      </th>

                      <th className="w-[16%] px-2 py-3 text-center text-xs font-semibold text-[#153567]">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredEmployees.map(
                      (employee) => {

                        const employeeId =
                          getEmployeeId(
                            employee
                          );

                        const backendId =
                          getBackendEmployeeId(
                            employee
                          );

                        const currentStatus =
                          normalizeStatus(
                            employee
                          );

                        const currentlyOnLeave =
                          isCurrentlyOnLeave(
                            employee
                          );

                        const isDeleting =
                          deletingId ===
                          backendId;

                        const isChangingStatus =
                          changingStatusId ===
                          backendId;

                        const isGivingLeave =
                          givingLeaveId ===
                          backendId;

                        /*
                         * Leave ke time:
                         *
                         * UI status = Inactive
                         *
                         * Dropdown = Inactive
                         */

                        const dropdownStatus =
                          currentStatus;

                        return (
                          <tr
                            key={
                              employee._id ||
                              employee.id ||
                              employee.employeeId
                            }
                            onClick={() =>
                              navigate(
                                getEmployeeUrl(
                                  employee
                                )
                              )
                            }
                            className="cursor-pointer border-b border-[#e5edf7] last:border-0 hover:bg-[#f8fbff]"
                          >

                            {/* EMPLOYEE */}

                            <td className="px-3 py-3">

                              <Link
                                to={getEmployeeUrl(
                                  employee
                                )}
                                className="flex min-w-0 items-center gap-2"
                              >

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e9eef6] text-xs font-semibold text-[#153567]">

                                  {getInitials(
                                    employee.name
                                  )}

                                </div>

                                <div className="min-w-0">

                                  <p className="max-w-[180px] truncate text-sm font-semibold text-[#153567]">
                                    {employee.name ||
                                      "Unnamed Employee"}
                                  </p>

                                  <p className="truncate text-xs text-gray-500">
                                    {employeeId}
                                  </p>

                                </div>

                              </Link>

                            </td>

                            {/* DEPARTMENT */}

                            <td className="px-2 py-3">

                              <p className="truncate text-sm text-[#153567]">
                                {employee.department ||
                                  "-"}
                              </p>

                            </td>

                            {/* DESIGNATION */}

                            <td className="px-2 py-3">

                              <p className="truncate text-sm text-[#153567]">
                                {employee.designation ||
                                  "-"}
                              </p>

                            </td>

                            {/* JOINING DATE */}

                            <td className="px-2 py-3">

                              <p className="whitespace-nowrap text-sm text-[#153567]">
                                {formatDate(
                                  employee.joiningDate
                                )}
                              </p>

                            </td>

                            {/* SALARY */}

                            <td className="px-2 py-3">

                              <p className="whitespace-nowrap text-sm font-medium text-[#153567]">
                                {formatSalary(
                                  employee.salary
                                )}
                              </p>

                            </td>

                            {/* STATUS
                                (yahin se status change bhi
                                hota hai — Actions me alag
                                se dropdown duplicate nahi
                                hai) */}

                            <td
                              className="px-2 py-3"
                              onClick={(e) =>
                                e.stopPropagation()
                              }
                            >

                              <div>

                                <div className="relative inline-block">

                                  <select
                                    value={
                                      dropdownStatus
                                    }
                                    disabled={
                                      isChangingStatus ||
                                      isDeleting ||
                                      isGivingLeave
                                    }
                                    onClick={(e) =>
                                      e.stopPropagation()
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      handleStatusChange(
                                        employee,
                                        e.target
                                          .value as EmployeeStatus
                                      )
                                    }
                                    className={`h-8 appearance-none rounded-full border px-3 pr-7 text-xs font-semibold outline-none disabled:cursor-not-allowed disabled:opacity-60 ${getStatusClass(
                                      currentStatus
                                    )}`}
                                  >

                                    <option value="Active">
                                      Active
                                    </option>

                                    <option value="Inactive">
                                      Inactive
                                    </option>

                                  </select>

                                  {isChangingStatus ? (
                                    <Loader2
                                      size={12}
                                      className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 animate-spin ${
                                        currentStatus ===
                                        "Active"
                                          ? "text-white"
                                          : "text-gray-600"
                                      }`}
                                    />
                                  ) : (
                                    <ChevronDown
                                      size={12}
                                      className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 ${
                                        currentStatus ===
                                        "Active"
                                          ? "text-white"
                                          : "text-gray-600"
                                      }`}
                                    />
                                  )}

                                </div>

                                {/* LEAVE INFO */}

                                {employee.leaveStartDate &&
                                  employee.leaveEndDate && (
                                    <div className="mt-1.5">

                                      <p className="whitespace-nowrap text-xs text-gray-500">

                                        {formatLeaveRange(
                                          employee
                                        )}

                                      </p>

                                      <p
                                        className={`mt-0.5 text-xs font-semibold ${
                                          currentlyOnLeave
                                            ? "text-yellow-700"
                                            : "text-gray-500"
                                        }`}
                                      >

                                        {getLeaveDays(
                                          employee
                                        )}{" "}

                                        {getLeaveDays(
                                          employee
                                        ) === 1
                                          ? "Day"
                                          : "Days"}{" "}

                                        Leave

                                        {currentlyOnLeave &&
                                          " • On Leave"}

                                      </p>

                                    </div>
                                  )}

                              </div>

                            </td>

                            {/* ACTIONS */}

                            <td
                              className="px-2 py-3"
                              onClick={(e) =>
                                e.stopPropagation()
                              }
                            >

                              <div className="flex items-center justify-center gap-2.5">

                                {/* LEAVE BUTTON */}

                                {!currentlyOnLeave && (
                                  <button
                                    type="button"
                                    title="Give Leave"
                                    disabled={
                                      isGivingLeave ||
                                      isDeleting ||
                                      isChangingStatus
                                    }
                                    onClick={() =>
                                      openLeaveModal(
                                        employee
                                      )
                                    }
                                    className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-yellow-200 bg-yellow-50 px-2 text-xs font-semibold text-yellow-700 transition hover:bg-yellow-100 disabled:cursor-not-allowed disabled:opacity-50"
                                  >

                                    {isGivingLeave ? (
                                      <Loader2
                                        size={13}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <CalendarDays
                                        size={13}
                                      />
                                    )}

                                    Leave

                                  </button>
                                )}

                                {/* VIEW */}

                                <Link
                                  to={getEmployeeUrl(
                                    employee
                                  )}
                                  title="View employee"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#153567] transition hover:bg-[#eaf1fa] hover:text-blue-600"
                                >
                                  <Eye size={15} />
                                </Link>

                                {/* EDIT */}

                                <Link
                                  to={`/admin/employees/${backendId}/edit`}
                                  title="Edit employee"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#153567] transition hover:bg-[#eaf1fa] hover:text-blue-600"
                                >
                                  <Pencil size={15} />
                                </Link>

                                {/* DELETE */}

                                <button
                                  type="button"
                                  title="Delete employee"
                                  disabled={
                                    isDeleting ||
                                    isChangingStatus ||
                                    isGivingLeave
                                  }
                                  onClick={() =>
                                    handleDelete(
                                      employee
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                  {isDeleting ? (
                                    <Loader2
                                      size={15}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Trash2
                                      size={15}
                                    />
                                  )}

                                </button>

                              </div>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            </div>
          )}

      </div>

      {/* =====================================================
          LEAVE MODAL
      ===================================================== */}

      {leaveModal.employee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-[#e5edf7] px-5 py-4">

              <div>

                <div className="flex items-center gap-2">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-50">

                    <CalendarDays
                      size={19}
                      className="text-yellow-700"
                    />

                  </div>

                  <h3 className="text-lg font-bold text-[#153567]">
                    Give Employee Leave
                  </h3>

                </div>

                <p className="mt-1 text-sm text-gray-500">
                  {leaveModal.employee.name ||
                    "Employee"}
                </p>

              </div>

              <button
                type="button"
                onClick={
                  closeLeaveModal
                }
                disabled={
                  Boolean(
                    givingLeaveId
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              >
                <X size={19} />
              </button>

            </div>

            {/* BODY */}

            <div className="space-y-5 px-5 py-5">

              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3">

                <p className="text-xs leading-5 text-yellow-800">

                  Start date se end date tak employee
                  ka status{" "}

                  <span className="font-semibold">
                    Inactive
                  </span>{" "}

                  rahega.

                  <br />

                  Leave end hone ke baad employee
                  automatically{" "}

                  <span className="font-semibold">
                    Active
                  </span>{" "}

                  show hoga.

                </p>

              </div>

              {/* START DATE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#153567]">
                  Leave Start Date
                </label>

                <input
                  type="date"
                  value={
                    leaveModal.startDate
                  }
                  onChange={(e) =>
                    setLeaveModal(
                      (previous) => ({
                        ...previous,
                        startDate:
                          e.target.value,
                      })
                    )
                  }
                  disabled={
                    Boolean(
                      givingLeaveId
                    )
                  }
                  className="h-11 w-full rounded-xl border border-[#d8e4f3] bg-[#f8fbff] px-3 text-sm text-[#153567] outline-none focus:border-[#153567] focus:ring-2 focus:ring-[#153567]/10 disabled:opacity-60"
                />

              </div>

              {/* END DATE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#153567]">
                  Leave End Date
                </label>

                <input
                  type="date"
                  value={
                    leaveModal.endDate
                  }
                  min={
                    leaveModal.startDate ||
                    undefined
                  }
                  onChange={(e) =>
                    setLeaveModal(
                      (previous) => ({
                        ...previous,
                        endDate:
                          e.target.value,
                      })
                    )
                  }
                  disabled={
                    Boolean(
                      givingLeaveId
                    )
                  }
                  className="h-11 w-full rounded-xl border border-[#d8e4f3] bg-[#f8fbff] px-3 text-sm text-[#153567] outline-none focus:border-[#153567] focus:ring-2 focus:ring-[#153567]/10 disabled:opacity-60"
                />

              </div>

              {/* DAYS PREVIEW */}

              {leaveModal.startDate &&
                leaveModal.endDate &&
                leaveModal.endDate >=
                  leaveModal.startDate && (
                  <div className="rounded-xl border border-[#dce7f5] bg-[#f8fbff] p-3">

                    <p className="text-sm text-gray-600">
                      Leave Duration
                    </p>

                    <p className="mt-1 text-xl font-bold text-[#153567]">

                      {Math.floor(
                        (
                          new Date(
                            `${leaveModal.endDate}T00:00:00`
                          ).getTime() -
                          new Date(
                            `${leaveModal.startDate}T00:00:00`
                          ).getTime()
                        ) /
                          (1000 *
                            60 *
                            60 *
                            24)
                      ) + 1}{" "}

                      Days

                    </p>

                  </div>
                )}

            </div>

            {/* FOOTER */}

            <div className="flex justify-end gap-3 border-t border-[#e5edf7] px-5 py-4">

              <button
                type="button"
                onClick={
                  closeLeaveModal
                }
                disabled={
                  Boolean(
                    givingLeaveId
                  )
                }
                className="rounded-xl border border-[#d8e4f3] bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleGiveLeave
                }
                disabled={
                  Boolean(
                    givingLeaveId
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#153567] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0f2850] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {givingLeaveId ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <CalendarDays
                      size={17}
                    />
                    Give Leave
                  </>
                )}

              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Employees;