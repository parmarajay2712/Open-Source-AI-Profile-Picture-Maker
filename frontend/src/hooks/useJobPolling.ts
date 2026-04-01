import { useState, useEffect, useRef, useCallback } from 'react';
import { getJobStatus } from '../services/api';
import { JobStatus, JobStatusResponse } from '../types';

interface UseJobPollingOptions {
  jobId: string | null;
  enabled?: boolean;
  interval?: number;
  onCompleted?: (response: JobStatusResponse) => void;
  onFailed?: (error: string) => void;
}

interface UseJobPollingResult {
  status: JobStatus | 'idle';
  progress: number;
  resultUrl: string | null;
  error: string | null;
  isPolling: boolean;
  stopPolling: () => void;
  startPolling: () => void;
}

export function useJobPolling({
  jobId,
  enabled = true,
  interval = 2000,
  onCompleted,
  onFailed,
}: UseJobPollingOptions): UseJobPollingResult {
  const [status, setStatus] = useState<JobStatus | 'idle'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);
  const onCompletedRef = useRef(onCompleted);
  const onFailedRef = useRef(onFailed);

  onCompletedRef.current = onCompleted;
  onFailedRef.current = onFailed;

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const poll = useCallback(async () => {
    if (!jobId) return;

    try {
      const response = await getJobStatus(jobId);

      if (!isMountedRef.current) return;

      setStatus(response.status);
      setProgress(response.progress);
      setResultUrl(response.resultUrl);
      setError(response.error);

      if (response.status === 'completed') {
        stopPolling();
        onCompletedRef.current?.(response);
      } else if (response.status === 'failed') {
        stopPolling();
        onFailedRef.current?.(response.error || 'Processing failed');
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      const message = err instanceof Error ? err.message : 'Failed to check status';
      setError(message);
    }
  }, [jobId, stopPolling]);

  const startPolling = useCallback(() => {
    if (!jobId || !enabled) return;

    setIsPolling(true);
    setError(null);

    poll();

    intervalRef.current = setInterval(poll, interval);
  }, [jobId, enabled, interval, poll]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopPolling();
    };
  }, [stopPolling]);

  useEffect(() => {
    if (jobId && enabled) {
      startPolling();
    } else {
      stopPolling();
      if (!jobId) {
        setStatus('idle');
        setProgress(0);
        setResultUrl(null);
        setError(null);
      }
    }

    return () => {
      stopPolling();
    };
  }, [jobId, enabled, startPolling, stopPolling]);

  return {
    status,
    progress,
    resultUrl,
    error,
    isPolling,
    stopPolling,
    startPolling,
  };
}
