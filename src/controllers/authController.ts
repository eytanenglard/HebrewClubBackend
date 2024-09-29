import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import User from '../models/User.js';
import { User as UserType, ApiResponse, UserRole } from '../types/models.js';
import { getCsrfToken } from '../csrfProtection.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import UserModel, { UserDocument } from '../models/User.js';
import { sendPasswordResetEmail} from '../controllers/emailController.js';
import { sendEmailVerificationInternal } from '../controllers/emailController.js';
import { Types } from 'mongoose';

dotenv.config();
const LOG_PREFIX = '[AuthController]';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
console.log(`${LOG_PREFIX} API_BASE_URL:`, API_BASE_URL);



const createToken = (userId: string) => {
  console.log(`${LOG_PREFIX} Creating token for user: ${userId}`);
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1d' });
  console.log(`${LOG_PREFIX} Token created. Length: ${token.length}`);
  return token;
};

export const csrfTokenHandler = (req: Request, res: Response): void => {
  console.log(`${LOG_PREFIX} Generating CSRF token`);
  try {
    getCsrfToken(req, res);
    console.log(`${LOG_PREFIX} CSRF token generated and sent successfully`);
  } catch (error) {
    console.error(`${LOG_PREFIX} Error generating CSRF token:`, error);
    res.status(500).json({ message: 'Error generating CSRF token', error: (error as Error).message });
  }
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(`${LOG_PREFIX} Registering new user`);
    const { name, email, username, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log(`${LOG_PREFIX} Registration failed: User already exists`);
      res.status(400).json({ success: false, error: 'User already exists' } as ApiResponse<null>);
      return;
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const defaultRole: UserRole = { name: 'user', permissions: [] };
    const newUser = new User({
      name,
      email,
      username,
      password: password,
      role: defaultRole,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    });

    await newUser.save();
    console.log(`User saved with token: ${verificationToken} and code: ${verificationCode}`);
    console.log(`${LOG_PREFIX} New user saved. ID: ${newUser._id}`);

    // Send verification email
    const emailSent = await sendEmailVerification(email, verificationToken, verificationCode, name);
    if (!emailSent) {
      console.error(`${LOG_PREFIX} Failed to send verification email`);
      res.status(500).json({ success: false, error: 'Failed to send verification email' } as ApiResponse<null>);
      return;
    }

    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully. Please check your email for verification.',
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    } as ApiResponse<UserType>);
    console.log('res----',res);
    console.log(`${LOG_PREFIX} Registration successful for user: ${newUser._id}`);
  } catch (error) {
    console.error(`${LOG_PREFIX} Error registering user:`, error);
    res.status(500).json({ success: false, error: 'Server error' } as ApiResponse<null>);
  }
};


