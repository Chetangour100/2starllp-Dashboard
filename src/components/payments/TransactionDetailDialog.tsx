import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { Transaction } from "@/data/paymentsData";
import {
  Building2,
  Calendar,
  CreditCard,
  Hash,
  IndianRupee,
  User,
} from "lucide-react";

interface TransactionDetailDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-all">{value || "—"}</p>
      </div>
    </div>
  );
}

function statusVariant(status: Transaction["status"]) {
  switch (status) {
    case "Paid":
      return "default" as const;
    case "Pending":
      return "secondary" as const;
    case "Failed":
      return "destructive" as const;
  }
}

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function TransactionDetailDialog({
  transaction,
  open,
  onOpenChange,
}: TransactionDetailDialogProps) {
  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 pr-6">
            <div>
              <DialogTitle className="text-xl">Transaction Details</DialogTitle>
              <p className="text-sm text-muted-foreground">{transaction.id}</p>
            </div>
            <Badge variant={statusVariant(transaction.status)}>
              {transaction.status}
            </Badge>
          </div>
        </DialogHeader>

        <Separator />

        <div className="rounded-lg border bg-muted/30 p-4 text-center">
          <p className="text-sm text-muted-foreground">Amount</p>
          <p className="text-2xl font-bold text-emerald-600">
            {formatCurrency(transaction.amount)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDate(transaction.date)} · {transaction.method}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <DetailRow icon={User} label="Employee" value={transaction.employeeName} />
          <DetailRow icon={Hash} label="Employee ID" value={transaction.employeeId} />
          <DetailRow icon={Building2} label="Department" value={transaction.department} />
          <DetailRow icon={Calendar} label="Payroll Month" value={transaction.payrollMonth} />
          <DetailRow icon={CreditCard} label="Payment Method" value={transaction.method} />
          <DetailRow icon={IndianRupee} label="Bank" value={transaction.bankName} />
          <DetailRow icon={Hash} label="Account" value={transaction.accountNumber} />
          <DetailRow icon={Hash} label="Bank Reference" value={transaction.bankReference} />
          <DetailRow icon={Hash} label="UTR Number" value={transaction.utrNumber} />
          <DetailRow icon={Hash} label="Payroll ID" value={transaction.payrollId} />
          <DetailRow
            icon={Calendar}
            label="Initiated At"
            value={formatDateTime(transaction.initiatedAt)}
          />
          <DetailRow
            icon={Calendar}
            label="Completed At"
            value={formatDateTime(transaction.completedAt)}
          />
        </div>

        {transaction.failureReason && (
          <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {transaction.failureReason}
          </p>
        )}

        {transaction.remarks && (
          <p className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
            {transaction.remarks}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
