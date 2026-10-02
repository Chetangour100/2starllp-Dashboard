import { AlertTriangle, Trash2 } from "lucide-react";

import type { Employee } from "@/data/employeesData";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onConfirm: () => void;
}

const DeleteEmployeeDialog = ({
  open,
  onOpenChange,
  employee,
  onConfirm,
}: DeleteEmployeeDialogProps) => {
  if (!employee) return null;

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Delete Employee?
          </AlertDialogTitle>

          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <strong>{employee.name}</strong> (
            {employee.id})?
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Employee
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteEmployeeDialog;