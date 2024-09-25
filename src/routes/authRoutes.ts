import express from 'express';
import { body, ValidationChain } from 'express-validator';
import { 
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
  verifyEmail, // Add this new import
  resendVerificationEmail // Add this new import
} from '../controllers/authController.js';

const router = express.Router();

// Middleware for input validation
const validateRegistration: ValidationChain[] = [
  body('name').notEmpty().withMessage('שם הוא שדה חובה'),
  body('email').isEmail().withMessage('כתובת אימייל לא חוקית'),
  body('password').isLength({ min: 6 }).withMessage('הסיסמה חייבת להכיל לפחות 6 תווים'),
  body('username').notEmpty().withMessage('שם משתמש הוא שדה חובה')
];

const validateLogin: ValidationChain[] = [
  body('username').notEmpty().withMessage('שם משתמש או אימייל הוא שדה חובה'),
  body('password').notEmpty().withMessage('סיסמה היא שדה חובה')
];

const validateForgotPassword: ValidationChain[] = [
  body('email').isEmail().withMessage('כתובת אימייל לא חוקית')
];

const validateResetPassword: ValidationChain[] = [
  body('token').notEmpty().withMessage('טוקן איפוס הוא שדה חובה'),
  body('newPassword').isLength({ min: 6 }).withMessage('הסיסמה החדשה חייבת להכיל לפחות 6 תווים')
];

// Routes
router.get('/csrf-token', csrfTokenHandler);
router.get('/checkAuth', checkAuth);
router.post('/register', validateRegistration, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/logout', logoutUser);
router.post('/verify-token', verifyToken);
router.post('/refresh-token', refreshToken);
router.get('/current-user', getCurrentUser);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

export default router;