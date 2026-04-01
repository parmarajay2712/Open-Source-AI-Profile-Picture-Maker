import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastSystemProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const ICON_MAP = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
} as const;

const GLOW_MAP = {
  success: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
  error: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
  info: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
} as const;

const BORDER_MAP = {
  success: 'border-emerald-500/30',
  error: 'border-red-500/30',
  info: 'border-blue-500/30',
} as const;

const ICON_COLOR_MAP = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  info: 'text-blue-400',
} as const;

function SingleToast({
  toast,
  onRemove,
}: {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}) {
  const [progress, setProgress] = useState(100);
  const Icon = ICON_MAP[toast.type];
  const duration = toast.duration || 5000;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [duration]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`
        relative overflow-hidden rounded-xl border backdrop-blur-xl
        bg-dark-900/80 ${BORDER_MAP[toast.type]} ${GLOW_MAP[toast.type]}
        min-w-[320px] max-w-[420px]
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 p-4">
        <div className={`mt-0.5 flex-shrink-0 ${ICON_COLOR_MAP[toast.type]}`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{toast.title}</p>
          <p className="text-xs text-dark-300 mt-0.5 leading-relaxed">
            {toast.message}
          </p>
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 text-dark-400 hover:text-white transition-colors p-0.5 rounded hover:bg-white/5"
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      </div>

      <div className="h-0.5 bg-dark-800">
        <motion.div
          className={`h-full ${
            toast.type === 'success'
              ? 'bg-emerald-500'
              : toast.type === 'error'
              ? 'bg-red-500'
              : 'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.05 }}
        />
      </div>
    </motion.div>
  );
}

export default function ToastSystem({ toasts, onRemove }: ToastSystemProps) {
  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-3"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <SingleToast key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}
