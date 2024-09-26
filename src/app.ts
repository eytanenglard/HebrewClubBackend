import 'express-async-errors';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

// כללי Routes
import authRoutes from './routes/authRoutes';
import leadRoutes from './routes/leadRoutes';
import personalAreaRoutes from './routes/personalAreaRoutes';
import courseEnrollmentRoutes from './routes/courseEnrollmentRoutes';
import emailRoutes from './routes/emailRoutes';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { logger } from './middleware/logger';
import corsOptions from './config/corsConfig';
import csrfConfig from './config/csrfConfig';
import { closeRedisConnection } from './csrfProtection';

dotenv.config();

// בדיקת קיום משתני סביבה הכרחיים
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET || !process.env.REDIS_URL) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_SECRET_HASH = crypto.createHash('sha256').update(JWT_SECRET).digest('hex');

console.log('JWT_SECRET Hash:', JWT_SECRET_HASH);

const app = express();

// הגדרת trust proxy
app.set('trust proxy', 1);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(logger);

// הגדרת Rate Limiting
const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // חלון של שעה
  max: 20000, // 20000 בקשות לשעה
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.'
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 דקות
  max: 100, // 100 בקשות ל-15 דקות
  standardHeaders: true,
  legacyHeaders: false
});

// החלת Rate Limiting על נתיבים ספציפיים
app.use('/auth/csrf-token', authRateLimiter);
app.use('/auth/verify-token', authRateLimiter);
app.use('/auth/refresh-token', authRateLimiter);
app.use(generalLimiter);

// טיפול בבקשות favicon.ico
app.get('/favicon.ico', (_req, res) => {
  res.status(204).end(); // No content
});

// נתיב לקבלת טוקן CSRF
app.get('/auth/csrf-token', csrfConfig.getToken);

// החלת הגנת CSRF
app.use(csrfConfig.protect);
app.use(csrfConfig.ensure);

// הגדרת נתיבים
app.use('/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/personal-area', personalAreaRoutes);
app.use('/api/course-enrollments', courseEnrollmentRoutes);
app.use('/api/email', emailRoutes);

// התחברות ל-MongoDB
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// טיפול ב-404
app.use(function(req, res, _next) {
  res.status(404);
  if (req.accepts('html')) {
    res.send('404: Page not found');
    return;
  }
  if (req.accepts('json')) {
    res.json({ error: 'Not found' });
    return;
  }
  res.type('txt').send('Not found');
});

// טיפול בשגיאות
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'An internal server error occurred',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// טיפול סופי בשגיאות
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// כיבוי חלק
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await closeRedisConnection();
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

export default app;