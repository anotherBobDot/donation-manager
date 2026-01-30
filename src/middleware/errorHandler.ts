/**
 * Global Error Handler
 *
 * Catches unhandled errors and returns a consistent JSON response.
 * In production, stack traces are omitted.
 */

import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error(`[ERROR] ${err.message}`, err.stack);

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? undefined : err.message,
  });
}
