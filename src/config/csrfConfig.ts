import { Request, Response, NextFunction } from 'express';
import { validateCsrfToken, ensureCsrfToken, getCsrfToken } from '../csrfProtection.js';

// רשימת נתיבים שפטורים מהגנת CSRF
const exemptPaths = [ '/auth/csrf-token',
  '/auth/verify-token',
  '/auth/refresh-token',
  '/api/email/csrf-token',
  '/api/email/welcome',
  '/api/email/password-reset',
  '/api/email/course-purchase',
  '/api/email/verify',
  '/auth/verify-email',
  '/auth/resend-verification',
  '/api/email/account-recovery',
  '/api/email/lesson-reminder',
  '/api/email/lesson-cancellation',
  '/api/email/payment-confirmation',
  '/api/email/contact-form',
  '/api/email/welcome-with-course',
  '/auth/forgot-password',
  '/api/leads',
'/auth/logout',];

const csrfConfig = {
  // Middleware להחלת הגנת CSRF
  protect: (req: Request, res: Response, next: NextFunction) => {
    // דילוג על בדיקת CSRF עבור נתיבים פטורים או בקשות GET
    if (exemptPaths.includes(req.path) || req.method === 'GET') {
      return next();
    }
    validateCsrfToken(req, res, next);
  },

  // Middleware להבטחת קיום טוקן CSRF
  ensure: ensureCsrfToken,

  // פונקציה לקבלת טוקן CSRF (לשימוש בנתיבים)
  getToken: getCsrfToken,

  // פונקציה להוספת נתיב פטור מ-CSRF
  addExemptPath: (path: string) => {
    if (!exemptPaths.includes(path)) {
      exemptPaths.push(path);
    }
  },

  // פונקציה להסרת נתיב פטור מ-CSRF
  removeExemptPath: (path: string) => {
    const index = exemptPaths.indexOf(path);
    if (index > -1) {
      exemptPaths.splice(index, 1);
    }
  }
};

export default csrfConfig;