export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, code, email } = req.body;
    let user: UserDocument | null;

    if (!email) {
      res.status(400).json({ success: false, error: 'Email is required' });
      return;
    }

    user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ success: false, error: 'User not found' });
      return;
    }

    if (token && user.emailVerificationToken === token) {
      if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
        res.status(400).json({ success: false, error: 'Verification token has expired' });
        return;
      }
    } else if (code && user.emailVerificationCode === code) {
      if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
        res.status(400).json({ success: false, error: 'Verification code has expired' });
        return;
      }
    } else {
      res.status(400).json({ success: false, error: 'Invalid verification token or code' });
      return;
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // וידוא שה-_id קיים ומסוג Types.ObjectId
    if (user._id && user._id instanceof Types.ObjectId) {
      const jwtToken = createToken(user._id.toString());

      res.status(200).json({ 
        success: true, 
        message: 'Email verified successfully',
        token: jwtToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } else {
      throw new Error('Invalid user ID');
    }
  } catch (error) {
    console.error(`${LOG_PREFIX} Error verifying email:`, error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// ... (המשך הקוד הקיים)

export const resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({ success: false, error: 'Email already verified' });
      return;
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    user.emailVerificationToken = verificationToken;
    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    await sendEmailVerificationInternal({
      to: email,
      verificationToken,
      verificationCode,
      name: user.name
    });

    res.status(200).json({ success: true, message: 'Verification email resent' });
  } catch (error) {
    console.error(`${LOG_PREFIX} Error resending verification email:`, error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(`${LOG_PREFIX} ===== Login attempt started =====`);
    const { usernameOrEmail, password } = req.body;
    console.log(`${LOG_PREFIX} Attempt to login with: ${usernameOrEmail}`);

    const user = await UserModel.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
    }) as UserDocument | null;

    if (!user) {
      console.log(`${LOG_PREFIX} User not found for: ${usernameOrEmail}`);
      res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials',
        token: null,
        user: null
      });
      return;
    }
    if (!user.isEmailVerified) {
      res.status(401).json({ success: false, error: 'Please verify your email before logging in' });
      return;
    }

    console.log(`${LOG_PREFIX} User found: ${user._id}`);

    console.log(`${LOG_PREFIX} Comparing passwords`);
    const isMatch = await user.comparePassword(password);
    console.log(`${LOG_PREFIX} Password match result: ${isMatch}`);

    if (!isMatch) {
      console.log(`${LOG_PREFIX} Password mismatch for user: ${user._id}`);
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    console.log(`${LOG_PREFIX} Password match successful for user: ${user._id}`);
    const token = createToken((user._id as Types.ObjectId).toString());
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({ 
      success: true, 
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email 
      } 
    });
    console.log(`${LOG_PREFIX} Login successful for user: ${user._id}`);
  } catch (error) {
    console.error(`${LOG_PREFIX} Error in loginUser function:`, error);
    console.error('Stack trace:', (error as Error).stack);
    res.status(500).json({ success: false, error: 'Server error' });
  } finally {
    console.log(`${LOG_PREFIX} ===== Login attempt ended =====`);
  }
};

export const logoutUser = (req: Request, res: Response): void => {
  const token = req.cookies.accessToken || req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.log(`${LOG_PREFIX} No token found, user already logged out`);
    res.status(200).json({ success: true, message: 'User already logged out' });
    return;
  }
  console.log(`${LOG_PREFIX} Logging out user`);
  res.clearCookie('accessToken');
  res.json({ success: true, message: 'Logged out successfully' } as ApiResponse<null>);
  console.log(`${LOG_PREFIX} User logged out successfully`);
};

