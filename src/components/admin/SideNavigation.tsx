import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogoIcon } from "@/components/ui/logo-icon";
import { navigationItems } from "@/config/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store/store";
import { getInitials } from "@/validations/validations";

interface SideNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SideNavigation({ isOpen, onClose }: SideNavigationProps) {
  const location = useLocation();
  const authLoginState = useSelector((state: RootState) => state.auth.loginState) as {
    fullName?: string;
    email?: string;
  } | undefined;

  const displayName = authLoginState?.fullName || "Admin User";
  const displayEmail = authLoginState?.email || "admin@2star.com";

  const isActiveRoute = (href: string) => {
    if (href === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(href);
  };

  const sidebarContent = (
    <motion.div
      className="flex h-full flex-col bg-sidebar border-r"
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      exit={{ x: -280 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
    >
      <div className="border-b px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-secondary">
            <LogoIcon size="md" className="h-8 w-8" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-wide text-foreground">
              2STAR STAFFING
            </p>
            <p className="truncate text-xs text-muted-foreground">Payroll Dashboard</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 px-3 py-4">
          {navigationItems.map((item) => {
            const isActive = isActiveRoute(item.href);
            return (
              <motion.div
                key={item.name}
                whileHover={{ x: 2 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Link
                  to={item.href}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className="block"
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "relative group w-full justify-start gap-3 h-11 text-sm font-medium",
                     isActive
                     ? "bg-sidebar-accent text-sidebar-accent-foreground"
                     : "text-muted-foreground hover:text-white",
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-accent" />
                    )}
                    <item.icon className="h-4 w-4 shrink-0 group-hover:text-white" />
                    {item.name}
                    {isActive && (
                      <ChevronRight className="ml-auto h-4 w-4 opacity-60" />
                    )}
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{displayEmail}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">{sidebarContent}</div>

      <AnimatePresence>
        {isOpen && (
          <div className="lg:hidden">
            <motion.div
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-64">{sidebarContent}</div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
