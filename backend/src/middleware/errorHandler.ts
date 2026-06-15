import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Response {
  const error = err instanceof AppError ? err : new AppError(err.message, 500);

  logger.error('Error:', {
    message: error.message,
    statusCode: error.statusCode,
    code: error.code,
    path: req.path,
    method: req.method,
    stack: error.stack,
  });

  // Audit log for security events
  if (error.statusCode === 401 || error.statusCode === 403) {
    logger.warn('Security event:', {
      type: error.statusCode === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
      path: req.path,
      ip: req.ip,
      userId: (req as any).user?.id,
    });
  }

  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    code: error.code,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
}

export { AppError };
