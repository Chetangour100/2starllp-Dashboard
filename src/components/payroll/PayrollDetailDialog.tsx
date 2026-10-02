import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { PayrollRun } from "@/data/payrollData";
import { Calendar, IndianRupee, Users } from "lucide-react";

interface PayrollDetailDialogProps {
  payroll: PayrollRun | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function statusVariant(status: PayrollRun["status"]) {
  switch (status) {
    case "Completed":
      return "default" as const;
    case "Processing":
      return "secondary" as const;
    case "Pending":
      return "outline" as const;
  }
}

export function PayrollDetailDialog({
  payroll,
  open,
  onOpenChange,
}: PayrollDetailDialogProps) {
  if (!payroll) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 pr-6">
            <div>
              <DialogTitle className="text-xl">{payroll.month} Payroll</DialogTitle>
              <p className="text-sm text-muted-foreground">{payroll.id}</p>
            </div>
            <Badge variant={statusVariant(payroll.status)}>{payroll.status}</Badge>
          </div>
        </DialogHeader>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs">Employees</span>
            </div>
            <p className="mt-1 text-lg font-semibold">{payroll.totalEmployees}</p>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <IndianRupee className="h-4 w-4" />
              <span className="text-xs">Gross Pay</span>
            </div>
            <p className="mt-1 text-lg font-semibold">
              {formatCurrency(payroll.grossPayroll)}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <IndianRupee className="h-4 w-4" />
              <span className="text-xs">Net Pay</span>
            </div>
            <p className="mt-1 text-lg font-semibold text-emerald-600">
              {formatCurrency(payroll.netPayroll)}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <span className="text-muted-foreground">Period: </span>
            <span className="font-medium">
              {formatDate(payroll.periodStart)} – {formatDate(payroll.periodEnd)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Deductions: </span>
            <span className="font-medium">{formatCurrency(payroll.deductions)}</span>
          </div>
          {payroll.processedDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Processed: </span>
              <span className="font-medium">{formatDate(payroll.processedDate)}</span>
            </div>
          )}
          {payroll.processedBy && (
            <div>
              <span className="text-muted-foreground">Processed by: </span>
              <span className="font-medium">{payroll.processedBy}</span>
            </div>
          )}
        </div>

        {payroll.notes && (
          <p className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
            {payroll.notes}
          </p>
        )}

        <Separator />

        <div>
          <h4 className="mb-3 text-sm font-semibold">Department Breakdown</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payroll.departmentBreakdown.map((row) => (
                <TableRow key={row.department}>
                  <TableCell>{row.department}</TableCell>
                  <TableCell>{row.employees}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(row.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
