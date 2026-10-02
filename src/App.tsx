import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

import Dashboard from "./pages/admin/Dashboard";
import Employees from "./pages/admin/Employees";
import Payroll from "./pages/admin/Payroll";
import Payments from "./pages/admin/Payments";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";

import AddEmployee from "./pages/admin/AddEmployee";
import EditEmployee from "./pages/admin/EditEmployee";
import EmployeeDetails from "./pages/admin/EmployeeDetails";
import CreatePayroll from "./pages/admin/CreatePayroll";

/*
 * NEW DETAIL PAGES
 *
 * These files will be created next:
 *
 * PayrollDetails.tsx
 * PaymentDetails.tsx
 */
import PayrollDetails from "./pages/admin/PayrollDetails";
import PaymentDetails from "./pages/admin/PaymentDetails";

import {
  loginInfo,
  logout,
} from "@/redux/features/authSlice";

import { AuthService } from "@/api/services/authService";

const queryClient = new QueryClient();

/* =====================================================
   AUTH INITIALIZER
===================================================== */

const AuthInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const userData = AuthService.getCurrentUser();
    const accessToken = AuthService.getAccessToken();

    if (userData && accessToken) {
      dispatch(loginInfo(userData));
    }

    const handleAuthLogout = () => {
      dispatch(logout());
    };

    window.addEventListener(
      "auth:logout",
      handleAuthLogout
    );

    return () => {
      window.removeEventListener(
        "auth:logout",
        handleAuthLogout
      );
    };
  }, [dispatch]);

  return null;
};

/* =====================================================
   APP
===================================================== */

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>

        {/* =================================================
            TOAST NOTIFICATIONS
        ================================================= */}
        <Toaster />
        <Sonner />

        <BrowserRouter>

          {/* =================================================
              AUTH INITIALIZER
          ================================================= */}
          <AuthInitializer />

          <Routes>

            {/* =================================================
                LOGIN
            ================================================= */}

            <Route
              path="/"
              element={<Login />}
            />

            {/* =================================================
                PROTECTED ADMIN AREA
            ================================================= */}

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >

              {/* =================================================
                  DASHBOARD
              ================================================= */}

              <Route
                index
                element={<Dashboard />}
              />

              {/* =================================================
                  EMPLOYEES
              ================================================= */}

              <Route
                path="employees"
                element={<Employees />}
              />

              {/* Add Employee */}

              <Route
                path="employees/add"
                element={<AddEmployee />}
              />

              {/* Employee Details */}

              <Route
                path="employees/:id"
                element={<EmployeeDetails />}
              />

              {/* Edit Employee */}

              <Route
                path="employees/:id/edit"
                element={<EditEmployee />}
              />

              {/* =================================================
                  PAYROLL
              ================================================= */}

              {/* Payroll List */}

              <Route
                path="payroll"
                element={<Payroll />}
              />

              {/* Payroll Details */}

              <Route
                path="payroll/:id"
                element={<PayrollDetails />}
              />

              {/* =================================================
                  PAYMENTS
              ================================================= */}

              {/* Payments List */}

              <Route
                path="payments"
                element={<Payments />}
              />

              {/* Payment Details */}

              <Route
                path="payments/:id"
                element={<PaymentDetails />}
              />

              <Route
                path="payroll/create"
                element={<CreatePayroll />}
              />

              {/* =================================================
                  REPORTS
              ================================================= */}

              <Route
                path="reports"
                element={<Reports />}
              />

              {/* =================================================
                  SETTINGS
              ================================================= */}

              <Route
                path="settings"
                element={<Settings />}
              />

            </Route>

            {/* =================================================
                OLD DASHBOARD URL
            ================================================= */}

            <Route
              path="/admin/dashboard"
              element={
                <Navigate
                  to="/admin"
                  replace
                />
              }
            />

            {/* =================================================
                404
            ================================================= */}

            <Route
              path="*"
              element={<NotFound />}
            />

          </Routes>

        </BrowserRouter>

      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;