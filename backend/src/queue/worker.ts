import { Queue, Worker, Job as BullJob } from 'bullmq';
import IORedis from 'ioredis';
import { getJob, updateJobStatus } from '../services/jobService';
import { aiService, getPresetById } from '../services/aiService';
import { STYLE_PRESETS } from '../types';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let connection: IORedis | null = null;
let aiQueue: Queue | null = null;
let aiWorker: Worker | null = null;

function getConnection(): IORedis {
  if (!connection) {
    connection = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy: (times: number) => {
        if (times > 10) return null;
        return Math.min(times * 200, 5000);
      },
    });
    connection.on('error', (err) => {
      console.error('[Redis] Connection error:', err.message);
    });
  }
  return connection;
}

type JobAction = 'remove-bg' | 'enhance' | 'apply-style' | 'replace-bg';

interface JobData {
  jobId: string;
  action: JobAction;
  preset?: string;
  prompt?: string;
  bgType?: string;
  bgValue?: string;
}

export function getQueue(): Queue<JobData> {
  if (!aiQueue) {
    aiQueue = new Queue<JobData>('ai-processing', {
      connection: getConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: { age: 3600 },
        removeOnFail: { age: 7200 },
      },
    });
  }
  return aiQueue;
}

async function processJob(bullJob: BullJob<JobData>): Promise<void> {
  const { jobId, action, preset, prompt, bgType, bgValue } = bullJob.data;
  const job = getJob(jobId);

  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  updateJobStatus(jobId, 'processing', { progress: 10 });

  const inputPath = job.resultPath || job.originalPath;

  try {
    let resultPath: string;

    switch (action) {
      case 'remove-bg':
        updateJobStatus(jobId, 'processing', { progress: 30 });
        resultPath = await aiService.removeBackground(inputPath);
        break;

      case 'enhance':
        updateJobStatus(jobId, 'processing', { progress: 30 });
        resultPath = await aiService.enhanceFace(inputPath);
        break;

      case 'apply-style': {
        const stylePreset = preset ? getPresetById(preset) : undefined;
        if (!stylePreset) {
          throw new Error(`Unknown style preset: ${preset}`);
        }
        const finalPreset = prompt ? { ...stylePreset, prompt } : stylePreset;
        updateJobStatus(jobId, 'processing', { progress: 30 });
        resultPath = await aiService.applyStyle(inputPath, finalPreset);
        break;
      }

      case 'replace-bg':
        if (!bgType || !bgValue) {
          throw new Error('Background type and value are required');
        }
        updateJobStatus(jobId, 'processing', { progress: 30 });
        resultPath = await aiService.replaceBackground(inputPath, {
          type: bgType as 'color' | 'image' | 'blur',
          value: bgValue,
        });
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    updateJobStatus(jobId, 'completed', { resultPath, progress: 100 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Processing failed';
    updateJobStatus(jobId, 'failed', { error: message, progress: 0 });
    throw error;
  }
}

export function startWorker(): void {
  try {
    aiWorker = new Worker<JobData>('ai-processing', processJob, {
      connection: getConnection(),
      concurrency: 2,
      limiter: {
        max: 5,
        duration: 60000,
      },
    });

    aiWorker.on('completed', (job) => {
      console.log(`[Worker] Job ${job.id} completed for ${job.data.jobId}`);
    });

    aiWorker.on('failed', (job, err) => {
      console.error(`[Worker] Job ${job?.id} failed:`, err.message);
    });

    aiWorker.on('error', (err) => {
      console.error('[Worker] Error:', err.message);
    });

    console.log('[Worker] AI processing worker started');
  } catch (error) {
    console.warn('[Worker] Could not start BullMQ worker (Redis may not be available). Jobs will be processed synchronously.');
  }
}

export async function addJob(data: JobData): Promise<void> {
  try {
    const queue = getQueue();
    await queue.add(data.action, data, {
      jobId: `${data.jobId}-${data.action}-${Date.now()}`,
    });
  } catch (error) {
    console.warn('[Queue] Redis unavailable, processing synchronously');
    const syntheticJob = { data } as BullJob<JobData>;
    await processJob(syntheticJob);
  }
}

export async function stopWorker(): Promise<void> {
  if (aiWorker) {
    await aiWorker.close();
    aiWorker = null;
  }
  if (aiQueue) {
    await aiQueue.close();
    aiQueue = null;
  }
  if (connection) {
    connection.disconnect();
    connection = null;
  }
  console.log('[Worker] Stopped');
}
