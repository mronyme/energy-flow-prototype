
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import SkipLink from "./components/common/SkipLink";

// Pages
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/common/Layout";
import ManualEntry from "./pages/data-load/ManualEntry";
import CsvImport from "./pages/data-load/CsvImport";
import PiPreview from "./pages/data-load/PiPreview";
import Anomalies from "./pages/data-quality/Anomalies";
import Journal from "./pages/data-quality/Journal";
import EmissionFactors from "./pages/admin/EmissionFactors";
import Users from "./pages/admin/Users";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <SkipLink />
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Main layout with sidebar */}
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
            </Route>
            
            {/* Operator and DataManager routes */}
            <Route element={<Layout requiredRoles={['Operator', 'DataManager', 'Admin']} />}>
              <Route path="/data-load/manual-entry" element={<ManualEntry />} />
              <Route path="/data-load/csv-import" element={<CsvImport />} />
              <Route path="/data-load/pi-preview" element={<PiPreview />} />
            </Route>
            
            {/* DataManager routes */}
            <Route element={<Layout requiredRoles={['DataManager', 'Admin']} />}>
              <Route path="/data-quality/anomalies" element={<Anomalies />} />
              <Route path="/data-quality/journal" element={<Journal />} />
            </Route>
            
            {/* Admin routes */}
            <Route element={<Layout requiredRoles={['Admin']} />}>
              <Route path="/admin/units-factors" element={<EmissionFactors />} />
              <Route path="/admin/users" element={<Users />} />
            </Route>
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
