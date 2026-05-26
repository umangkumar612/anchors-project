import { NextFunction, Request, Response } from 'express';

export function notFound(req: Request, res: Response) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (res.headersSent) {
    return;
  }

  const message = error instanceof Error ? error.message : 'Server error';
  console.error(error);

  if (error instanceof Error && error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid request id' });
  }

  res.status(500).json({ message });
}
