import { useEffect } from "react";
import {
  useForm,
  type SubmitHandler,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  employeeSchema,
  type EmployeeFormValues,
} from "@/validations/employeeSchema";

import { departments } from "@/data/employeesData";
import { indianStates } from "@/data/indianStates";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { Employee } from "@/data/employeesData";

interface EmployeeFormProps {
  employee?: Employee | null;
  mode: "add" | "edit";
  onSubmit: (
    data: EmployeeFormValues
  ) => void;
  onCancel: () => void;
}

const defaultValues: EmployeeFormValues = {
  id: "",
  name: "",
  email: "",
  phone: "",
  department: "IT",
  designation: "",
  joiningDate: "",
  salary: 0,
  paidLeaveQuota: 2,
  status: "Active",
  address: "",
  city: "",
  state: "",
  emergencyContact: "",
  bankName: "",
  bankAccount: "",
  ifscCode: "",
  panNumber: "",
  gender: "Male",
  dateOfBirth: "",
};

export default function EmployeeForm({
  employee,
  mode,
  onSubmit,
  onCancel,
}: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues,
  });

  // =====================================================
  // EDIT / ADD FORM RESET
  // =====================================================

  useEffect(() => {
    if (employee) {
      reset({
        id: employee.id,

        name: employee.name,

        email: employee.email,

        phone: employee.phone.replace(
          /\D/g,
          ""
        ),

        department:
          employee.department,

        designation:
          employee.designation,

        joiningDate:
          employee.joiningDate,

        salary:
          employee.salary,

        paidLeaveQuota:
          (employee as any)
            .paidLeaveQuota ?? 2,

        status:
          employee.status,

        address:
          employee.address,

        city:
          employee.city,

        state:
          employee.state,

        emergencyContact:
          employee.emergencyContact.replace(
            /\D/g,
            ""
          ),

        bankName:
          employee.bankName || "",

        bankAccount:
          employee.bankAccount.replace(
            /\D/g,
            ""
          ),

        ifscCode:
          employee.ifscCode || "",

        panNumber:
          employee.panNumber,

        gender:
          employee.gender,

        dateOfBirth:
          employee.dateOfBirth,
      });
    } else {
      reset(defaultValues);
    }
  }, [
    employee,
    reset,
  ]);

  // =====================================================
  // SUBMIT
  // =====================================================

  const submit: SubmitHandler<EmployeeFormValues> = (
    data
  ) => {
    console.log(
      "FORM SUBMITTED:",
      data
    );

    onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="space-y-8"
    >

      {/* =====================================================
          PERSONAL INFORMATION
      ===================================================== */}

      <section className="rounded-xl border bg-card p-6">

        <div className="mb-5">

          <h2 className="text-lg font-semibold">
            Personal Information
          </h2>

          <p className="text-sm text-muted-foreground">
            Basic information about the employee.
          </p>

        </div>

        <div className="grid gap-5 md:grid-cols-2">

          {/* FULL NAME */}

          <FormField
            label="Full Name"
            error={
              errors.name?.message
            }
          >
            <Input
              {...register("name")}
              placeholder="Rahul Sharma"
            />
          </FormField>

          {/* EMAIL */}

          <FormField
            label="Email"
            error={
              errors.email?.message
            }
          >
            <Input
              type="email"
              {...register("email")}
              placeholder="rahul@example.com"
            />
          </FormField>

          {/* PHONE */}

          <FormField
            label="Phone"
            error={
              errors.phone?.message
            }
          >
            <Input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              {...register("phone", {
                onChange: (e) => {
                  const value =
                    e.target.value
                      .replace(
                        /\D/g,
                        ""
                      )
                      .slice(
                        0,
                        10
                      );

                  setValue(
                    "phone",
                    value,
                    {
                      shouldValidate:
                        true,
                    }
                  );
                },
              })}
              placeholder="9876543210"
            />
          </FormField>

          {/* GENDER */}

          <FormField
            label="Gender"
            error={
              errors.gender?.message
            }
          >
            <select
              {...register("gender")}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >

              <option value="Male">
                Male
              </option>

              <option value="Female">
                Female
              </option>

              <option value="Other">
                Other
              </option>

            </select>
          </FormField>

          {/* DATE OF BIRTH */}

          <FormField
            label="Date of Birth"
            error={
              errors.dateOfBirth?.message
            }
          >
            <Input
              type="date"
              {...register(
                "dateOfBirth"
              )}
            />
          </FormField>

        </div>

      </section>

      {/* =====================================================
          EMPLOYMENT INFORMATION
      ===================================================== */}

      <section className="rounded-xl border bg-card p-6">

        <div className="mb-5">

          <h2 className="text-lg font-semibold">
            Employment Information
          </h2>

          <p className="text-sm text-muted-foreground">
            Job and payroll information.
          </p>

        </div>

        <div className="grid gap-5 md:grid-cols-2">

          {/* DEPARTMENT */}

          <FormField
            label="Department"
            error={
              errors.department?.message
            }
          >
            <select
              {...register(
                "department"
              )}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >

              {departments.map(
                (department) => (
                  <option
                    key={department}
                    value={
                      department
                    }
                  >
                    {department}
                  </option>
                )
              )}

            </select>
          </FormField>

          {/* DESIGNATION */}

          <FormField
            label="Designation"
            error={
              errors.designation?.message
            }
          >
            <Input
              {...register(
                "designation"
              )}
              placeholder="Senior Developer"
            />
          </FormField>

          {/* JOINING DATE */}

          <FormField
            label="Joining Date"
            error={
              errors.joiningDate?.message
            }
          >
            <Input
              type="date"
              {...register(
                "joiningDate"
              )}
            />
          </FormField>

          {/* MONTHLY SALARY */}

          <FormField
            label="Monthly Salary"
            error={
              errors.salary?.message
            }
          >
            <Input
              type="text"
              inputMode="numeric"
              {...register("salary", {
                setValueAs: (
                  value
                ) => {
                  if (
                    value === ""
                  ) {
                    return 0;
                  }

                  return Number(
                    value
                  );
                },

                onChange: (e) => {
                  const value =
                    e.target.value
                      .replace(
                        /\D/g,
                        ""
                      );

                  setValue(
                    "salary",
                    Number(
                      value
                    ) || 0,
                    {
                      shouldValidate:
                        true,
                    }
                  );
                },
              })}
              placeholder="45000"
            />
          </FormField>

          {/* PAID LEAVE QUOTA */}

          <FormField
            label="Paid Leave / Month"
            error={
              errors.paidLeaveQuota
                ?.message
            }
          >
            <Input
              type="text"
              inputMode="numeric"
              {...register(
                "paidLeaveQuota",
                {
                  setValueAs: (
                    value
                  ) => {
                    if (
                      value === ""
                    ) {
                      return 2;
                    }

                    return Number(
                      value
                    );
                  },

                  onChange: (
                    e
                  ) => {
                    const value =
                      e.target.value.replace(
                        /\D/g,
                        ""
                      );

                    setValue(
                      "paidLeaveQuota",
                      Number(
                        value
                      ) || 0,
                      {
                        shouldValidate:
                          true,
                      }
                    );
                  },
                }
              )}
              placeholder="2"
            />
          </FormField>

          {/* STATUS
              Sirf "Edit" mode me dikhta hai.
              Naya employee add karte waqt
              status hamesha "Active" set hota
              hai (default value me), aur baad
              me admin Edit se Inactive/On Leave
              kar sakta hai. */}

          {mode === "edit" && (

            <FormField
              label="Status"
              error={
                errors.status?.message
              }
            >
              <select
                {...register("status")}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >

                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>

                <option value="On Leave">
                  On Leave
                </option>

              </select>
            </FormField>

          )}

        </div>

      </section>

      {/* =====================================================
          ADDRESS
      ===================================================== */}

      <section className="rounded-xl border bg-card p-6">

        <div className="mb-5">

          <h2 className="text-lg font-semibold">
            Address
          </h2>

        </div>

        <div className="grid gap-5 md:grid-cols-2">

          {/* FULL ADDRESS */}

          <div className="md:col-span-2">

            <FormField
              label="Address"
              error={
                errors.address?.message
              }
            >
              <Input
                {...register(
                  "address"
                )}
                placeholder="Full residential address"
              />
            </FormField>

          </div>

          {/* CITY */}

          <FormField
            label="City"
            error={
              errors.city?.message
            }
          >
            <Input
              type="text"
              {...register("city", {
                onChange: (e) => {
                  const value =
                    e.target.value
                      .replace(
                        /[^A-Za-z\s.'-]/g,
                        ""
                      );

                  setValue(
                    "city",
                    value,
                    {
                      shouldValidate:
                        true,
                    }
                  );
                },
              })}
              placeholder="Indore"
            />
          </FormField>

          {/* STATE */}

          <FormField
            label="State"
            error={
              errors.state?.message
            }
          >

            <select
              {...register("state")}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >

              <option value="">
                Select State
              </option>

              {indianStates.map(
                (state) => (
                  <option
                    key={state}
                    value={state}
                  >
                    {state}
                  </option>
                )
              )}

            </select>

          </FormField>

        </div>

      </section>

      {/* =====================================================
          FINANCIAL INFORMATION
      ===================================================== */}

      <section className="rounded-xl border bg-card p-6">

        <div className="mb-5">

          <h2 className="text-lg font-semibold">
            Financial Information
          </h2>

        </div>

        <div className="grid gap-5 md:grid-cols-2">

          {/* =================================================
              BANK NAME
          ================================================= */}

          <FormField
            label="Bank Name"
            error={
              errors.bankName?.message
            }
          >

            <Input
              type="text"
              {...register(
                "bankName",
                {
                  onChange: (
                    e
                  ) => {
                    const value =
                      e.target.value
                        .replace(
                          /[^A-Za-z\s.&'-]/g,
                          ""
                        );

                    setValue(
                      "bankName",
                      value,
                      {
                        shouldValidate:
                          true,
                      }
                    );
                  },
                }
              )}
              placeholder="State Bank of India"
            />

          </FormField>

          {/* =================================================
              BANK ACCOUNT
          ================================================= */}

          <FormField
            label="Bank Account"
            error={
              errors.bankAccount?.message
            }
          >

            <Input
              type="text"
              inputMode="numeric"
              maxLength={18}
              {...register(
                "bankAccount",
                {
                  onChange: (
                    e
                  ) => {
                    const value =
                      e.target.value
                        .replace(
                          /\D/g,
                          ""
                        )
                        .slice(
                          0,
                          18
                        );

                    setValue(
                      "bankAccount",
                      value,
                      {
                        shouldValidate:
                          true,
                      }
                    );
                  },
                }
              )}
              placeholder="Account number"
            />

          </FormField>

          {/* =================================================
              IFSC CODE
          ================================================= */}

          <FormField
            label="IFSC Code"
            error={
              errors.ifscCode?.message
            }
          >

            <Input
              type="text"
              maxLength={11}
              {...register(
                "ifscCode",
                {
                  onChange: (
                    e
                  ) => {
                    const value =
                      e.target.value
                        .toUpperCase()
                        .replace(
                          /[^A-Z0-9]/g,
                          ""
                        )
                        .slice(
                          0,
                          11
                        );

                    setValue(
                      "ifscCode",
                      value,
                      {
                        shouldValidate:
                          true,
                      }
                    );
                  },
                }
              )}
              placeholder="SBIN0001234"
            />

          </FormField>

          {/* =================================================
              PAN NUMBER
          ================================================= */}

          <FormField
            label="PAN Number"
            error={
              errors.panNumber?.message
            }
          >

            <Input
              type="text"
              maxLength={10}
              {...register(
                "panNumber",
                {
                  onChange: (
                    e
                  ) => {
                    const value =
                      e.target.value
                        .toUpperCase()
                        .slice(
                          0,
                          10
                        );

                    setValue(
                      "panNumber",
                      value,
                      {
                        shouldValidate:
                          true,
                      }
                    );
                  },
                }
              )}
              placeholder="ABCDE1234F"
            />

          </FormField>

          {/* =================================================
              EMERGENCY CONTACT
          ================================================= */}

          <FormField
            label="Emergency Contact"
            error={
              errors
                .emergencyContact
                ?.message
            }
          >

            <Input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              {...register(
                "emergencyContact",
                {
                  onChange: (
                    e
                  ) => {
                    const value =
                      e.target.value
                        .replace(
                          /\D/g,
                          ""
                        )
                        .slice(
                          0,
                          10
                        );

                    setValue(
                      "emergencyContact",
                      value,
                      {
                        shouldValidate:
                          true,
                      }
                    );
                  },
                }
              )}
              placeholder="9876543210"
            />

          </FormField>

        </div>

      </section>

      {/* =====================================================
          BUTTONS
      ===================================================== */}

      <div className="flex justify-end gap-3 border-t pt-6">

        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={
            isSubmitting
          }
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={
            isSubmitting
          }
        >
          {mode === "add"
            ? "Save Employee"
            : "Save Changes"}
        </Button>

      </div>

    </form>
  );
}

/* =========================================================
   REUSABLE FIELD COMPONENT
========================================================= */

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

function FormField({
  label,
  error,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">

      <Label>
        {label}
      </Label>

      {children}

      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}

    </div>
  );
}