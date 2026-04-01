import { motion } from 'framer-motion';
import {
  Scissors,
  Sparkles,
  Wand2,
  RotateCcw,
  Loader2,
} from 'lucide-react';

interface ControlPanelProps {
  hasImage: boolean;
  isProcessing: boolean;
  onRemoveBackground: () => void;
  onEnhanceFace: () => void;
  onReset: () => void;
  currentAction: string | null;
}

interface ActionButton {
  id: string;
  label: string;
  description: string;
  icon: typeof Scissors;
  onClick: () => void;
  gradient: string;
  glowColor: string;
}

export default function ControlPanel({
  hasImage,
  isProcessing,
  onRemoveBackground,
  onEnhanceFace,
  onReset,
  currentAction,
}: ControlPanelProps) {
  const actions: ActionButton[] = [
    {
      id: 'remove-bg',
      label: 'Remove BG',
      description: 'AI background removal',
      icon: Scissors,
      onClick: onRemoveBackground,
      gradient: 'from-violet-600 to-purple-600',
      glowColor: 'rgba(124, 58, 237, 0.4)',
    },
    {
      id: 'enhance',
      label: 'Enhance Face',
      description: 'AI face restoration',
      icon: Sparkles,
      onClick: onEnhanceFace,
      gradient: 'from-pink-600 to-rose-600',
      glowColor: 'rgba(236, 72, 153, 0.4)',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Wand2 size={14} className="text-accent-pink" />
          AI Actions
        </h3>
        {hasImage && (
          <button
            onClick={onReset}
            disabled={isProcessing}
            className="flex items-center gap-1.5 text-xs text-dark-400 hover:text-white transition-colors disabled:opacity-40"
            aria-label="Reset all changes"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}
      </div>

      <div className="space-y-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const isActive = currentAction === action.id;
          const disabled = !hasImage || (isProcessing && !isActive);

          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={action.onClick}
              disabled={disabled}
              title={
                !hasImage
                  ? 'Upload an image first'
                  : isProcessing
                  ? 'Processing in progress...'
                  : action.description
              }
              className={`
                w-full group relative overflow-hidden rounded-xl border transition-all duration-300
                flex items-center gap-3 p-3 text-left
                ${
                  disabled
                    ? 'border-dark-800 bg-dark-900/30 opacity-40 cursor-not-allowed'
                    : isActive
                    ? 'border-accent-purple/50 bg-accent-purple/10'
                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10'
                }
              `}
              whileHover={!disabled ? { scale: 1.01 } : undefined}
              whileTap={!disabled ? { scale: 0.99 } : undefined}
              aria-label={action.label}
              style={
                isActive
                  ? { boxShadow: `0 0 20px ${action.glowColor}` }
                  : undefined
              }
            >
              <div
                className={`
                  w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                  bg-gradient-to-br ${action.gradient}
                  ${disabled ? 'opacity-50' : ''}
                `}
              >
                {isActive && isProcessing ? (
                  <Loader2 size={16} className="text-white animate-spin" />
                ) : (
                  <Icon size={16} className="text-white" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {action.label}
                </p>
                <p className="text-[11px] text-dark-400 truncate">
                  {isActive && isProcessing
                    ? 'Processing...'
                    : action.description}
                </p>
              </div>

              {!disabled && !isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              )}
            </motion.button>
          );
        })}
      </div>

      {!hasImage && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[11px] text-dark-500 text-center py-2"
        >
          Upload a photo to unlock AI tools
        </motion.p>
      )}
    </div>
  );
}
