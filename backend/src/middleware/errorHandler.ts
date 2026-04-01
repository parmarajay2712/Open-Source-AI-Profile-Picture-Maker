import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isProduction = process.env.NODE_ENV === 'production';

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({
        message: 'File too large. Maximum size is 10MB.',
        code: 'FILE_TOO_LARGE',
        statusCode: 413,
      });
      return;
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        message: 'Too many files. Only one file is allowed.',
        code: 'TOO_MANY_FILES',
        statusCode: 400,
      });
      return;
    }
    res.status(400).json({
      message: err.message,
      code: 'UPLOAD_ERROR',
      statusCode: 400,
    });
    return;
  }

  if (err.message === 'Invalid file type. Only JPG and PNG images are allowed.') {
    res.status(415).json({
      message: err.message,
      code: 'INVALID_FILE_TYPE',
      statusCode: 415,
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = isProduction && statusCode === 500
    ? 'An internal server error occurred.'
    : err.message || 'An internal server error occurred.';

  console.error(`[Error] ${statusCode}: ${err.message}`, isProduction ? '' : err.stack);

  res.status(statusCode).json({
    message,
    code: err.code || 'INTERNAL_ERROR',
    statusCode,
  });
}
