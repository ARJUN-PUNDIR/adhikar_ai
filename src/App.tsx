import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import DashboardLayout from "./components/layouts/DashboardLayout";

// Lazy-loaded common & Company pages
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Chatbot = lazy(() => import("./pages/Chatbot"));
const Documents = lazy(() => import("./pages/Documents"));
const Compliance = lazy(() => import("./pages/Compliance"));
const Account = lazy(() => import("./pages/Account"));
const Analytics = lazy(() => import("./pages/Analytics"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy-loaded CA specific pages
const CADashboard = lazy(() => import("./pages/ca/CADashboard"));
const ClientDirectory = lazy(() => import("./pages/ca/ClientDirectory"));
const CATasks = lazy(() => import("./pages/ca/CATasks"));
const PolicyReforms = lazy(() => import("./pages/ca/PolicyReforms"));
const CACalendar = lazy(() => import("./pages/ca/CACalendar"));
const CAComplianceStatus = lazy(() => import("./pages/ca/CAComplianceStatus"));

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium text-muted-foreground">Initializing AdhikarAI Workspace...</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

// Route Switcher for /dashboard
const DashboardSwitcher = () => {
  const { accountType } = useAuth();
  return accountType === 'ca' ? <CADashboard /> : <Dashboard />;
};

// Route Switcher for /dashboard/compliance
const ComplianceSwitcher = () => {
  const { accountType } = useAuth();
  return accountType === 'ca' ? <CAComplianceStatus /> : <Compliance />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center bg-background">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-medium text-muted-foreground">Loading workspace...</p>
            </div>
          }>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                {/* Role-adaptive Dashboard Root */}
                <Route index element={<DashboardSwitcher />} />
                
                {/* CA Specific Routes */}
                <Route path="clients" element={<ClientDirectory />} />
                <Route path="tasks" element={<CATasks />} />
                <Route path="reforms" element={<PolicyReforms />} />
                <Route path="calendar" element={<CACalendar />} />

                {/* Shared & Adaptive Routes */}
                <Route path="compliance" element={<ComplianceSwitcher />} />
                <Route path="chatbot" element={<Chatbot />} />
                <Route path="documents" element={<Documents />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="account" element={<Account />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
