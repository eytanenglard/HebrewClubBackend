import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
const LOG_PREFIX = '[AuthMiddleware]';

const getTokenFromRequest = (req: Request): string | null => {
  return req.cookies.accessToken || req.header('Authorization')?.replace('Bearer ', '') || null;
};

const logHash = (str: string) => {
  const hash = crypto.createHash('sha256').update(str).digest('hex');
  console.log(`Hash of the string: ${hash}`);
};

const verifyAndDecodeToken = (token: string) => {
  console.log(`${LOG_PREFIX} Attempting to verify token`);
  return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as jwt.JwtPayload;
};

export const authenticateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log(`${LOG_PREFIX} Starting user authentication check`);
  
  try {
    const token = getTokenFromRequest(req);
    
    if (!token) {
      console.log(`${LOG_PREFIX} No token provided`);
      res.status(401).json({ success: false, error: 'No token provided' });
      return;
    }

    let decoded;
    try {
      decoded = verifyAndDecodeToken(token);
    } catch (jwtError) {
      console.error(`${LOG_PREFIX} JWT verification failed:`, jwtError);
      res.status(401).json({ success: false, error: `Invalid token: ${jwtError}` });
      return;
    }

    if (!decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
      console.error(`${LOG_PREFIX} Decoded token is invalid or missing userId`);
      res.status(401).json({ success: false, error: 'Invalid token structure' });
      return;
    }

    const userId = decoded.userId;
    const user = await User.findById(userId);

    if (!user) {
      console.log(`${LOG_PREFIX} User not found for ID:`, userId);
      res.status(401).json({ success: false, error: 'User not found' });
      return;
    }

    console.log(`${LOG_PREFIX} User authenticated successfully:`, user._id);
    (req as any).user = user;
    next();
  } catch (error) {
    console.error(`${LOG_PREFIX} Unexpected error in authenticateUser:`, error);
    res.status(500).json({ success: false, error: 'Internal server error during authentication' });
  }
};

export const adminAuthCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log(`${LOG_PREFIX} Starting admin authentication check`);
  
  try {
    const token = getTokenFromRequest(req);
    
    if (!token) {
      console.log(`${LOG_PREFIX} No token provided`);
      res.status(401).json({ success: false, error: 'No token provided' });
      return;
    }

    let decoded;
    try {
      decoded = verifyAndDecodeToken(token);
    } catch (jwtError) {
      console.error(`${LOG_PREFIX} JWT verification failed:`, jwtError);
      res.status(401).json({ success: false, error: `Invalid token: ${jwtError}` });
      return;
    }

    if (!decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
      console.error(`${LOG_PREFIX} Decoded token is invalid or missing userId`);
      res.status(401).json({ success: false, error: 'Invalid token structure' });
      return;
    }

    const userId = decoded.userId;
    const user = await User.findById(userId);

    if (!user) {
      console.log(`${LOG_PREFIX} User not found for ID:`, userId);
      res.status(401).json({ success: false, error: 'User not found' });
      return;
    }

    if (user.role.name !== 'admin') {
      console.log(`${LOG_PREFIX} User is not an admin:`, user._id);
      res.status(403).json({ success: false, error: 'Access denied. Admin privileges required.' });
      return;
    }

    console.log(`${LOG_PREFIX} Admin authenticated successfully:`, user._id);
    (req as any).user = user;
    next();
  } catch (error) {
    console.error(`${LOG_PREFIX} Unexpected error in adminAuthCheck:`, error);
    res.status(500).json({ success: false, error: 'Internal server error during authentication' });
  }
};

export const testJwtSecret = () => {
  console.log(`${LOG_PREFIX} Testing JWT_SECRET`);
  console.log(`${LOG_PREFIX} JWT_SECRET length: ${JWT_SECRET.length}`);
  logHash(JWT_SECRET);
  
  const testPayload = { test: 'payload' };
  const testToken = jwt.sign(testPayload, JWT_SECRET, { algorithm: 'HS256' });
  console.log(`${LOG_PREFIX} Test token created:`, testToken);
  
  try {
    const verified = jwt.verify(testToken, JWT_SECRET, { algorithms: ['HS256'] });
    console.log(`${LOG_PREFIX} Test token verified successfully:`, JSON.stringify(verified, null, 2));
  } catch (error) {
    console.error(`${LOG_PREFIX} Test token verification failed:`, error);
  }
};

// Run the JWT secret test
testJwtSecret();