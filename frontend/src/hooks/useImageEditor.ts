import { useState, useCallback } from 'react';
import {
  uploadImage,
  removeBackground,
  applyStyle,
  enhanceFace,
  replaceBackground,
  getResultImageUrl,
  getOriginalImageUrl,
  deleteJob,
} from '../services/api';
import {
  EditorState,
  StylePresetId,
  BackgroundType,
  ToastMessage,
} from '../types';

const INITIAL_STATE: EditorState = {
  jobId: null,
  originalUrl: null,
  resultUrl: null,
  status: 'idle',
  progress: 0,
  error: null,
  selectedStyle: null,
  backgroundOptions: null,
};

interface UseImageEditorResult {
  state: EditorState;
  toasts: ToastMessage[];
  isProcessing: boolean;
  handleUpload: (file: File) => Promise<void>;
  handleRemoveBackground: () => Promise<void>;
  handleApplyStyle: (preset: StylePresetId, prompt?: string) => Promise<void>;
  handleEnhanceFace: () => Promise<void>;
  handleReplaceBackground: (type: BackgroundType, value: string) => Promise<void>;
  handleReset: () => void;
  handleDownload: (format: 'png' | 'jpg') => void;
  updateFromPoll: (status: EditorState['status'], progress: number, resultUrl: string | null, error: string | null) => void;
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
}

let toastCounter = 0;

export function useImageEditor(): UseImageEditorResult {
  const [state, setState] = useState<EditorState>(INITIAL_STATE);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const isProcessing = state.status === 'pending' || state.status === 'processing';

  const addToast = useCallback(
    (type: ToastMessage['type'], title: string, message: string) => {
      const id = `toast-${++toastCounter}`;
      const toast: ToastMessage = { id, type, title, message, duration: 5000 };
      setToasts((prev) => [...prev, toast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleUpload = useCallback(
    async (file: File) => {
      try {
        setState((prev) => ({
          ...prev,
          status: 'pending',
          progress: 0,
          error: null,
        }));

        const response = await uploadImage(file);

        setState((prev) => ({
          ...prev,
          jobId: response.jobId,
          originalUrl: getOriginalImageUrl(response.jobId),
          resultUrl: null,
          status: 'idle',
          progress: 0,
        }));

        addToast('success', 'Upload Complete', 'Your image is ready for editing.');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setState((prev) => ({
          ...prev,
          status: 'failed',
          error: message,
        }));
        addToast('error', 'Upload Failed', message);
      }
    },
    [addToast]
  );

  const handleRemoveBackground = useCallback(async () => {
    if (!state.jobId || isProcessing) return;
    try {
      setState((prev) => ({
        ...prev,
        status: 'pending',
        progress: 0,
        error: null,
      }));
      await removeBackground(state.jobId);
      addToast('info', 'Processing', 'Removing background...');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove background';
      setState((prev) => ({
        ...prev,
        status: 'failed',
        error: message,
      }));
      addToast('error', 'Error', message);
    }
  }, [state.jobId, isProcessing, addToast]);

  const handleApplyStyle = useCallback(
    async (preset: StylePresetId, prompt?: string) => {
      if (!state.jobId || isProcessing) return;
      try {
        setState((prev) => ({
          ...prev,
          status: 'pending',
          progress: 0,
          error: null,
          selectedStyle: preset,
        }));
        await applyStyle(state.jobId, preset, prompt);
        addToast('info', 'Processing', 'Applying style transformation...');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to apply style';
        setState((prev) => ({
          ...prev,
          status: 'failed',
          error: message,
        }));
        addToast('error', 'Error', message);
      }
    },
    [state.jobId, isProcessing, addToast]
  );

  const handleEnhanceFace = useCallback(async () => {
    if (!state.jobId || isProcessing) return;
    try {
      setState((prev) => ({
        ...prev,
        status: 'pending',
        progress: 0,
        error: null,
      }));
      await enhanceFace(state.jobId);
      addToast('info', 'Processing', 'Enhancing face quality...');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to enhance face';
      setState((prev) => ({
        ...prev,
        status: 'failed',
        error: message,
      }));
      addToast('error', 'Error', message);
    }
  }, [state.jobId, isProcessing, addToast]);

  const handleReplaceBackground = useCallback(
    async (type: BackgroundType, value: string) => {
      if (!state.jobId || isProcessing) return;
      try {
        setState((prev) => ({
          ...prev,
          status: 'pending',
          progress: 0,
          error: null,
          backgroundOptions: { type, value },
        }));
        await replaceBackground(state.jobId, type, value);
        addToast('info', 'Processing', 'Replacing background...');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to replace background';
        setState((prev) => ({
          ...prev,
          status: 'failed',
          error: message,
        }));
        addToast('error', 'Error', message);
      }
    },
    [state.jobId, isProcessing, addToast]
  );

  const updateFromPoll = useCallback(
    (
      status: EditorState['status'],
      progress: number,
      resultUrl: string | null,
      error: string | null
    ) => {
      setState((prev) => {
        const newResultUrl = resultUrl
          ? prev.jobId
            ? `${getResultImageUrl(prev.jobId)}&t=${Date.now()}`
            : null
          : prev.resultUrl;

        return {
          ...prev,
          status,
          progress,
          resultUrl: newResultUrl,
          error,
        };
      });

      if (status === 'completed') {
        addToast('success', 'Complete', 'Your image has been processed successfully!');
      } else if (status === 'failed' && error) {
        addToast('error', 'Processing Failed', error);
      }
    },
    [addToast]
  );

  const handleReset = useCallback(() => {
    if (state.jobId) {
      deleteJob(state.jobId).catch(() => {});
    }
    setState(INITIAL_STATE);
    addToast('info', 'Reset', 'Editor has been reset.');
  }, [state.jobId, addToast]);

  const handleDownload = useCallback(
    (format: 'png' | 'jpg') => {
      if (!state.jobId) return;

      const url = state.resultUrl || getOriginalImageUrl(state.jobId);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pfp-maker-result.${format}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast('success', 'Download Started', `Downloading as ${format.toUpperCase()}...`);
    },
    [state.jobId, state.resultUrl, addToast]
  );

  return {
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
    addToast,
    removeToast,
  };
}
