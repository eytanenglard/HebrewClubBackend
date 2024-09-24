import { Request, Response } from 'express';
import {
  sendWelcomeEmail as sendWelcomeEmailController,
  sendPasswordResetEmail,
  sendCoursePurchaseConfirmation,
  sendEmailVerification,
  sendAccountRecoveryInstructions,
  sendLessonReminder,
  sendLessonCancellationNotice,
  sendPaymentConfirmation,
  sendContactFormSubmission,
  sendWelcomeEmailWithCourseDetails,
  sendCourseWelcomeEmail as sendCourseWelcomeEmailController
} from '../controllers/emailController';

export const sendWelcomeEmail = async (to: string, name: string, temporaryPassword: string): Promise<boolean> => {
  try {
    const req = { body: { to, name, temporaryPassword } } as Request;
    const res = {
      json: (data: { success: boolean }) => data.success,
    } as unknown as Response;

    await sendWelcomeEmailController(req, res);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

export const sendCourseWelcomeEmail = async (to: string, userName: string, courseName: string): Promise<boolean> => {
  try {
    const req = { body: { to, userName, courseName } } as Request;
    const res = {
      json: (data: { success: boolean }) => data.success,
    } as unknown as Response;

    await sendCourseWelcomeEmailController(req, res);
    return true;
  } catch (error) {
    console.error('Error sending course welcome email:', error);
    return false;
  }
};

export const sendPasswordResetEmailService = async (to: string, resetToken: string, attemptsLeft: number): Promise<boolean> => {
  try {
    return await sendPasswordResetEmail(to, resetToken, attemptsLeft);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

export const sendCoursePurchaseConfirmationEmail = async (to: string, courseName: string, amount: number): Promise<boolean> => {
  try {
    const req = { body: { to, courseName, amount } } as Request;
    const res = {
      json: (data: { success: boolean }) => data.success,
    } as unknown as Response;

    await sendCoursePurchaseConfirmation(req, res);
    return true;
  } catch (error) {
    console.error('Error sending course purchase confirmation email:', error);
    return false;
  }
};

export const sendEmailVerificationService = async (to: string, verificationToken: string, verificationCode: string, name: string): Promise<boolean> => {
  try {
    const req = { body: { to, verificationToken, verificationCode, name } } as Request;
    const res = {
      json: (data: { success: boolean }) => data.success,
    } as unknown as Response;

    return await sendEmailVerification(req, res);
  } catch (error) {
    console.error('Error sending email verification:', error);
    return false;
  }
};

export const sendAccountRecoveryInstructionsEmail = async (to: string, recoveryLink: string): Promise<boolean> => {
  try {
    const req = { body: { to, recoveryLink } } as Request;
    const res = {
      json: (data: { success: boolean }) => data.success,
    } as unknown as Response;

    await sendAccountRecoveryInstructions(req, res);
    return true;
  } catch (error) {
    console.error('Error sending account recovery instructions email:', error);
    return false;
  }
};

export const sendLessonReminderEmail = async (to: string, studentName: string, teacherName: string, date: string, time: string): Promise<boolean> => {
  try {
    const req = { body: { to, studentName, teacherName, date, time } } as Request;
    const res = {
      json: (data: { success: boolean }) => data.success,
    } as unknown as Response;

    await sendLessonReminder(req, res);
    return true;
  } catch (error) {
    console.error('Error sending lesson reminder email:', error);
    return false;
  }
};

export const sendLessonCancellationNoticeEmail = async (to: string, studentName: string, date: string, time: string): Promise<boolean> => {
  try {
    const req = { body: { to, studentName, date, time } } as Request;
    const res = {
      json: (data: { success: boolean }) => data.success,
    } as unknown as Response;

    await sendLessonCancellationNotice(req, res);
    return true;
  } catch (error) {
    console.error('Error sending lesson cancellation notice email:', error);
    return false;
  }
};

export const sendPaymentConfirmationEmail = async (to: string, customerName: string, amount: number, date: string): Promise<boolean> => {
  try {
    const req = { body: { to, customerName, amount, date } } as Request;
    const res = {
      json: (data: { success: boolean }) => data.success,
    } as unknown as Response;

    await sendPaymentConfirmation(req, res);
    return true;
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    return false;
  }
};

export const sendContactFormSubmissionEmail = async (name: string, email: string, message: string): Promise<boolean> => {
  try {
    const req = { body: { name, email, message } } as Request;
    const res = {
      json: (data: { success: boolean }) => data.success,
      status: () => ({ json: () => {} }),
    } as unknown as Response;

    await sendContactFormSubmission(req, res);
    return true;
  } catch (error) {
    console.error('Error sending contact form submission email:', error);
    return false;
  }
};

export const sendWelcomeEmailWithCourseDetailsService = async (to: string, name: string, email: string, temporaryPassword: string, courseName: string, courseStartDate: string): Promise<boolean> => {
  try {
    const req = { body: { to, name, email, temporaryPassword, courseName, courseStartDate } } as Request;
    const res = {
      json: (data: { success: boolean }) => data.success,
    } as unknown as Response;

    await sendWelcomeEmailWithCourseDetails(req, res);
    return true;
  } catch (error) {
    console.error('Error sending welcome email with course details:', error);
    return false;
  }
};