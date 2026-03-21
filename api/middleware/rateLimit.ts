import { Request, Response, NextFunction } from 'express';

// Simple in-memory rate limiter for demonstration
const requestCounts = new Map<string, { count: number, timestamp: number }>();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100;

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  const record = requestCounts.get(ip);

  if (!record) {
    requestCounts.set(ip, { count: 1, timestamp: now });
    return next();
  }

  if (now - record.timestamp > WINDOW_MS) {
    // Reset window
    requestCounts.set(ip, { count: 1, timestamp: now });
    return next();
  }

  if (record.count >= MAX_REQUESTS) {
    return res.status(429).json({ message: 'Too many requests, please try again later.' });
  }

  record.count++;
  next();
};
