import { sendWelcomeEmail as sendWelcomeEmailController, sendPasswordResetEmail, sendCoursePurchaseConfirmation, sendEmailVerification, sendAccountRecoveryInstructions, sendLessonReminder, sendLessonCancellationNotice, sendPaymentConfirmation, sendContactFormSubmission, sendWelcomeEmailWithCourseDetails, sendCourseWelcomeEmail as sendCourseWelcomeEmailController } from '../controllers/emailController.js';
export const sendWelcomeEmail = async (to, name, temporaryPassword) => {
    try {
        const req = { body: { to, name, temporaryPassword } };
        const res = {
            json: (data) => data.success,
        };
        await sendWelcomeEmailController(req, res);
        return true;
    }
    catch (error) {
        console.error('Error sending welcome email:', error);
        return false;
    }
};
export const sendCourseWelcomeEmail = async (to, userName, courseName) => {
    try {
        const req = { body: { to, userName, courseName } };
        const res = {
            json: (data) => data.success,
        };
        await sendCourseWelcomeEmailController(req, res);
        return true;
    }
    catch (error) {
        console.error('Error sending course welcome email:', error);
        return false;
    }
};
export const sendPasswordResetEmailService = async (to, resetToken, attemptsLeft) => {
    try {
        return await sendPasswordResetEmail(to, resetToken, attemptsLeft);
    }
    catch (error) {
        console.error('Error sending password reset email:', error);
        return false;
    }
};
export const sendCoursePurchaseConfirmationEmail = async (to, courseName, amount) => {
    try {
        const req = { body: { to, courseName, amount } };
        const res = {
            json: (data) => data.success,
        };
        await sendCoursePurchaseConfirmation(req, res);
        return true;
    }
    catch (error) {
        console.error('Error sending course purchase confirmation email:', error);
        return false;
    }
};
export const sendEmailVerificationService = async (to, verificationToken, verificationCode, name) => {
    try {
        const req = { body: { to, verificationToken, verificationCode, name } };
        const res = {
            json: (data) => data.success,
        };
        await sendEmailVerification(req, res);
        return true; // אם הגענו לכאן, סימן שהפעולה הצליחה
    }
    catch (error) {
        console.error('Error sending email verification:', error);
        return false;
    }
};
export const sendAccountRecoveryInstructionsEmail = async (to, recoveryLink) => {
    try {
        const req = { body: { to, recoveryLink } };
        const res = {
            json: (data) => data.success,
        };
        await sendAccountRecoveryInstructions(req, res);
        return true;
    }
    catch (error) {
        console.error('Error sending account recovery instructions email:', error);
        return false;
    }
};
export const sendLessonReminderEmail = async (to, studentName, teacherName, date, time) => {
    try {
        const req = { body: { to, studentName, teacherName, date, time } };
        const res = {
            json: (data) => data.success,
        };
        await sendLessonReminder(req, res);
        return true;
    }
    catch (error) {
        console.error('Error sending lesson reminder email:', error);
        return false;
    }
};
export const sendLessonCancellationNoticeEmail = async (to, studentName, date, time) => {
    try {
        const req = { body: { to, studentName, date, time } };
        const res = {
            json: (data) => data.success,
        };
        await sendLessonCancellationNotice(req, res);
        return true;
    }
    catch (error) {
        console.error('Error sending lesson cancellation notice email:', error);
        return false;
    }
};
export const sendPaymentConfirmationEmail = async (to, customerName, amount, date) => {
    try {
        const req = { body: { to, customerName, amount, date } };
        const res = {
            json: (data) => data.success,
        };
        await sendPaymentConfirmation(req, res);
        return true;
    }
    catch (error) {
        console.error('Error sending payment confirmation email:', error);
        return false;
    }
};
export const sendContactFormSubmissionEmail = async (name, email, message) => {
    try {
        const req = { body: { name, email, message } };
        const res = {
            json: (data) => data.success,
            status: () => ({ json: () => { } }),
        };
        await sendContactFormSubmission(req, res);
        return true;
    }
    catch (error) {
        console.error('Error sending contact form submission email:', error);
        return false;
    }
};
export const sendWelcomeEmailWithCourseDetailsService = async (to, name, email, temporaryPassword, courseName, courseStartDate) => {
    try {
        const req = { body: { to, name, email, temporaryPassword, courseName, courseStartDate } };
        const res = {
            json: (data) => data.success,
        };
        await sendWelcomeEmailWithCourseDetails(req, res);
        return true;
    }
    catch (error) {
        console.error('Error sending welcome email with course details:', error);
        return false;
    }
};
