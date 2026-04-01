import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';
import { JobStatus } from '../types';

interface StatusBarProps {
  status: JobStatus | 'idle';
  progress: number;
  error: string | null;
  onRetry?: () => void;
}

const STATUS_CONFIG = {
  idle: {
    icon: Clock,
    label: 'Ready',
    description: 'Upload a photo to get started',
    color: 'text-dark-400',
    barColor: 'bg-dark-700',
    glowClass: '',
  },
  pending: {
    icon: Loader2,
    label: 'Queued',
    description: 'Waiting in processing queue...',
    color: 'text-amber-400',
    barColor: 'bg-amber-500',
    glowClass: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]',
  },
  processing: {
    icon: Zap,
    label: 'Processing',
    description: 'AI is transforming your image...',
    color: 'text-accent-purple',
    barColor: 'bg-gradient-to-r from-accent-purple to-accent-pink',
    glowClass: 'shadow-[0_0_15px_rgba(124,58,237,0.2)]',
  },
  completed: {
    icon: CheckCircle,
    label: 'Complete',
    description: 'Your image is ready to download!',
    color: 'text-emerald-400',
    barColor: 'bg-emerald-500',
    glowClass: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]',
  },
  failed: {
    icon: XCircle,
    label: 'Failed',
    description: 'Something went wrong.',
    color: 'text-red-400',
    barColor: 'bg-red-500',
    glowClass: 'shadow-[0_0_15px_rgba(239,68,68,0.2)]',
  },
} as const;

export default function StatusBar({
  status,
  progress,
  error,
  onRetry,
}: StatusBarProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const isAnimating = status === 'pending' || status === 'processing';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card px-4 py-3 ${config.glowClass}`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex-shrink-0 ${config.color}`}>
          <Icon
            size={18}
            className={isAnimating ? 'animate-spin' : ''}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold ${config.color}`}>
                {config.label}
              </span>
              {isAnimating && (
                <motion.div
                  className="flex gap-0.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 h-1 rounded-full bg-accent-purple"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.2,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </div>
            {isAnimating && (
              <span className="text-[11px] text-dark-400 font-mono">
                {Math.round(progress)}%
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 rounded-full bg-dark-800 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${config.barColor}`}
              initial={{ width: 0 }}
              animate={{
                width: `${status === 'completed' ? 100 : status === 'idle' ? 0 : progress}%`,
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          <p className="text-[11px] text-dark-500 mt-1 truncate">
            {error || config.description}
          </p>
        </div>

        {status === 'failed' && onRetry && (
          <button
            onClick={onRetry}
            className="flex-shrink-0 text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-all"
          >
            Retry
          </button>
        )}
      </div>
    </motion.div>
  );
}
