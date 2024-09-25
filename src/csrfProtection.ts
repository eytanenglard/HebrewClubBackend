import csurf from 'csurf';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const LOG_PREFIX = '[CSRF Protection]';

const csrfProtectionMiddleware = csurf({
  cookie: {
    key: 'XSRF-TOKEN',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

export const getCsrfToken = (_req: Request, res: Response): void => {
  const token = crypto.randomBytes(16).toString('hex');
  console.log(`${LOG_PREFIX} Generated new CSRF token:`, token);
  
  res.cookie('XSRF-TOKEN', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  
  res.json({ csrfToken: token });
};

export const validateCsrfToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers['x-csrf-token'] as string || req.body._csrf;
  const cookieToken = req.cookies['XSRF-TOKEN'];
  console.log('csrf-token', token);
  console.log('cookieToken-csrf-token', cookieToken);
  if (!token || !cookieToken || token !== cookieToken) {
    console.error(`${LOG_PREFIX} Invalid CSRF token`);
    res.status(403).json({ message: 'Invalid CSRF token' });
    return;
  }
  
  console.log(`${LOG_PREFIX} CSRF token is valid`);
  next();
};

// Middleware to ensure CSRF token is set
export const ensureCsrfToken = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.cookies['XSRF-TOKEN']) {
    getCsrfToken(req, res);
  } else {
    next();
  }
};

export default {
  csrfProtectionMiddleware,
  getCsrfToken,
  validateCsrfToken,
  ensureCsrfToken
};