import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  ChefHat, LayoutDashboard, UtensilsCrossed, ShoppingBag,
  Users, LogOut, Menu, X, Zap, Bell, QrCode, ExternalLink, LayoutGrid, Info
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ErrorBoundary } from '../components/ErrorBoundary';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/dashboard/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/dashboard/kitchen', icon: ChefHat, label: 'Kitchen Display' },
  { to: '/dashboard/menu', icon: UtensilsCrossed, label: 'Menu' },
  { to: '/dashboard/queue', icon: Users, label: 'Smart Queue' },
  { to: '/dashboard/tables', icon: LayoutGrid, label: 'Tables' },
];

export default function DashboardLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-surface-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center glow-orange shrink-0">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold font-display text-gradient-brand leading-tight">RestaurantOS</h1>
            <p className="text-[10px] text-surface-500 uppercase tracking-widest">Owner Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20 glow-orange'
                  : 'text-surface-400 hover:text-surface-100 hover:bg-surface-800'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-brand-400' : '')} />
                {label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Customer Portal Link */}
        <div className="mt-4 pt-4 border-t border-surface-700/30">
          <a
            href="/portal"
            target="_blank"
            rel="noopener noreferrer"
            id="open-customer-portal"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-500 hover:text-surface-200 hover:bg-surface-800 transition-all duration-200 group"
          >
            <QrCode className="w-4 h-4 shrink-0 text-brand-400/60 group-hover:text-brand-400 transition-colors" />
            <span>Customer Portal</span>
            <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-surface-700/50">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-surface-800/50 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.email?.[0]?.toUpperCase() ?? 'O'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-surface-200 truncate">{user?.email ?? 'Owner'}</p>
            <p className="text-[10px] text-surface-500">Restaurant Admin</p>
          </div>
        </div>
        <button
          id="sidebar-signout"
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-surface-400 hover:text-neon-red hover:bg-neon-red/10 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-surface-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 bg-surface-900 border-r border-surface-700/50 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-surface-900 border-r border-surface-700/50 z-50 md:hidden flex flex-col"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-700 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-surface-700/50 bg-surface-900/50 backdrop-blur-sm flex items-center px-4 gap-3 shrink-0">
          <button
            id="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-700 transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-400" />
            <span className="text-sm font-medium text-surface-300 hidden sm:block">Live Dashboard</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-neon-green/10 border border-neon-green/20 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
              <span className="text-xs text-neon-green font-medium">Live</span>
            </div>
            <button
              id="header-notifications"
              className="p-2 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-700 transition-colors cursor-pointer relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full border border-surface-900" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4">
          <AnimatePresence>
            {showAlert && (
              <motion.div
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="bg-brand-500/10 border border-brand-500/30 rounded-xl p-4 flex items-start gap-3 shrink-0"
              >
                <Info className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                <div className="flex-1 text-sm text-surface-200">
                  <span className="font-bold text-brand-400">Owner Dashboard Note:</span> For the best experience while managing your restaurant, please view this dashboard on a PC or tablet screen.
                </div>
                <button onClick={() => setShowAlert(false)} className="text-surface-400 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
