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
    let sessionId = req.headers['x-session-id'] as string;
    let token: string | null;

    if (!sessionId) {
      sessionId = generateSessionId();
      token = generateCsrfToken();
      await redis.set(`csrf:${sessionId}`, token, 'EX', 3600); // Expires in 1 hour
      console.log(`${LOG_PREFIX} Generated new session ID and CSRF token:`, { sessionId, token });
    } else {
      token = await redis.get(`csrf:${sessionId}`);
      if (!token) {
        token = generateCsrfToken();
        await redis.set(`csrf:${sessionId}`, token, 'EX', 3600);
        console.log(`${LOG_PREFIX} Generated new CSRF token for existing session:`, { sessionId, token });
      } else {
        console.log(`${LOG_PREFIX} Using existing CSRF token for session:`, { sessionId, token });
      }
    }

    res.setHeader('X-Session-ID', sessionId);
    res.json({ csrfToken: token, sessionId: sessionId });
  } catch (error) {
    console.error(`${LOG_PREFIX} Error handling CSRF token:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const validateCsrfToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    const token = req.headers['x-csrf-token'] as string || req.body._csrf;

    if (!sessionId || !token) {
      console.error(`${LOG_PREFIX} Missing session ID or CSRF token`, { sessionId, token });
      res.status(401).json({ message: 'Missing session ID or CSRF token' });
      return;
    }

    const storedToken = await redis.get(`csrf:${sessionId}`);

    if (!storedToken || token !== storedToken) {
      console.error(`${LOG_PREFIX} Invalid CSRF token`, { sessionId, providedToken: token, storedToken });
      res.status(403).json({ message: 'Invalid CSRF token' });
      return;
    }

    console.log(`${LOG_PREFIX} CSRF token is valid`, { sessionId, token });
    next();
  } catch (error) {
    console.error(`${LOG_PREFIX} Error validating CSRF token:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const ensureSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let sessionId = req.headers['x-session-id'] as string;
    if (!sessionId) {
      sessionId = generateSessionId();
      console.log(`${LOG_PREFIX} Generated new session ID:`, sessionId);
      res.setHeader('X-Session-ID', sessionId);
    } else {
      console.log(`${LOG_PREFIX} Using existing session ID:`, sessionId);
    }
    req.headers['x-session-id'] = sessionId;
    next();
  } catch (error) {
    console.error(`${LOG_PREFIX} Error ensuring session:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Middleware to ensure CSRF token is set
export const ensureCsrfToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    
    if (!sessionId) {
      console.error(`${LOG_PREFIX} No session ID found`);
      res.status(401).json({ message: 'No session ID found' });
      return;
    }

    const existingToken = await redis.get(`csrf:${sessionId}`);
    if (!existingToken) {
      await getCsrfToken(req, res);
    } else {
      console.log(`${LOG_PREFIX} CSRF token already exists for session:`, sessionId);
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
  ensureSession,
  ensureCsrfToken,
  closeRedisConnection
};