import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

const getTokenFromRequest = (req: Request): string | null => {
  return req.cookies.accessToken || req.header('Authorization')?.replace('Bearer ', '') || null;
};

export const adminAuthCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log('[AdminAuthMiddleware] Processing admin authentication');

  try {
    const token = getTokenFromRequest(req);
    
    if (!token) {
      res.status(401).json({ success: false, error: 'No token provided' });
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as jwt.JwtPayload;
    } catch (jwtError) {
      res.status(401).json({ success: false, error: `Invalid token: ${jwtError}` });
      return;
    }

    if (!decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
      res.status(401).json({ success: false, error: 'Invalid token structure' });
      return;
    }

    const userId = decoded.userId;
    const user = await User.findById(userId);

    if (!user) {
      res.status(401).json({ success: false, error: 'User not found' });
      return;
    }

    if (user.role.name !== 'admin') {
      res.status(403).json({ success: false, error: 'Access denied. Admin privileges required.' });
      return;
    }

    (req as any).user = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error during authentication' });
  }
};

export const testJwtSecret = () => {
  const testPayload = { test: 'payload' };
  const testToken = jwt.sign(testPayload, JWT_SECRET, { algorithm: 'HS256' });
  
  try {
    jwt.verify(testToken, JWT_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    console.error(`JWT Secret test failed:`, error);
  }
};

testJwtSecret();