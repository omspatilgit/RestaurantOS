import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import OrdersKanban from './pages/OrdersKanban';
import MenuManagement from './pages/MenuManagement';
import SmartQueue from './pages/SmartQueue';
import CustomerLayout from './pages/customer/CustomerLayout';
import CustomerWelcome from './pages/customer/CustomerWelcome';
import CustomerPreBook from './pages/customer/CustomerPreBook';
import TableCheckIn from './pages/customer/TableCheckIn';
import CustomerMenu from './pages/customer/CustomerMenu';
import OrderTracker from './pages/customer/OrderTracker';
import KitchenDisplay from './pages/KitchenDisplay';
import TableManagement from './pages/owner/TableManagement';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-2 border-brand-500/20 border-t-brand-500"
        />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function AppRoutes() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* ── Customer Portal (public, mobile-first) ── */}
        <Route path="/portal" element={<CustomerLayout />}>
          <Route index element={<PageWrapper><CustomerWelcome /></PageWrapper>} />
          <Route path="checkin" element={<PageWrapper><TableCheckIn /></PageWrapper>} />
          <Route path="prebook" element={<PageWrapper><CustomerPreBook /></PageWrapper>} />
          <Route path="menu" element={<PageWrapper><CustomerMenu /></PageWrapper>} />
          <Route path="track" element={<PageWrapper><OrderTracker /></PageWrapper>} />
        </Route>

        {/* ── Legacy QR menu redirect ── */}
        <Route path="/menu" element={<Navigate to="/portal" replace />} />

        {/* ── Auth ── */}
        <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />

        {/* ── Owner Dashboard (protected) ── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PageWrapper><DashboardOverview /></PageWrapper>} />
          <Route path="orders" element={<PageWrapper><OrdersKanban /></PageWrapper>} />
          <Route path="kitchen" element={<PageWrapper><KitchenDisplay /></PageWrapper>} />
          <Route path="menu" element={<PageWrapper><MenuManagement /></PageWrapper>} />
          <Route path="queue" element={<PageWrapper><SmartQueue /></PageWrapper>} />
          <Route path="tables" element={<PageWrapper><TableManagement /></PageWrapper>} />
        </Route>

        {/* ── Catch-all ── */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Outer viewport (Absolute Black) */}
      <div className="min-h-screen bg-black p-0 md:p-6 lg:p-8 flex items-center justify-center relative overflow-hidden">
        {/* Background Grid & Noise for viewport */}
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="absolute inset-0 noise-bg pointer-events-none" />

        {/* Floating Shell Container */}
        <div className="relative w-full max-w-[1600px] h-[100dvh] md:h-[calc(100vh-3rem)] lg:h-[calc(100vh-4rem)] bg-surface-900 md:rounded-4xl md:ring-1 ring-white/10 shadow-2xl overflow-hidden flex flex-col">
          <ToastProvider>
            <AuthProvider>
              <div className="flex-1 overflow-auto bg-surface-900 rounded-[inherit]">
                <AppRoutes />
              </div>
            </AuthProvider>
          </ToastProvider>
        </div>
      </div>
    </BrowserRouter>
  );
}
