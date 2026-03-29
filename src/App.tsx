import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthContext";
import { ProtectedRoute, PublicRoute } from "@/components/auth/ProtectedRoute";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { SplashScreen, TopProgressBar } from "@/components/ui/PageLoader";

import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/Clients";
import NewClient from "@/pages/NewClient";
import Loans from "@/pages/Loans";
import NewLoan from "@/pages/NewLoan";
import LoanDetail from "@/pages/LoanDetail";
import Simulator from "@/pages/Simulator";
import Profile from "@/pages/Profile";
import WhatsApp from "@/pages/WhatsApp";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Pricing from "@/pages/Pricing";
import ClientOnboarding from "@/pages/ClientOnboarding";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsAndConditions from "@/pages/TermsAndConditions";
import NotFound from "@/pages/NotFound";
import Help from "@/pages/Help";
import AdsManager from "@/components/ads/AdsManager";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      <AnimatePresence>
        {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      </AnimatePresence>

      {splashDone && (
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AdsManager />
              <BrowserRouter>
                <TopProgressBar />
                <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/unirme/:lenderId" element={<ClientOnboarding />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/privacidad" element={<PrivacyPolicy />} />
              <Route path="/terminos" element={<TermsAndConditions />} />

              {/* Guest Only Routes */}
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/restablecer-clave" element={<ResetPassword />} />
              </Route>

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/clients/new" element={<NewClient />} />
                <Route path="/clients/:id" element={<NewClient />} />
                <Route path="/loans" element={<Loans />} />
                <Route path="/loans/new" element={<NewLoan />} />
                <Route path="/loans/:id" element={<LoanDetail />} />
                <Route path="/loans/:id/edit" element={<NewLoan />} />
                <Route path="/simulator" element={<Simulator />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/whatsapp" element={<WhatsApp />} />
                <Route path="/help" element={<Help />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      )}
    </>
  );
};

export default App;
