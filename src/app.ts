import 'express-async-errors';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
/* import { validateCsrfToken, getCsrfToken } from './csrfProtection.js'; */
// General Routes
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import personalAreaRoutes from './routes/personalAreaRoutes.js';
import courseEnrollmentRoutes from './routes/courseEnrollmentRoutes.js'; // New import


// Middleware
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './middleware/logger.js';
import corsOptions from './config/corsConfig.js';
import crypto from 'crypto';
import emailRoutes from './routes/emailRoutes.js';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_SECRET_HASH = crypto.createHash('sha256').update(JWT_SECRET).digest('hex');

console.log('JWT_SECRET Hash:', JWT_SECRET_HASH);

dotenv.config();

const app = express();

// Updated CORS options
const updatedCorsOptions = {
  ...corsOptions,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-React-DevTools'],
};

app.use(cors(updatedCorsOptions));

// Middleware
app.use(cors(updatedCorsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(logger);

// Define paths that should bypass CSRF
/* const csrfBypassPaths = [
  '/auth/csrf-token',
  '/auth/verify-token',
  '/auth/refresh-token',
  '/api/email/csrf-token',
  '/api/email/welcome',
  '/api/email/password-reset',
  '/api/email/course-purchase',
  '/api/email/verify',
  '/api/email/account-recovery',
  '/api/email/lesson-reminder',
  '/api/email/lesson-cancellation',
  '/api/email/payment-confirmation',
  '/api/email/contact-form',
  '/api/email/welcome-with-course',
  '/auth/forgot-password',
];
 */
// Custom middleware to apply CSRF selectively
/* const selectiveCsrf = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log('Selective CSRF check for path:', req.path);
  if (csrfBypassPaths.includes(req.path) || req.path.startsWith('/admin')) {
    console.log('CSRF bypassed for path:', req.path);
    return next();
  }
  console.log('Applying CSRF check for path:', req.path);
  return validateCsrfToken(req, res, next);
}; */
// Define rate limits for specific routes
const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 20000, // 20000 requests per hour
  message: 'Too many requests from this IP, please try again later.'
});

// Apply rate limiting to specific routes
/* app.use('/auth/csrf-token', authRateLimiter); */
app.use('/auth/verify-token', authRateLimiter);
app.use('/auth/refresh-token', authRateLimiter);

// General rate limiter for other routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per 15 minutes
});
app.use(generalLimiter);

// CSRF Token route (must be defined before other routes)
/* app.get('/auth/csrf-token', getCsrfToken); */

// Apply selective CSRF protection
/* app.use(selectiveCsrf); */

// General Routes
app.use('/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/personal-area', personalAreaRoutes);
app.use('/api/course-enrollments', courseEnrollmentRoutes); // New route
app.use('/api/email', emailRoutes);

// Admin Routes with adminAuthCheck middleware


mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


export default app;