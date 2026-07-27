import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, Zap, X } from 'lucide-react';
import { cn } from '../../lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'realtime';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (opts: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  realtime: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const toastConfig = {
  success: {
    icon: CheckCircle,
    containerClass: 'bg-neon-green/10 border-neon-green/30',
    iconClass: 'text-neon-green',
    titleClass: 'text-neon-green',
  },
  error: {
    icon: AlertCircle,
    containerClass: 'bg-neon-red/10 border-neon-red/30',
    iconClass: 'text-neon-red',
    titleClass: 'text-neon-red',
  },
  info: {
    icon: Info,
    containerClass: 'bg-neon-blue/10 border-neon-blue/30',
    iconClass: 'text-neon-blue',
    titleClass: 'text-neon-blue',
  },
  realtime: {
    icon: Zap,
    containerClass: 'bg-brand-500/10 border-brand-500/30 glow-orange',
    iconClass: 'text-brand-400',
    titleClass: 'text-brand-400',
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'flex items-start gap-3 w-80 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl',
        config.containerClass
      )}
    >
      <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', config.iconClass)} />
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-semibold', config.titleClass)}>{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-surface-400 mt-0.5 leading-relaxed">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-surface-500 hover:text-surface-300 transition-colors cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const duration = opts.duration ?? 4000;
    setToasts(prev => [{ ...opts, id }, ...prev].slice(0, 5));
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  const toast = useCallback((opts: Omit<Toast, 'id'>) => addToast(opts), [addToast]);
  const success = useCallback((title: string, message?: string) => addToast({ type: 'success', title, message }), [addToast]);
  const error = useCallback((title: string, message?: string) => addToast({ type: 'error', title, message }), [addToast]);
  const info = useCallback((title: string, message?: string) => addToast({ type: 'info', title, message }), [addToast]);
  const realtime = useCallback((title: string, message?: string) => addToast({ type: 'realtime', title, message, duration: 5000 }), [addToast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, realtime }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem toast={t} onDismiss={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
