import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import Redis from 'ioredis';

const LOG_PREFIX = '[CSRF Protection]';

// Initialize Redis client
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
console.log(`${LOG_PREFIX} Connecting to Redis at:`, redisUrl);
const redis = new Redis(redisUrl);

redis.on('error', (error) => {
  console.error(`${LOG_PREFIX} Redis connection error:`, error);
});

// Generate a unique session ID
const generateSessionId = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

// Generate a CSRF token
const generateCsrfToken = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

export const getCsrfToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = req.headers['x-session-id'] as string || generateSessionId();
    const token = generateCsrfToken();
    
    console.log(`${LOG_PREFIX} Generated new CSRF token:`, token);
    
    // Store the token in Redis with the session ID as the key
    await redis.set(`csrf:${sessionId}`, token, 'EX', 3600); // Expires in 1 hour
    
    res.setHeader('X-Session-ID', sessionId);
    res.json({ csrfToken: token });
  } catch (error) {
    console.error(`${LOG_PREFIX} Error generating CSRF token:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const validateCsrfToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
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
  } catch (error) {
    console.error(`${LOG_PREFIX} Error validating CSRF token:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Middleware to ensure CSRF token is set
export const ensureCsrfToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    
    if (!sessionId || !(await redis.exists(`csrf:${sessionId}`))) {
      await getCsrfToken(req, res);
    } else {
      next();
    }
  } catch (error) {
    console.error(`${LOG_PREFIX} Error ensuring CSRF token:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Function to close Redis connection (call this when your app is shutting down)
export const closeRedisConnection = async (): Promise<void> => {
  try {
    await redis.quit();
    console.log(`${LOG_PREFIX} Redis connection closed`);
  } catch (error) {
    console.error(`${LOG_PREFIX} Error closing Redis connection:`, error);
  }
};

export default {
  getCsrfToken,
  validateCsrfToken,
  ensureCsrfToken,
  closeRedisConnection
};