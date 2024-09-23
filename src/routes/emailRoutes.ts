import express from 'express';
import * as emailController from '../controllers/emailController';
import { 
    csrfTokenHandler, 
  } from '../controllers/authController';
const router = express.Router();

router.post('/welcome', emailController.sendWelcomeEmail);
router.post('/password-reset', emailController.sendPasswordResetEmail);
router.post('/course-purchase', emailController.sendCoursePurchaseConfirmation);
router.post('/verify', emailController.sendEmailVerification);
router.post('/account-recovery', emailController.sendAccountRecoveryInstructions);
router.post('/lesson-reminder', emailController.sendLessonReminder);
router.post('/lesson-cancellation', emailController.sendLessonCancellationNotice);
router.post('/payment-confirmation', emailController.sendPaymentConfirmation);
router.post('/contact-form', emailController.sendContactFormSubmission);

// Add this new route
router.post('/welcome-with-course', emailController.sendWelcomeEmailWithCourseDetails);
router.get('/csrf-token', csrfTokenHandler);
export default router;