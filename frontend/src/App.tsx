import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Github, Menu, X as XIcon } from 'lucide-react';
import UploadZone from './components/UploadZone';
import EditorCanvas from './components/EditorCanvas';
import ControlPanel from './components/ControlPanel';
import StyleGrid from './components/StyleGrid';
import BackgroundTool from './components/BackgroundTool';
import StatusBar from './components/StatusBar';
import DownloadButton from './components/DownloadButton';
import ToastSystem from './components/Toast';
import { useImageEditor } from './hooks/useImageEditor';
import { useJobPolling } from './hooks/useJobPolling';

export default function App() {
  const {
    state,
    toasts,
    isProcessing,
    handleUpload,
    handleRemoveBackground,
    handleApplyStyle,
    handleEnhanceFace,
    handleReplaceBackground,
    handleReset,
    handleDownload,
    updateFromPoll,
    removeToast,
  } = useImageEditor();

  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useJobPolling({
    jobId: state.jobId,
    enabled: state.status === 'pending' || state.status === 'processing',
    onCompleted: (response) => {
      updateFromPoll('completed', 100, response.resultUrl, null);
      setCurrentAction(null);
    },
    onFailed: (error) => {
      updateFromPoll('failed', 0, null, error);
      setCurrentAction(null);
    },
  });

  const wrappedRemoveBg = useCallback(() => {
    setCurrentAction('remove-bg');
    handleRemoveBackground();
  }, [handleRemoveBackground]);

  const wrappedEnhance = useCallback(() => {
    setCurrentAction('enhance');
    handleEnhanceFace();
  }, [handleEnhanceFace]);

  const hasImage = !!state.jobId && !!state.originalUrl;
  const hasResult = !!state.resultUrl;

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[40%] -left-[20%] w-[60%] h-[60%] rounded-full bg-accent-purple/[0.03] blur-[120px]" />
        <div className="absolute -bottom-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-accent-pink/[0.03] blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-accent-blue/[0.02] blur-[100px]" />
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-50 border-b border-white/5 bg-dark-950/80 backdrop-blur-xl"
      >
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center shadow-lg shadow-accent-purple/20"
            >
              <Sparkles size={18} className="text-white" />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold gradient-text">PFP Maker</h1>
              <p className="text-[10px] text-dark-500 -mt-0.5 hidden sm:block">
                AI Profile Picture Generator
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <span className="text-[11px] text-dark-500">
              Open Source · Free Forever
            </span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-dark-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg"
              aria-label="View source on GitHub"
            >
              <Github size={14} />
              GitHub
            </a>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-dark-400 hover:text-white"
            aria-label="Toggle sidebar"
          >
            {mobileMenuOpen ? <XIcon size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Main content */}
      <div className="flex-1 max-w-[1920px] w-full mx-auto flex flex-col lg:flex-row relative z-10">
        {/* Sidebar */}
        <AnimatePresence>
          {(mobileMenuOpen || true) && (
            <motion.aside
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`
                w-full lg:w-[340px] xl:w-[380px] flex-shrink-0 border-r border-white/5
                bg-dark-950/50 backdrop-blur-sm overflow-y-auto
                ${mobileMenuOpen ? 'block' : 'hidden lg:block'}
              `}
              style={{ maxHeight: 'calc(100vh - 64px)' }}
            >
              <div className="p-4 space-y-6">
                {/* Upload */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <UploadZone
                    onUpload={handleUpload}
                    isUploading={state.status === 'pending' && !state.jobId}
                    hasImage={hasImage}
                    originalUrl={state.originalUrl}
                    onReset={handleReset}
                  />
                </motion.div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* AI Controls */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <ControlPanel
                    hasImage={hasImage}
                    isProcessing={isProcessing}
                    onRemoveBackground={wrappedRemoveBg}
                    onEnhanceFace={wrappedEnhance}
                    onReset={handleReset}
                    currentAction={currentAction}
                  />
                </motion.div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Style Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <StyleGrid
                    hasImage={hasImage}
                    isProcessing={isProcessing}
                    selectedStyle={state.selectedStyle}
                    onApplyStyle={(preset, prompt) => {
                      setCurrentAction('apply-style');
                      handleApplyStyle(preset, prompt);
                    }}
                  />
                </motion.div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Background Tool */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <BackgroundTool
                    hasImage={hasImage}
                    isProcessing={isProcessing}
                    onReplaceBackground={(type, value) => {
                      setCurrentAction('replace-bg');
                      handleReplaceBackground(type, value);
                    }}
                  />
                </motion.div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Download */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <DownloadButton
                    hasResult={hasResult}
                    isProcessing={isProcessing}
                    onDownload={handleDownload}
                  />
                </motion.div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main editor area */}
        <main className="flex-1 flex flex-col p-4 lg:p-6 gap-4">
          <EditorCanvas
            originalUrl={state.originalUrl}
            resultUrl={state.resultUrl}
            isProcessing={isProcessing}
          />

          <StatusBar
            status={state.status}
            progress={state.progress}
            error={state.error}
          />
        </main>
      </div>

      {/* Toast notifications */}
      <ToastSystem toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
