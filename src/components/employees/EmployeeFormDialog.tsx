import { useEffect, useState } from "react";
import { Plus, Save } from "lucide-react";

import type {
  Employee,
  EmployeeStatus,
} from "@/data/employeesData";
import { departments } from "@/data/employeesData";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  mode: "add" | "edit";
  onSubmit: (employee: Employee) => void;
}

const emptyEmployee: Employee = {
  id: "",
  name: "",
  email: "",
  phone: "",
  department: "IT",
  designation: "",
  joiningDate: "",
  salary: 0,
  status: "Active",
  address: "",
  city: "",
  state: "",
  emergencyContact: "",
  bankAccount: "",
  panNumber: "",
  gender: "Male",
  dateOfBirth: "",
};

const EmployeeFormDialog = ({
  open,
  onOpenChange,
  employee,
  mode,
  onSubmit,
}: EmployeeFormDialogProps) => {
  const [formData, setFormData] =
    useState<Employee>(emptyEmployee);

  useEffect(() => {
    if (mode === "edit" && employee) {
      setFormData(employee);
    } else {
      setFormData(emptyEmployee);
    }
  }, [employee, mode, open]);

  const handleChange = (
    field: keyof Employee,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "add"
              ? "Add Employee"
              : "Edit Employee"}
          </DialogTitle>

          <DialogDescription>
            {mode === "add"
              ? "Add a new employee to your organization."
              : "Update employee information."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">
              Basic Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="employee-id">
                  Employee ID
                </Label>

                <Input
                  id="employee-id"
                  value={formData.id}
                  onChange={(e) =>
                    handleChange("id", e.target.value)
                  }
                  placeholder="EMP-129"
                  disabled={mode === "edit"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee-name">
                  Full Name
                </Label>

                <Input
                  id="employee-name"
                  value={formData.name}
                  onChange={(e) =>
                    handleChange("name", e.target.value)
                  }
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee-email">
                  Email
                </Label>

                <Input
                  id="employee-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    handleChange("email", e.target.value)
                  }
                  placeholder="employee@2starllp.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee-phone">
                  Phone
                </Label>

                <Input
                  id="employee-phone"
                  value={formData.phone}
                  onChange={(e) =>
                    handleChange("phone", e.target.value)
                  }
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee-gender">
                  Gender
                </Label>

                <select
                  id="employee-gender"
                  value={formData.gender}
                  onChange={(e) =>
                    handleChange(
                      "gender",
                      e.target.value as Employee["gender"]
                    )
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-of-birth">
                  Date of Birth
                </Label>

                <Input
                  id="date-of-birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    handleChange(
                      "dateOfBirth",
                      e.target.value
                    )
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Job Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">
              Job Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="department">
                  Department
                </Label>

                <select
                  id="department"
                  value={formData.department}
                  onChange={(e) =>
                    handleChange(
                      "department",
                      e.target.value
                    )
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  {departments.map((department) => (
                    <option
                      key={department}
                      value={department}
                    >
                      {department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">
                  Designation
                </Label>

                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) =>
                    handleChange(
                      "designation",
                      e.target.value
                    )
                  }
                  placeholder="Senior Developer"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="joining-date">
                  Joining Date
                </Label>

                <Input
                  id="joining-date"
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) =>
                    handleChange(
                      "joiningDate",
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">
                  Monthly Salary
                </Label>

                <Input
                  id="salary"
                  type="number"
                  min="0"
                  value={formData.salary}
                  onChange={(e) =>
                    handleChange(
                      "salary",
                      Number(e.target.value)
                    )
                  }
                  placeholder="45000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">
                  Status
                </Label>

                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    handleChange(
                      "status",
                      e.target.value as EmployeeStatus
                    )
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">
              Address
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">
                  Address
                </Label>

                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    handleChange(
                      "address",
                      e.target.value
                    )
                  }
                  placeholder="Full address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">
                  City
                </Label>

                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    handleChange(
                      "city",
                      e.target.value
                    )
                  }
                  placeholder="Indore"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">
                  State
                </Label>

                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) =>
                    handleChange(
                      "state",
                      e.target.value
                    )
                  }
                  placeholder="Madhya Pradesh"
                  required
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">
              Financial & Emergency Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emergency-contact">
                  Emergency Contact
                </Label>

                <Input
                  id="emergency-contact"
                  value={formData.emergencyContact}
                  onChange={(e) =>
                    handleChange(
                      "emergencyContact",
                      e.target.value
                    )
                  }
                  placeholder="+91 98765 00000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank-account">
                  Bank Account
                </Label>

                <Input
                  id="bank-account"
                  value={formData.bankAccount}
                  onChange={(e) =>
                    handleChange(
                      "bankAccount",
                      e.target.value
                    )
                  }
                  placeholder="Account number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pan-number">
                  PAN Number
                </Label>

                <Input
                  id="pan-number"
                  value={formData.panNumber}
                  onChange={(e) =>
                    handleChange(
                      "panNumber",
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="ABCDE1234F"
                  required
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit">
              {mode === "add" ? (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Employee
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeFormDialog;