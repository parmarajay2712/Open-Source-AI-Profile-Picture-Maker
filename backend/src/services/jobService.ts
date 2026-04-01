import { Job, JobStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const TEMP_DIR = process.env.TEMP_DIR || './temp';

const jobs = new Map<string, Job>();

export function createJob(originalPath: string): Job {
  const id = uuidv4();
  const now = Date.now();
  const job: Job = {
    id,
    status: 'pending',
    originalPath,
    resultPath: null,
    progress: 0,
    error: null,
    createdAt: now,
    updatedAt: now,
  };
  jobs.set(id, job);
  return job;
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

export function updateJob(id: string, updates: Partial<Omit<Job, 'id' | 'createdAt'>>): Job | undefined {
  const job = jobs.get(id);
  if (!job) return undefined;

  const updated: Job = {
    ...job,
    ...updates,
    updatedAt: Date.now(),
  };
  jobs.set(id, updated);
  return updated;
}

export function updateJobStatus(id: string, status: JobStatus, extras?: { resultPath?: string; progress?: number; error?: string }): Job | undefined {
  return updateJob(id, {
    status,
    ...extras,
  });
}

export function deleteJob(id: string): boolean {
  const job = jobs.get(id);
  if (!job) return false;

  try {
    if (job.originalPath && fs.existsSync(job.originalPath)) {
      fs.unlinkSync(job.originalPath);
    }
    if (job.resultPath && fs.existsSync(job.resultPath)) {
      fs.unlinkSync(job.resultPath);
    }
  } catch (err) {
    console.error(`[JobService] Error cleaning up files for job ${id}:`, err);
  }

  jobs.delete(id);
  return true;
}

export function cleanupExpiredJobs(): number {
  const ttl = parseInt(process.env.FILE_TTL_SECONDS || '3600', 10) * 1000;
  const now = Date.now();
  let cleaned = 0;

  for (const [id, job] of jobs.entries()) {
    if (now - job.createdAt > ttl) {
      deleteJob(id);
      cleaned++;
    }
  }

  return cleaned;
}

export function getOriginalUrl(jobId: string): string {
  return `/api/result/${jobId}?type=original`;
}

export function getResultUrl(jobId: string): string {
  return `/api/result/${jobId}`;
}

export function ensureTempDir(): void {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
}
