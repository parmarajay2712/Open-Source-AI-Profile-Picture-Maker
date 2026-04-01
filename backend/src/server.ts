import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import apiRoutes from './routes/api';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { startCleanupWorker, stopCleanupWorker } from './services/cleanupService';
import { startWorker, stopWorker } from './queue/worker';
import { ensureTempDir } from './services/jobService';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

ensureTempDir();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api', apiLimiter);

app.use('/api', apiRoutes);

app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`\n🚀 PFP Maker API running on http://localhost:${PORT}`);
  console.log(`📁 Temp directory: ${path.resolve(process.env.TEMP_DIR || './temp')}`);
  console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);

  startCleanupWorker();

  try {
    startWorker();
  } catch (err) {
    console.warn('[Server] BullMQ worker could not start. Jobs will process synchronously.');
  }
});

function gracefulShutdown(signal: string): void {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  stopCleanupWorker();
  stopWorker().catch(console.error);
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
