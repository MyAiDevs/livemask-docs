import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import UsersPage from './pages/UsersPage';
import NodesPage from './pages/NodesPage';
import PaymentsPage from './pages/PaymentsPage';
import ConfigPage from './pages/ConfigPage';
import AuditLogsPage from './pages/AuditLogsPage';
import FeedbackPage from './pages/FeedbackPage';
import WebsitePage from './pages/WebsitePage';
import RevenuePage from './pages/RevenuePage';
import { LoginPage, RegisterPage, ForgotPasswordPage, VerifyEmailPage } from './pages/AuthPages';
import { AccountPage, BillingPage, SettingsPage } from './pages/AccountPages';
import { MarketplacePage, PointsPage, SupportPage } from './pages/PortalPages';

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    {/* Admin Console */}
    <Route path="/" element={<Index />} />
    <Route path="/users" element={<UsersPage />} />
    <Route path="/nodes" element={<NodesPage />} />
    <Route path="/payments" element={<PaymentsPage />} />
    <Route path="/config" element={<ConfigPage />} />
    <Route path="/audit-logs" element={<AuditLogsPage />} />
    <Route path="/feedback" element={<FeedbackPage />} />
    <Route path="/revenue" element={<RevenuePage />} />
    <Route path="/settings" element={<SettingsPage />} />

    {/* Public Website */}
    <Route path="/website" element={<WebsitePage />} />

    {/* Auth */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/verify-email" element={<VerifyEmailPage />} />
    <Route path="/auth/callback" element={<VerifyEmailPage />} />

    {/* User Portals */}
    <Route path="/account" element={<AccountPage />} />
    <Route path="/account/*" element={<AccountPage />} />
    <Route path="/billing" element={<BillingPage />} />
    <Route path="/billing/*" element={<BillingPage />} />
    <Route path="/market" element={<MarketplacePage />} />
    <Route path="/market/*" element={<MarketplacePage />} />
    <Route path="/points" element={<PointsPage />} />
    <Route path="/points/*" element={<PointsPage />} />
    <Route path="/support" element={<SupportPage />} />
    <Route path="/support/*" element={<SupportPage />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
export { AppRoutes };