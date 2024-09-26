import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import Redis from 'ioredis';

const LOG_PREFIX = '[CSRF Protection]';

// Initialize Redis client
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
console.log(`${LOG_PREFIX} Connecting to Redis at:`, redisUrl);
const redis = new Redis(redisUrl);

// Generate a unique session ID
const generateSessionId = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

// Generate a CSRF token
const generateCsrfToken = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

export const getCsrfToken = async (req: Request, res: Response): Promise<void> => {
  const sessionId = req.headers['x-session-id'] as string || generateSessionId();
  const token = generateCsrfToken();
  
  console.log(`${LOG_PREFIX} Generated new CSRF token:`, token);
  
  // Store the token in Redis with the session ID as the key
  await redis.set(`csrf:${sessionId}`, token, 'EX', 3600); // Expires in 1 hour
  
  res.setHeader('X-Session-ID', sessionId);
  res.json({ csrfToken: token });
};

export const validateCsrfToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const sessionId = req.headers['x-session-id'] as string;
  const token = req.headers['x-csrf-token'] as string || req.body._csrf;
  
  if (!sessionId || !token) {
    console.error(`${LOG_PREFIX} Missing session ID or CSRF token`);
    res.status(403).json({ message: 'Missing session ID or CSRF token' });
    return;
  }
  
  const storedToken = await redis.get(`csrf:${sessionId}`);
  
  if (!storedToken || token !== storedToken) {
    console.error(`${LOG_PREFIX} Invalid CSRF token`);
    res.status(403).json({ message: 'Invalid CSRF token' });
    return;
  }
  
  console.log(`${LOG_PREFIX} CSRF token is valid`);
  next();
};

// Middleware to ensure CSRF token is set
export const ensureCsrfToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const sessionId = req.headers['x-session-id'] as string;
  
  if (!sessionId || !(await redis.exists(`csrf:${sessionId}`))) {
    await getCsrfToken(req, res);
  } else {
    next();
  }
};

export default {
  getCsrfToken,
  validateCsrfToken,
  ensureCsrfToken
};