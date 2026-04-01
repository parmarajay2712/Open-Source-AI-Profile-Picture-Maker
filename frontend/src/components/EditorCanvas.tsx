import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from 'react-compare-slider';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Columns,
  Image as ImageIcon,
  Layers,
} from 'lucide-react';

interface EditorCanvasProps {
  originalUrl: string | null;
  resultUrl: string | null;
  isProcessing: boolean;
}

type ViewMode = 'compare' | 'original' | 'result';

export default function EditorCanvas({
  originalUrl,
  resultUrl,
  isProcessing,
}: EditorCanvasProps) {
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('compare');

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleZoomReset = () => setZoom(1);

  const hasResult = !!resultUrl;
  const hasOriginal = !!originalUrl;
  const hasAny = hasOriginal || hasResult;

  if (!hasAny) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col items-center justify-center glass-card p-12 min-h-[500px]"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent-purple/10 to-accent-pink/10 flex items-center justify-center mb-6"
        >
          <Layers size={40} className="text-dark-500" />
        </motion.div>
        <h3 className="text-lg font-semibold text-dark-300 mb-2">
          No Image Loaded
        </h3>
        <p className="text-sm text-dark-500 text-center max-w-sm">
          Upload a selfie using the panel on the left to get started. Your image
          will appear here for editing.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex flex-col glass-card overflow-hidden min-h-[500px]"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-dark-950/50">
        <div className="flex items-center gap-1">
          {[
            { mode: 'compare' as ViewMode, icon: Columns, label: 'Compare' },
            { mode: 'original' as ViewMode, icon: ImageIcon, label: 'Original' },
            { mode: 'result' as ViewMode, icon: Layers, label: 'Result' },
          ].map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              disabled={mode === 'result' && !hasResult}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${viewMode === mode
                  ? 'bg-white/10 text-white'
                  : 'text-dark-400 hover:text-dark-200 hover:bg-white/5'
                }
                ${mode === 'result' && !hasResult ? 'opacity-30 cursor-not-allowed' : ''}
              `}
              aria-label={`View ${label}`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Zoom out"
          >
            <ZoomOut size={15} />
          </button>
          <span className="text-[11px] text-dark-500 w-12 text-center font-mono">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Zoom in"
          >
            <ZoomIn size={15} />
          </button>
          <button
            onClick={handleZoomReset}
            className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Reset zoom"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 relative overflow-auto bg-[#0c0c14] flex items-center justify-center p-6">
        {/* Checkerboard pattern for transparency */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #333 25%, transparent 25%),
              linear-gradient(-45deg, #333 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #333 75%),
              linear-gradient(-45deg, transparent 75%, #333 75%)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          }}
        />

        <AnimatePresence mode="wait">
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-dark-950/60 backdrop-blur-sm"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-accent-purple/30 border-t-accent-purple animate-spin" />
                  <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-accent-pink/20 border-b-accent-pink animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>
                <p className="text-sm text-dark-300 font-medium">
                  AI is working its magic...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="relative z-10 max-w-full max-h-full"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {viewMode === 'compare' && hasOriginal && hasResult ? (
            <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/30" style={{ maxWidth: '800px', maxHeight: '600px' }}>
              <ReactCompareSlider
                itemOne={
                  <ReactCompareSliderImage
                    src={originalUrl!}
                    alt="Original image"
                    style={{ objectFit: 'contain', maxHeight: '600px' }}
                  />
                }
                itemTwo={
                  <ReactCompareSliderImage
                    src={resultUrl!}
                    alt="Processed result"
                    style={{ objectFit: 'contain', maxHeight: '600px' }}
                  />
                }
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          ) : viewMode === 'compare' && hasOriginal && !hasResult ? (
            <motion.div
              key="original-only"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl overflow-hidden shadow-2xl shadow-black/30"
            >
              <img
                src={originalUrl!}
                alt="Original uploaded image"
                className="max-w-[800px] max-h-[600px] object-contain"
              />
            </motion.div>
          ) : viewMode === 'original' && hasOriginal ? (
            <motion.div
              key="original"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl overflow-hidden shadow-2xl shadow-black/30"
            >
              <img
                src={originalUrl!}
                alt="Original uploaded image"
                className="max-w-[800px] max-h-[600px] object-contain"
              />
            </motion.div>
          ) : viewMode === 'result' && hasResult ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl overflow-hidden shadow-2xl shadow-black/30"
            >
              <img
                src={resultUrl!}
                alt="Processed result image"
                className="max-w-[800px] max-h-[600px] object-contain"
              />
            </motion.div>
          ) : hasOriginal ? (
            <motion.div
              key="fallback"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl overflow-hidden shadow-2xl shadow-black/30"
            >
              <img
                src={originalUrl!}
                alt="Uploaded image"
                className="max-w-[800px] max-h-[600px] object-contain"
              />
            </motion.div>
          ) : null}
        </motion.div>
      </div>
    </motion.div>
  );
}
