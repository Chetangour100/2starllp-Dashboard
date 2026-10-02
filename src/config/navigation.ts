import {
  LayoutDashboard,
  Users,
  Wallet,
  CreditCard,
  FileText,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export const navigationItems: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Employees", href: "/admin/employees", icon: Users },
  { name: "Payroll", href: "/admin/payroll", icon: Wallet },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Reports", href: "/admin/reports", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function getPageTitle(pathname: string): string {
  const item = navigationItems.find(
    (nav) =>
      nav.href === pathname ||
      (nav.href !== "/admin" && pathname.startsWith(nav.href)),
  );

  if (item) return item.name;

  if (pathname === "/admin" || pathname.startsWith("/admin/dashboard")) {
    return "Dashboard";
  }

  return "Dashboard";
}