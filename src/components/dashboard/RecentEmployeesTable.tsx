import { Link, useNavigate } from "react-router-dom";

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

import { formatDate } from "@/lib/formatters";

import { ArrowRight } from "lucide-react";

interface Employee {
  _id?: string;
  id?: string;
  employeeId?: string;

  name?: string;

  department?: string;

  joiningDate?: string;

  createdAt?: string;
}

interface RecentEmployeesTableProps {
  employees: Employee[];
}

export function RecentEmployeesTable({
  employees,
}: RecentEmployeesTableProps) {
  const navigate = useNavigate();

  const safeEmployees =
    Array.isArray(employees)
      ? employees
      : [];

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Recent Employees
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">
                Employee ID
              </TableHead>

              <TableHead>
                Name
              </TableHead>

              <TableHead>
                Department
              </TableHead>

              <TableHead>
                Joining Date
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {safeEmployees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              safeEmployees.map(
                (employee, index) => {
                  const employeeId =
                    employee.employeeId ??
                    employee.id ??
                    employee._id ??
                    `EMP-${index + 1}`;

                  const joiningDate =
                    employee.joiningDate ??
                    employee.createdAt ??
                    null;

                  const backendId =
                    employee.employeeId ??
                    employee.id ??
                    employee._id ??
                    "";

                  return (
                    <TableRow
                      key={
                        employee._id ??
                        employee.id ??
                        employee.employeeId ??
                        index
                      }
                      onClick={() =>
                        navigate(
                          `/admin/employees/${backendId}`
                        )
                      }
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="pl-6 font-medium">
                        {employeeId}
                      </TableCell>

                      <TableCell>
                        {employee.name ??
                          "—"}
                      </TableCell>

                      <TableCell>
                        {employee.department ??
                          "—"}
                      </TableCell>

                      <TableCell>
                        {formatDate(
                          joiningDate
                        )}
                      </TableCell>
                    </TableRow>
                  );
                }
              )
            )}
          </TableBody>
        </Table>

        <div className="border-t px-6 py-3">
          <Link
            to="/admin/employees"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            View All Employees

            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}