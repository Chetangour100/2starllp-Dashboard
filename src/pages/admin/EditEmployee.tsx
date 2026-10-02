import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Loader2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import EmployeeForm from "@/components/employees/EmployeeForm";

import { apiClient } from "@/api/client";
import { API_CONFIG } from "@/api/config";

import type { EmployeeFormValues } from "@/validations/employeeSchema";

/* =========================================================
   EMPLOYEE TYPE
========================================================= */

interface Employee {
  _id?: string;
  id?: string;
  employeeId?: string;

  name?: string;
  firstName?: string;
  lastName?: string;

  email?: string;
  phone?: string;

  department?: string;
  designation?: string;

  joiningDate?: string;
  dateOfJoining?: string;

  salary?: number | string;

  status?: string;

  address?: string;
  city?: string;
  state?: string;
  pincode?: string;

  emergencyContact?: string;

  bankAccount?: string;
  accountNumber?: string;
  bankName?: string;
  ifscCode?: string;

  panNumber?: string;
  pan?: string;

  gender?: string;
  dateOfBirth?: string;

  createdAt?: string;
  updatedAt?: string;
}

/* =========================================================
   HELPERS
========================================================= */

const getEmployeeId = (employee: Employee) => {
  return (
    employee.employeeId ||
    employee.id ||
    employee._id ||
    ""
  );
};

/* =========================================================
   COMPONENT
========================================================= */

export default function EditEmployee() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [employee, setEmployee] =
    useState<Employee | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /* =======================================================
     FETCH EMPLOYEE
  ======================================================= */

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!id) {
        setError("Employee ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log(
          "Fetching employee for edit:",
          id
        );

        /*
         * First try:
         * GET /api/employees/:id
         */

        try {
          const response =
            await apiClient.get<Employee>(
              API_CONFIG.ENDPOINTS.EMPLOYEES.DETAIL(id)
            );

          console.log(
            "Employee detail response:",
            response
          );

          if (
            response?.success &&
            response?.data
          ) {
            setEmployee(response.data);
            return;
          }

          if (response?.data) {
            setEmployee(response.data);
            return;
          }
        } catch (detailError) {
          console.log(
            "Detail endpoint failed. Trying employee list..."
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

        let employees: Employee[] = [];

        const responseData =
          listResponse?.data;

        if (Array.isArray(responseData)) {
          employees = responseData;
        } else if (
          Array.isArray(responseData?.employees)
        ) {
          employees = responseData.employees;
        } else if (
          Array.isArray(responseData?.data)
        ) {
          employees = responseData.data;
        } else if (
          Array.isArray(responseData?.items)
        ) {
          employees = responseData.items;
        }

        const foundEmployee =
          employees.find(
            (item) =>
              item.employeeId === id ||
              item.id === id ||
              item._id === id
          );

        if (!foundEmployee) {
          throw new Error(
            `Employee ${id} not found`
          );
        }

        setEmployee(foundEmployee);
      } catch (err: any) {
        console.error(
          "Employee fetch error:",
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
     UPDATE EMPLOYEE
  ======================================================= */

  const handleSubmit = async (
    data: EmployeeFormValues
  ) => {
    if (!employee || !id) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const employeeId =
        getEmployeeId(employee);

      /*
       * Backend update data
       */

      const updatedData = {
        ...data,
        salary: Number(data.salary),
      };

      console.log(
        "Updating employee:",
        employeeId
      );

      console.log(
        "Update data:",
        updatedData
      );

      /*
       * PUT:
       * /api/employees/:id
       */

      const response =
        await apiClient.put(
          API_CONFIG.ENDPOINTS.EMPLOYEES.DETAIL(
            employeeId
          ),
          updatedData
        );

      console.log(
        "Employee update response:",
        response
      );

      /*
       * Update successful
       */

      navigate(
        `/admin/employees/${employeeId}`,
        {
          replace: true,
        }
      );
    } catch (err: any) {
      console.error(
        "Employee update error:",
        err
      );

      setError(
        err?.message ||
          "Employee update nahi ho pa raha hai."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-700" />

          <p className="text-sm text-muted-foreground">
            Loading employee...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR / NOT FOUND
  ======================================================= */

  if (error || !employee) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">

          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-7 w-7 text-red-600" />
          </div>

          <h2 className="text-xl font-semibold">
            Employee not found
          </h2>

          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {error ||
              "The employee you are trying to edit does not exist."}
          </p>

          <Button
            className="mt-5"
            onClick={() =>
              navigate("/admin/employees")
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Employees
          </Button>

        </CardContent>
      </Card>
    );
  }

  /* =======================================================
     EMPLOYEE ID
  ======================================================= */

  const employeeId =
    getEmployeeId(employee);

  const employeeName =
    employee.name ||
    [employee.firstName, employee.lastName]
      .filter(Boolean)
      .join(" ") ||
    "Employee";

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-center gap-3">

        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            navigate(
              `/admin/employees/${employeeId}`
            )
          }
          disabled={saving}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div>
          <div className="flex items-center gap-2">

            <Pencil className="h-5 w-5" />

            <h1 className="text-2xl font-bold">
              Edit Employee
            </h1>

          </div>

          <p className="text-sm text-muted-foreground">
            Update information for{" "}
            <span className="font-medium">
              {employeeName}
            </span>
            .
          </p>
        </div>

      </div>

      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-start gap-3">

            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-medium">
                Update failed
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* =================================================
          FORM
      ================================================= */}

      <div className={saving ? "pointer-events-none opacity-70" : ""}>

        <EmployeeForm
          mode="edit"
          employee={employee as any}
          onSubmit={handleSubmit}
          onCancel={() =>
            navigate(
              `/admin/employees/${employeeId}`
            )
          }
        />

      </div>

      {/* =================================================
          SAVING MESSAGE
      ================================================= */}

      {saving && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg border bg-white px-5 py-3 shadow-lg">

          <Loader2 className="h-5 w-5 animate-spin text-blue-700" />

          <span className="text-sm font-medium">
            Updating employee...
          </span>

        </div>
      )}

    </div>
  );
}