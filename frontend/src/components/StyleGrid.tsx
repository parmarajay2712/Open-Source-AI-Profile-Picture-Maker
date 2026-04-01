import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Loader2 } from 'lucide-react';
import { StylePresetId, StyleCategory } from '../types';
import { STYLE_PRESETS, STYLE_CATEGORIES } from '../constants/styles';

interface StyleGridProps {
  hasImage: boolean;
  isProcessing: boolean;
  selectedStyle: StylePresetId | null;
  onApplyStyle: (preset: StylePresetId, prompt?: string) => void;
}

export default function StyleGrid({
  hasImage,
  isProcessing,
  selectedStyle,
  onApplyStyle,
}: StyleGridProps) {
  const [activeCategory, setActiveCategory] = useState<StyleCategory | 'all'>('all');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [pendingPreset, setPendingPreset] = useState<StylePresetId | null>(null);

  const filteredPresets =
    activeCategory === 'all'
      ? STYLE_PRESETS
      : STYLE_PRESETS.filter((p) => p.category === activeCategory);

  const handleStyleClick = (presetId: StylePresetId) => {
    if (!hasImage || isProcessing) return;
    setPendingPreset(presetId);
    setShowPrompt(true);
  };

  const handleApply = () => {
    if (!pendingPreset) return;
    onApplyStyle(pendingPreset, customPrompt.trim() || undefined);
    setShowPrompt(false);
    setCustomPrompt('');
    setPendingPreset(null);
  };

  const handleQuickApply = (presetId: StylePresetId) => {
    if (!hasImage || isProcessing) return;
    onApplyStyle(presetId);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <Palette size={14} className="text-accent-blue" />
        Style Presets
      </h3>

      {/* Category Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-dark-900/60 border border-white/5">
        <button
          onClick={() => setActiveCategory('all')}
          className={`
            flex-1 text-[11px] font-medium py-1.5 rounded-md transition-all
            ${
              activeCategory === 'all'
                ? 'bg-white/10 text-white'
                : 'text-dark-400 hover:text-dark-200'
            }
          `}
          aria-label="Show all styles"
        >
          All
        </button>
        {STYLE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`
              flex-1 text-[11px] font-medium py-1.5 rounded-md transition-all
              ${
                activeCategory === cat.id
                  ? 'bg-white/10 text-white'
                  : 'text-dark-400 hover:text-dark-200'
              }
            `}
            aria-label={`Show ${cat.label} styles`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Style Cards */}
      <div className="grid grid-cols-2 gap-2">
        <AnimatePresence mode="popLayout">
          {filteredPresets.map((preset, index) => {
            const isSelected = selectedStyle === preset.id;
            const disabled = !hasImage || (isProcessing && !isSelected);
            const isCurrentlyProcessing = isProcessing && isSelected;

            return (
              <motion.button
                key={preset.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleQuickApply(preset.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleStyleClick(preset.id);
                }}
                disabled={disabled}
                title={
                  !hasImage
                    ? 'Upload an image first'
                    : disabled
                    ? 'Processing...'
                    : `Apply ${preset.label} style (right-click for custom prompt)`
                }
                className={`
                  group relative rounded-xl border p-3 text-center transition-all duration-300
                  ${
                    disabled
                      ? 'border-dark-800 bg-dark-900/30 opacity-40 cursor-not-allowed'
                      : isSelected
                      ? 'border-accent-purple/50 bg-accent-purple/10 ring-1 ring-accent-purple/30'
                      : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/10'
                  }
                `}
                whileHover={!disabled ? { scale: 1.03, y: -2 } : undefined}
                whileTap={!disabled ? { scale: 0.97 } : undefined}
                aria-label={`${preset.label} style preset`}
                style={
                  isSelected
                    ? { boxShadow: '0 0 25px rgba(124, 58, 237, 0.25)' }
                    : undefined
                }
              >
                <div className="text-2xl mb-1.5">
                  {isCurrentlyProcessing ? (
                    <Loader2
                      size={24}
                      className="animate-spin text-accent-purple mx-auto"
                    />
                  ) : (
                    preset.icon
                  )}
                </div>
                <p className="text-xs font-medium text-white">{preset.label}</p>

                {isSelected && !isCurrentlyProcessing && (
                  <motion.div
                    layoutId="styleRing"
                    className="absolute inset-0 rounded-xl ring-2 ring-accent-purple/40 pointer-events-none"
                    transition={{ type: 'spring', damping: 20 }}
                  />
                )}

                {!disabled && !isSelected && (
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-accent-purple/10 to-transparent pointer-events-none" />
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Custom Prompt Modal */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-white/10 bg-dark-900/80 backdrop-blur-xl p-3 space-y-2">
              <label
                htmlFor="customPrompt"
                className="text-xs font-medium text-dark-300"
              >
                Custom prompt (optional)
              </label>
              <textarea
                id="customPrompt"
                value={customPrompt}
                onChange={(e) =>
                  setCustomPrompt(e.target.value.slice(0, 200))
                }
                placeholder="Describe your desired style..."
                rows={2}
                className="w-full bg-dark-950/50 border border-white/5 rounded-lg px-3 py-2 text-xs text-white placeholder-dark-500 focus:outline-none focus:border-accent-purple/50 resize-none"
                aria-label="Custom prompt input"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-dark-500">
                  {customPrompt.length}/200
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowPrompt(false);
                      setPendingPreset(null);
                      setCustomPrompt('');
                    }}
                    className="px-3 py-1.5 text-xs text-dark-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApply}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-accent-purple to-accent-pink text-white hover:opacity-90 transition-opacity"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!hasImage && (
        <p className="text-[11px] text-dark-500 text-center py-1">
          Upload a photo to apply styles
        </p>
      )}
    </div>
  );
}
