import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { PredictionProvider } from "@/context/PredictionContext";
import { AuthProvider } from "@/context/AuthContext";
import { DailyAlertBanner } from "@/components/DailyAlertBanner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Home from "./pages/Home";
import Dataset from "./pages/Dataset";
import Prediction from "./pages/Prediction";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Alerts from "./pages/Alerts";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <PredictionProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <DailyAlertBanner />
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dataset" element={<Dataset />} />
                <Route
                  path="/prediction"
                  element={
                    <ProtectedRoute>
                      <Prediction />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/about" element={<About />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </PredictionProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
