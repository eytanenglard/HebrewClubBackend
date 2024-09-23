import express from 'express';
import * as emailController from '../controllers/emailController';
import { 
    csrfTokenHandler, 
  } from '../controllers/authController';
const router = express.Router();

router.post('/welcome', emailController.sendWelcomeEmail);
router.post('/password-reset', (req, res) => {
  const { to, resetToken, attemptsLeft } = req.body;
  emailController.sendPasswordResetEmail(to, resetToken, attemptsLeft)
    .then(success => res.json({ success }))
    .catch(error => res.status(500).json({ success: false, error: error.message }));
});
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