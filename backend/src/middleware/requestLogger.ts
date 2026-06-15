import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: (req as any).user?.id,
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP Request:', logData);
    } else if (duration > 1000) {
      logger.debug('Slow HTTP Request:', logData);
    } else {
      logger.debug('HTTP Request:', logData);
    }
  });

  next();
}
