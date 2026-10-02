import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import EmployeeForm from "@/components/employees/EmployeeForm";

import type { EmployeeFormValues } from "@/validations/employeeSchema";

import { apiClient } from "@/api/client";
import { API_CONFIG } from "@/api/config";

export default function AddEmployee() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (data: EmployeeFormValues) => {
    try {
      setLoading(true);
      setError("");

      /*
       * IMPORTANT
       * Employee ID frontend se nahi bhejna hai.
       *
       * Backend automatically Employee ID generate karega.
       *
       * Example:
       * EMP-001
       * EMP-002
       * EMP-003
       */

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.EMPLOYEES.LIST,
        {
          ...data,

          /*
           * Salary form me TEXT rahegi,
           * lekin backend ko NUMBER bhejna hai.
           */
          salary: Number(data.salary),
        }
      );

      console.log(
        "Employee created successfully:",
        response.data
      );

      /*
       * Employee create hone ke baad
       * Employees list par redirect
       */
      navigate("/admin/employees");
    } catch (err: any) {
      console.error(
        "Create Employee Error:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Employee create nahi ho saka.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}

      <div className="flex items-center gap-3">

        <Button
          variant="ghost"
          size="icon"
          disabled={loading}
          onClick={() =>
            navigate("/admin/employees")
          }
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div>

          <div className="flex items-center gap-2">

            <UserPlus className="h-5 w-5" />

            <h1 className="text-2xl font-bold">
              Add Employee
            </h1>

          </div>

          <p className="text-sm text-muted-foreground">
            Add a new employee to your organization.
          </p>

        </div>

      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">

          <p className="font-semibold">
            Employee create nahi ho saka
          </p>

          <p className="mt-1 text-sm">
            {error}
          </p>

        </div>
      )}

      {/* ================= FORM ================= */}

      <EmployeeForm
        mode="add"
        onSubmit={handleSubmit}
        onCancel={() =>
          navigate("/admin/employees")
        }
      />

      {/* ================= LOADING ================= */}

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">

          <div className="rounded-lg bg-white px-6 py-4 shadow-lg">

            <p className="font-medium">
              Creating employee...
            </p>

          </div>

        </div>
      )}

    </div>
  );
}