export const checkAuth = async (req: Request, res: Response): Promise<void> => {
  console.log(`${LOG_PREFIX} Checking authentication for ${req.method} ${req.url}`);
  
  try {
    const token = req.cookies.accessToken || req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      console.log(`${LOG_PREFIX} No token provided`);
      res.status(401).json({ isAuthenticated: false, message: 'No token provided' });
      return;
    }

    console.log(`${LOG_PREFIX} Verifying token`);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    console.log(`${LOG_PREFIX} Decoded token:`, decoded);

    console.log(`${LOG_PREFIX} Finding user with ID:`, decoded.userId);
    const user = await User.findById(decoded.userId);

    if (!user) {
      console.log(`${LOG_PREFIX} User not found for ID:`, decoded.userId);
      res.status(401).json({ isAuthenticated: false, message: 'User not found' });
      return;
    }

    console.log(`${LOG_PREFIX} User found:`, { id: user._id, name: user.name, email: user.email });
    res.json({
      isAuthenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
    console.log(`${LOG_PREFIX} Authentication successful`);
  } catch (error) {
    console.error(`${LOG_PREFIX} Error in checkAuth:`, error);
    if (error instanceof jwt.JsonWebTokenError) {
      console.log(`${LOG_PREFIX} JWT Error:`, error.message);
      res.status(401).json({ isAuthenticated: false, message: `Invalid token: ${error.message}` });
    } else if (error instanceof jwt.TokenExpiredError) {
      console.log(`${LOG_PREFIX} Token expired`);
      res.status(401).json({ isAuthenticated: false, message: 'Token expired' });
    } else {
      res.status(401).json({ isAuthenticated: false, message: 'Invalid token' });
    }
  }
};

export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  console.log(`${LOG_PREFIX} [verifyToken] Function called`);
  console.log(`${LOG_PREFIX} [verifyToken] Request body:`, req.body);

  const { token } = req.body;
  const existingToken = req.cookies.accessToken || req.header('Authorization')?.replace('Bearer ', '');
  
  console.log(`${LOG_PREFIX} [verifyToken] Received token:`, token ? 'Present' : 'Not found');
  console.log(`${LOG_PREFIX} [verifyToken] Existing token:`, existingToken ? 'Present' : 'Not found');
  
  if (!token) {
    console.log(`${LOG_PREFIX} [verifyToken] No token provided in request body`);
    res.status(400).json({ isValid: false, error: "Token is required in request body" });
    return;
  }

  try {
    console.log(`${LOG_PREFIX} [verifyToken] Attempting to verify received token`);
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    console.log(`${LOG_PREFIX} [verifyToken] Received token verified successfully. Decoded payload:`, decoded);
    
    const currentTimestamp = Math.floor(Date.now() / 1000);
    console.log(`${LOG_PREFIX} [verifyToken] Current timestamp:`, currentTimestamp);
    console.log(`${LOG_PREFIX} [verifyToken] Received token expiration:`, decoded.exp);

    if (decoded.exp && decoded.exp < currentTimestamp) {
      console.log(`${LOG_PREFIX} [verifyToken] Received token has expired`);
      res.status(401).json({ isValid: false, error: "Received token has expired" });
      return;
    }

    if (existingToken) {
      try {
        const existingDecoded = jwt.verify(existingToken, JWT_SECRET) as jwt.JwtPayload;
        console.log(`${LOG_PREFIX} [verifyToken] Existing token verified successfully. Decoded payload:`, existingDecoded);
        console.log(`${LOG_PREFIX} [verifyToken] Existing token expiration:`, existingDecoded.exp);
        
        if (existingDecoded.exp && existingDecoded.exp < currentTimestamp) {
          console.log(`${LOG_PREFIX} [verifyToken] Existing token has expired`);
        } else {
          console.log(`${LOG_PREFIX} [verifyToken] Existing token is valid and not expired`);
        }
      } catch (existingTokenError) {
        console.error(`${LOG_PREFIX} [verifyToken] Error verifying existing token:`, existingTokenError);
      }
    } else {
      console.log(`${LOG_PREFIX} [verifyToken] No existing token found`);
    }

    console.log(`${LOG_PREFIX} [verifyToken] Received token is valid and not expired`);
    res.json({ 
      isValid: true, 
      userId: decoded.userId,
      receivedToken: {
        valid: true,
        expired: false
      },
      existingToken: existingToken ? {
        valid: true,
        expired: false
      } : null
    });
  } catch (error) {
    console.error(`${LOG_PREFIX} [verifyToken] Error during token verification:`, error);

    if (error instanceof jwt.JsonWebTokenError) {
      console.log(`${LOG_PREFIX} [verifyToken] Invalid token error`);
      res.status(401).json({ isValid: false, error: "Invalid token" });
    } else if (error instanceof jwt.TokenExpiredError) {
      console.log(`${LOG_PREFIX} [verifyToken] Token expired error`);
      res.status(401).json({ isValid: false, error: "Token has expired" });
    } else {
      console.log(`${LOG_PREFIX} [verifyToken] Unexpected error during verification`);
      res.status(500).json({ isValid: false, error: "An error occurred while verifying the token" });
    }
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  console.log(`${LOG_PREFIX} Refreshing token`);
  const token = req.cookies.accessToken || req.body.token || req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.log(`${LOG_PREFIX} No token provided for refresh`);
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    console.log(`${LOG_PREFIX} Old token verified successfully`);
    const newToken = createToken(decoded.userId);
    res.cookie('accessToken', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    res.json({ success: true, token: newToken });
    console.log(`${LOG_PREFIX} Token refreshed successfully for user: ${decoded.userId}`);
  } catch (error) {
    console.error(`${LOG_PREFIX} Error refreshing token:`, error);
    res.status(401).json({ success: false, message: 'Invalid token', error: (error as Error).message });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  console.log(`${LOG_PREFIX} Getting current user`);
  let token = req.cookies.accessToken;
  if (!token) {
    token = req.header('Authorization')?.replace('Bearer ', '');
  }
  if (!token) {
    console.log(`${LOG_PREFIX} No token provided for getting current user`);
    res.status(200).json({ success: false, user: null, message: 'NO_TOKEN' });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    console.log(`${LOG_PREFIX} Token verification successful for current user`);
    const user = await User.findById(decoded.userId);
    console.log(`${LOG_PREFIX} User retrieved:`, user ? `ID: ${user._id}` : 'Not found');
    
    if (!user) {
      console.log(`${LOG_PREFIX} User not found in database`);
      res.clearCookie('accessToken');
      res.status(200).json({ success: false, user: null, message: 'USER_NOT_FOUND' });
      return;
    }
    
    res.status(200).json({ 
      success: true, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    console.log(`${LOG_PREFIX} Current user data sent successfully`);
  } catch (error) {
    console.error(`${LOG_PREFIX} Error during token verification for current user:`, error);
    res.clearCookie('accessToken');
    res.status(200).json({ success: true, user: null, message: 'INVALID_TOKEN' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  console.log(`${LOG_PREFIX} Initiating forgot password process`);
  const { email } = req.body;
  console.log(`email`, email);
  try {
    const user = await User.findOne({ email }) as UserDocument | null;

    if (!user) {
      console.log(`${LOG_PREFIX} User not found for email: ${email}`);
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (user.isLocked && user.lockUntil && user.lockUntil > new Date()) {
      console.log(`${LOG_PREFIX} Account is locked for user: ${user._id}`);
      res.status(403).json({ success: false, message: 'Account is locked. Please contact support.' });
      return;
    }

    if (user.passwordResetAttempts >= 3) {
      user.isLocked = true;
      user.lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // Lock for 24 hours
      await user.save();
      console.log(`${LOG_PREFIX} Account locked due to multiple reset attempts: ${user._id}`);
      res.status(403).json({ success: false, message: 'Too many reset attempts. Account locked for 24 hours.' });
      return;
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
    user.passwordResetAttempts += 1;
    await user.save();

    const attemptsLeft = 3 - user.passwordResetAttempts;
    const success = await sendPasswordResetEmail(user.email, resetToken, attemptsLeft);

    if (success) {
      res.status(200).json({ success: true, message: 'Password reset email sent' });
      console.log(`${LOG_PREFIX} Password reset email sent to: ${user.email}`);
    } else {
      res.status(500).json({ success: false, message: 'Failed to send password reset email' });
      console.error(`${LOG_PREFIX} Failed to send password reset email to: ${user.email}`);
    }
  } catch (error) {
    console.error(`${LOG_PREFIX} Error in forgot password process:`, error);
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  console.log(`${LOG_PREFIX} Resetting password`);
  const { token, newPassword } = req.body;
  console.log(`newPassword`, newPassword);
  console.log(`token`, token);
  try {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    }) as UserDocument | null;

    if (!user) {
      console.log(`${LOG_PREFIX} Invalid or expired password reset token`);
      res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
      return;
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetAttempts = 0;
    user.isLocked = false;
    user.lockUntil = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password has been reset' });
    console.log(`${LOG_PREFIX} Password reset successful for user: ${user._id}`);
  } catch (error) {
    console.error(`${LOG_PREFIX} Error resetting password:`, error);
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
};
const sendEmailVerification = async (to: string, verificationToken: string, verificationCode: string, name: string): Promise<boolean> => {
  console.log(`${LOG_PREFIX} Sending email verification to:`, to);
  // בפונקציה sendEmailVerification ב-emailController.ts
console.log(`Sending email with token: ${verificationToken} and code: ${verificationCode}`);
  try {
    const success = await sendEmailVerificationInternal({
      to,
      verificationToken,
      verificationCode,
      name
    });
    
    console.log(`${LOG_PREFIX} Email verification sent successfully`);
    return success;
  } catch (error) {
    console.error(`${LOG_PREFIX} Error sending email verification:`, error);
    return false;
  }
};

export default {
  csrfTokenHandler,
  registerUser,
  loginUser,
  logoutUser,
  checkAuth,
  verifyToken,
  refreshToken,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail
};