import { useState } from "react";
import { Outlet } from "react-router-dom";
import TopNavigation from "./TopNavigation";
import { SideNavigation } from "./SideNavigation";
import { AdminThemeProvider } from "./AdminThemeProvider";
import { motion } from "framer-motion";

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminThemeProvider>
      <div className="flex h-screen bg-background">
        <SideNavigation
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <TopNavigation
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            isSidebarOpen={sidebarOpen}
          />

          <motion.main
            className="flex-1 overflow-auto p-4 sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Outlet />
          </motion.main>

          <footer className="border-t bg-background px-6 py-3 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} 2Star Staffing. All rights reserved.
          </footer>
        </div>
      </div>
    </AdminThemeProvider>
  );
}
