import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ChevronDown, FileImage, Check } from 'lucide-react';

interface DownloadButtonProps {
  hasResult: boolean;
  isProcessing: boolean;
  onDownload: (format: 'png' | 'jpg') => void;
}

export default function DownloadButton({
  hasResult,
  isProcessing,
  onDownload,
}: DownloadButtonProps) {
  const [showFormats, setShowFormats] = useState(false);
  const [lastFormat, setLastFormat] = useState<'png' | 'jpg' | null>(null);

  const disabled = !hasResult || isProcessing;

  const handleDownload = (format: 'png' | 'jpg') => {
    setLastFormat(format);
    onDownload(format);
    setShowFormats(false);

    setTimeout(() => setLastFormat(null), 2000);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        {/* Main download button */}
        <motion.button
          onClick={() => handleDownload('png')}
          disabled={disabled}
          className={`
            flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all
            ${disabled
              ? 'bg-dark-800 text-dark-500 cursor-not-allowed'
              : 'btn-gradient'
            }
          `}
          whileHover={!disabled ? { scale: 1.01 } : undefined}
          whileTap={!disabled ? { scale: 0.99 } : undefined}
          aria-label="Download image as PNG"
          title={
            !hasResult
              ? 'Process an image first to download'
              : isProcessing
              ? 'Wait for processing to complete'
              : 'Download as PNG'
          }
        >
          <AnimatePresence mode="wait">
            {lastFormat === 'png' ? (
              <motion.div
                key="check"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <Check size={16} className="text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="download"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <Download size={16} />
              </motion.div>
            )}
          </AnimatePresence>
          Download PNG
        </motion.button>

        {/* Format selector */}
        <motion.button
          onClick={() => setShowFormats(!showFormats)}
          disabled={disabled}
          className={`
            flex items-center justify-center w-11 rounded-xl transition-all border
            ${disabled
              ? 'bg-dark-800 text-dark-500 cursor-not-allowed border-dark-700'
              : 'bg-white/5 text-dark-300 hover:text-white hover:bg-white/10 border-white/10'
            }
          `}
          whileHover={!disabled ? { scale: 1.02 } : undefined}
          whileTap={!disabled ? { scale: 0.98 } : undefined}
          aria-label="Choose download format"
        >
          <ChevronDown
            size={14}
            className={`transition-transform ${showFormats ? 'rotate-180' : ''}`}
          />
        </motion.button>
      </div>

      {/* Format dropdown */}
      <AnimatePresence>
        {showFormats && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-white/10 bg-dark-900/95 backdrop-blur-xl overflow-hidden z-30 shadow-2xl shadow-black/50"
          >
            {[
              { format: 'png' as const, label: 'PNG', desc: 'Lossless, transparent' },
              { format: 'jpg' as const, label: 'JPG', desc: 'Smaller file size' },
            ].map(({ format, label, desc }) => (
              <button
                key={format}
                onClick={() => handleDownload(format)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
              >
                <FileImage size={16} className="text-dark-400" />
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-[11px] text-dark-500">{desc}</p>
                </div>
                {lastFormat === format && (
                  <Check size={14} className="ml-auto text-emerald-400" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
