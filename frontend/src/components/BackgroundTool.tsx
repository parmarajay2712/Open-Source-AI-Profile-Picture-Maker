import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Droplets, ImageIcon, Loader2 } from 'lucide-react';
import { BackgroundType } from '../types';
import { BACKGROUND_COLORS } from '../constants/styles';

interface BackgroundToolProps {
  hasImage: boolean;
  isProcessing: boolean;
  onReplaceBackground: (type: BackgroundType, value: string) => void;
}

type TabId = 'color' | 'blur' | 'prompt';

export default function BackgroundTool({
  hasImage,
  isProcessing,
  onReplaceBackground,
}: BackgroundToolProps) {
  const [activeTab, setActiveTab] = useState<TabId>('color');
  const [selectedColor, setSelectedColor] = useState<string>('#FFFFFF');
  const [customColor, setCustomColor] = useState('#7C3AED');
  const [blurAmount, setBlurAmount] = useState('10');
  const [bgPrompt, setBgPrompt] = useState('');
  const [applyingType, setApplyingType] = useState<string | null>(null);

  const disabled = !hasImage || isProcessing;

  const handleApplyColor = (color: string) => {
    if (disabled) return;
    setSelectedColor(color);
    setApplyingType('color');
    onReplaceBackground('color', color);
  };

  const handleApplyBlur = () => {
    if (disabled) return;
    setApplyingType('blur');
    onReplaceBackground('blur', blurAmount);
  };

  const handleApplyPrompt = () => {
    if (disabled || !bgPrompt.trim()) return;
    setApplyingType('image');
    onReplaceBackground('image', bgPrompt.trim());
  };

  const tabs: { id: TabId; icon: typeof Palette; label: string }[] = [
    { id: 'color', icon: Palette, label: 'Solid Color' },
    { id: 'blur', icon: Droplets, label: 'Blur' },
    { id: 'prompt', icon: ImageIcon, label: 'AI Generate' },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <Palette size={14} className="text-accent-blue" />
        Background
      </h3>

      {/* Tab selector */}
      <div className="flex gap-1 p-1 rounded-lg bg-dark-900/60 border border-white/5">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`
              flex-1 flex items-center justify-center gap-1 text-[11px] font-medium py-1.5 rounded-md transition-all
              ${activeTab === id
                ? 'bg-white/10 text-white'
                : 'text-dark-400 hover:text-dark-200'
              }
            `}
            aria-label={label}
          >
            <Icon size={11} />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'color' && (
          <motion.div
            key="color"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            <div className="grid grid-cols-8 gap-1.5">
              {BACKGROUND_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleApplyColor(color)}
                  disabled={disabled}
                  className={`
                    w-full aspect-square rounded-lg border-2 transition-all duration-200
                    ${selectedColor === color && applyingType === 'color'
                      ? 'border-white scale-110 ring-2 ring-accent-purple/50'
                      : 'border-transparent hover:border-white/30 hover:scale-105'
                    }
                    ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  style={{ backgroundColor: color }}
                  aria-label={`Set background to ${color}`}
                  title={color}
                />
              ))}
            </div>

            {/* Custom color picker */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  aria-label="Custom color picker"
                />
              </div>
              <button
                onClick={() => handleApplyColor(customColor)}
                disabled={disabled}
                className="flex-1 text-xs text-dark-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg py-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isProcessing && applyingType === 'color' ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <Loader2 size={12} className="animate-spin" />
                    Applying...
                  </span>
                ) : (
                  `Apply Custom (${customColor})`
                )}
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'blur' && (
          <motion.div
            key="blur"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="blurRange" className="text-xs text-dark-400">
                  Blur Intensity
                </label>
                <span className="text-xs text-dark-300 font-mono">
                  {blurAmount}px
                </span>
              </div>
              <input
                id="blurRange"
                type="range"
                min="2"
                max="50"
                value={blurAmount}
                onChange={(e) => setBlurAmount(e.target.value)}
                className="w-full h-1.5 rounded-full bg-dark-800 accent-accent-purple cursor-pointer"
                aria-label="Blur intensity slider"
              />
            </div>

            <button
              onClick={handleApplyBlur}
              disabled={disabled}
              className="w-full text-xs font-medium py-2.5 rounded-lg bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 border border-accent-blue/20 text-white hover:from-accent-blue/30 hover:to-accent-purple/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isProcessing && applyingType === 'blur' ? (
                <span className="flex items-center justify-center gap-1.5">
                  <Loader2 size={12} className="animate-spin" />
                  Applying blur...
                </span>
              ) : (
                'Apply Blur Background'
              )}
            </button>
          </motion.div>
        )}

        {activeTab === 'prompt' && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            <div className="space-y-2">
              <label
                htmlFor="bgPrompt"
                className="text-xs text-dark-400"
              >
                Describe your background
              </label>
              <textarea
                id="bgPrompt"
                value={bgPrompt}
                onChange={(e) => setBgPrompt(e.target.value.slice(0, 200))}
                placeholder="e.g. sunset beach, modern office, mountain landscape..."
                rows={3}
                disabled={disabled}
                className="w-full bg-dark-950/50 border border-white/5 rounded-lg px-3 py-2 text-xs text-white placeholder-dark-500 focus:outline-none focus:border-accent-purple/50 resize-none disabled:opacity-40"
                aria-label="Background description prompt"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-dark-500">
                  {bgPrompt.length}/200
                </span>
              </div>
            </div>

            <button
              onClick={handleApplyPrompt}
              disabled={disabled || !bgPrompt.trim()}
              className="w-full text-xs font-medium py-2.5 rounded-lg bg-gradient-to-r from-accent-purple/20 to-accent-pink/20 border border-accent-purple/20 text-white hover:from-accent-purple/30 hover:to-accent-pink/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isProcessing && applyingType === 'image' ? (
                <span className="flex items-center justify-center gap-1.5">
                  <Loader2 size={12} className="animate-spin" />
                  Generating background...
                </span>
              ) : (
                'Generate AI Background'
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!hasImage && (
        <p className="text-[11px] text-dark-500 text-center py-1">
          Upload a photo to change backgrounds
        </p>
      )}
    </div>
  );
}
