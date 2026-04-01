import { cleanupExpiredJobs } from './jobService';

let cleanupInterval: NodeJS.Timeout | null = null;

export function startCleanupWorker(): void {
  const intervalMs = parseInt(process.env.FILE_TTL_SECONDS || '3600', 10) * 1000;

  cleanupInterval = setInterval(() => {
    try {
      const cleaned = cleanupExpiredJobs();
      if (cleaned > 0) {
        console.log(`[Cleanup] Removed ${cleaned} expired job(s)`);
      }
    } catch (error) {
      console.error('[Cleanup] Error during cleanup:', error);
    }
  }, Math.min(intervalMs, 60000));

  console.log(`[Cleanup] Worker started. Checking every ${Math.min(intervalMs / 1000, 60)}s`);
}

export function stopCleanupWorker(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log('[Cleanup] Worker stopped');
  }
}
