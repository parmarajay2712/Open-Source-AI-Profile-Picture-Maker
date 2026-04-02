import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import {
  createJob,
  getJob,
  updateJobStatus,
  deleteJob,
  getOriginalUrl,
  getResultUrl,
} from '../services/jobService';
import { addJob } from '../queue/worker';
import { getPresetById } from '../services/aiService';
import {
  ApplyStyleRequest,
  ReplaceBackgroundRequest,
  JobStatusResponse,
  UploadResponse,
  HealthResponse,
} from '../types';

const startTime = Date.now();

export async function uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        message: 'No file uploaded. Please select a JPG or PNG image.',
        code: 'NO_FILE',
        statusCode: 400,
      });
      return;
    }

    const job = createJob(req.file.path);

    const response: UploadResponse = {
      jobId: job.id,
      originalUrl: getOriginalUrl(job.id),
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

export async function getJobStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { jobId } = req.params;
    const job = getJob(jobId as string);

    if (!job) {
      res.status(404).json({
        message: 'Job not found.',
        code: 'JOB_NOT_FOUND',
        statusCode: 404,
      });
      return;
    }

    const response: JobStatusResponse = {
      status: job.status,
      resultUrl: job.resultPath ? getResultUrl(job.id) : null,
      progress: job.progress,
      error: job.error,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

export async function removeBackground(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { jobId } = req.params;
    const job = getJob(jobId as string);

    if (!job) {
      res.status(404).json({ message: 'Job not found.', code: 'JOB_NOT_FOUND', statusCode: 404 });
      return;
    }

    updateJobStatus(jobId as string, 'pending', { progress: 0 });

    await addJob({ jobId: jobId as string, action: 'remove-bg' });

    res.json({ message: 'Background removal started.', jobId });
  } catch (error) {
    next(error);
  }
}

export async function applyStyle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { jobId } = req.params;
    const { preset, prompt } = req.body as ApplyStyleRequest;

    const job = getJob(jobId as string);
    if (!job) {
      res.status(404).json({ message: 'Job not found.', code: 'JOB_NOT_FOUND', statusCode: 404 });
      return;
    }

    if (!preset) {
      res.status(400).json({ message: 'Style preset is required.', code: 'MISSING_PRESET', statusCode: 400 });
      return;
    }

    const stylePreset = getPresetById(preset);
    if (!stylePreset) {
      res.status(400).json({ message: `Unknown style preset: ${preset}`, code: 'INVALID_PRESET', statusCode: 400 });
      return;
    }

    updateJobStatus(jobId as string, 'pending', { progress: 0 });

    await addJob({ jobId: jobId as string, action: 'apply-style', preset, prompt });

    res.json({ message: 'Style application started.', jobId });
  } catch (error) {
    next(error);
  }
}

export async function enhanceFace(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { jobId } = req.params;
    const job = getJob(jobId as string);

    if (!job) {
      res.status(404).json({ message: 'Job not found.', code: 'JOB_NOT_FOUND', statusCode: 404 });
      return;
    }

    updateJobStatus(jobId as string, 'pending', { progress: 0 });

    await addJob({ jobId: jobId as string, action: 'enhance' });

    res.json({ message: 'Face enhancement started.', jobId });
  } catch (error) {
    next(error);
  }
}

export async function replaceBackground(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { jobId } = req.params;
    const { type, value } = req.body as ReplaceBackgroundRequest;

    const job = getJob(jobId as string);
    if (!job) {
      res.status(404).json({ message: 'Job not found.', code: 'JOB_NOT_FOUND', statusCode: 404 });
      return;
    }

    if (!type || !value) {
      res.status(400).json({
        message: 'Background type and value are required.',
        code: 'MISSING_BG_PARAMS',
        statusCode: 400,
      });
      return;
    }

    const validTypes = ['color', 'image', 'blur'];
    if (!validTypes.includes(type)) {
      res.status(400).json({
        message: `Invalid background type. Must be one of: ${validTypes.join(', ')}`,
        code: 'INVALID_BG_TYPE',
        statusCode: 400,
      });
      return;
    }

    updateJobStatus(jobId as string, 'pending', { progress: 0 });

    await addJob({ jobId: jobId as string, action: 'replace-bg', bgType: type, bgValue: value });

    res.json({ message: 'Background replacement started.', jobId });
  } catch (error) {
    next(error);
  }
}

export async function getResult(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { jobId } = req.params;
    const type = req.query.type as string | undefined;
    const job = getJob(jobId as string);

    if (!job) {
      res.status(404).json({ message: 'Job not found.', code: 'JOB_NOT_FOUND', statusCode: 404 });
      return;
    }

    const filePath = type === 'original' ? job.originalPath : (job.resultPath || job.originalPath);

    if (!filePath || !fs.existsSync(filePath)) {
      res.status(404).json({ message: 'Result file not found.', code: 'FILE_NOT_FOUND', statusCode: 404 });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
    };

    res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=300');

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
}

export async function deleteJobHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { jobId } = req.params;
    const deleted = deleteJob(jobId as string);

    if (!deleted) {
      res.status(404).json({ message: 'Job not found.', code: 'JOB_NOT_FOUND', statusCode: 404 });
      return;
    }

    res.json({ message: 'Job deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

export function healthCheck(_req: Request, res: Response): void {
  const response: HealthResponse = {
    status: 'ok',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    version: '1.0.0',
  };
  res.json(response);
}
