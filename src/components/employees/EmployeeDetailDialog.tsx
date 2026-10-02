import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { Employee } from "@/data/employeesData";
import {
  Briefcase,
  Building2,
  Calendar,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";

interface EmployeeDetailDialogProps {
  employee: Employee | null;
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
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}

function statusVariant(status: Employee["status"]) {
  switch (status) {
    case "Active":
      return "default" as const;
    case "On Leave":
      return "secondary" as const;
    case "Inactive":
      return "outline" as const;
  }
}

export function EmployeeDetailDialog({
  employee,
  open,
  onOpenChange,
}: EmployeeDetailDialogProps) {
  if (!employee) return null;

  const initials = employee.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-accent/10 text-accent text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <DialogTitle className="text-xl">{employee.name}</DialogTitle>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">{employee.id}</span>
                <Badge variant={statusVariant(employee.status)}>
                  {employee.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {employee.designation} · {employee.department}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Contact Information</h4>
            <DetailRow icon={Mail} label="Email" value={employee.email} />
            <DetailRow icon={Phone} label="Phone" value={employee.phone} />
            <DetailRow
              icon={Phone}
              label="Emergency Contact"
              value={employee.emergencyContact}
            />
            <DetailRow
              icon={MapPin}
              label="Address"
              value={`${employee.address}, ${employee.city}, ${employee.state}`}
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Employment Details</h4>
            <DetailRow icon={Building2} label="Department" value={employee.department} />
            <DetailRow icon={Briefcase} label="Designation" value={employee.designation} />
            <DetailRow
              icon={Calendar}
              label="Joining Date"
              value={formatDate(employee.joiningDate)}
            />
            <DetailRow
              icon={CreditCard}
              label="Salary"
              value={formatCurrency(employee.salary)}
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Personal Information</h4>
            <DetailRow icon={User} label="Gender" value={employee.gender} />
            <DetailRow
              icon={Calendar}
              label="Date of Birth"
              value={formatDate(employee.dateOfBirth)}
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Financial Information</h4>
            <DetailRow icon={CreditCard} label="Bank Account" value={employee.bankAccount} />
            <DetailRow icon={CreditCard} label="PAN Number" value={employee.panNumber} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
