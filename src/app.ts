import 'express-async-errors';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

// General Routes
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import personalAreaRoutes from './routes/personalAreaRoutes.js';
import courseEnrollmentRoutes from './routes/courseEnrollmentRoutes.js';
import emailRoutes from './routes/emailRoutes.js';

// Middleware
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './middleware/logger.js';
import corsOptions from './config/corsConfig.js';

dotenv.config();

// Check for required environment variables
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_SECRET_HASH = crypto.createHash('sha256').update(JWT_SECRET).digest('hex');

console.log('JWT_SECRET Hash:', JWT_SECRET_HASH);

const app = express();

// Set trust proxy
app.set('trust proxy', 1);

// Updated CORS options
const updatedCorsOptions = {
  ...corsOptions,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-React-DevTools'],
};

// Middleware
app.use(cors(updatedCorsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(logger);

// Define rate limits for specific routes
const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 20000, // 20000 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.'
});

// General rate limiter for other routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to specific routes
app.use('/auth/verify-token', authRateLimiter);
app.use('/auth/refresh-token', authRateLimiter);
app.use(generalLimiter);

// General Routes
app.use('/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/personal-area', personalAreaRoutes);
app.use('/api/course-enrollments', courseEnrollmentRoutes);
app.use('/api/email', emailRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An internal server error occurred',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Final error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;