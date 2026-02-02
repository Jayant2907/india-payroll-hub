import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employees";
import Company from "@/pages/Company";
import SalaryStructures from "@/pages/SalaryStructures";
import Statutory from "@/pages/Statutory";
import RunPayroll from "@/pages/RunPayroll";
import Settlements from "@/pages/Settlements";
import TaxOptimizer from "@/pages/TaxOptimizer";
import Incentives from "@/pages/Incentives";
import MyProfile from "@/pages/MyProfile";
import NotFound from "@/pages/NotFound";
import InvestmentProofs from "@/pages/InvestmentProofs";
import VerificationPortal from "@/pages/VerificationPortal";
import MyIncentives from "@/pages/MyIncentives";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <MainLayout>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Admin & Accountant Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'accountant']}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Only Routes */}
                <Route
                  path="/employees"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Employees />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/company"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Company />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/salary-structures"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <SalaryStructures />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/statutory"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Statutory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payroll"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <RunPayroll />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payroll/optimizer"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'accountant', 'employee']}>
                      <TaxOptimizer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payroll/incentives"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'accountant']}>
                      <Incentives />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payroll/verification"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'accountant']}>
                      <VerificationPortal />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settlements"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Settlements />
                    </ProtectedRoute>
                  }
                />

                {/* Employee Route */}
                <Route
                  path="/my-profile"
                  element={
                    <ProtectedRoute allowedRoles={['employee']}>
                      <MyProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/investments"
                  element={
                    <ProtectedRoute allowedRoles={['employee']}>
                      <InvestmentProofs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-incentives"
                  element={
                    <ProtectedRoute allowedRoles={['employee']}>
                      <MyIncentives />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayout>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
