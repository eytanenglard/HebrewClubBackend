import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const config = {
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    fromName: process.env.EMAIL_FROM_NAME,
    fromAddress: process.env.EMAIL_FROM_ADDRESS
  },
  website: {
    url: process.env.CLIENT_URL
  }
};

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

const sendEmail = async (options: nodemailer.SendMailOptions): Promise<boolean> => {
  try {
    console.log('Environment variables loaded:');

    await transporter.sendMail({
      from: `"${config.email.fromName}" <${config.email.fromAddress}>`,
      ...options,
    });
    console.log(`Email sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendWelcomeEmail = async (req: Request, res: Response): Promise<void> => {
 
  const { to, name, temporaryPassword } = req.body;
  const subject = 'Welcome to Our Platform!';
  const html = `
    <h1>Welcome, ${name}!</h1>
    <p>Thank you for joining our platform. Here are your account details:</p>
    <p>Email: ${to}</p>
    <p>Temporary Password: ${temporaryPassword}</p>
    <p>Please log in and change your password as soon as possible.</p>
    <a href="${config.website.url}/login">Click here to log in</a>
  `;
  const success = await sendEmail({ to, subject, html });
  res.json({ success });
};


export const sendPasswordResetEmail = async (to: string, resetToken: string, attemptsLeft: number): Promise<boolean> => {
  console.log('CLIENT_URLL--:', config.website.url);
  console.log('resetToken---:', resetToken);
  const subject = 'Password Reset Request';
  const resetLink = `${config.website.url}/reset-password?token=${resetToken}`;
  const html = `
    <h1>Password Reset Request</h1>
    <p>You have requested to reset your password. Click the link below to set a new password:</p>
    <a href="${resetLink}">Reset Password</a>
    <p>You have ${attemptsLeft} attempt(s) left before your account is locked.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;
  return await sendEmail({ to, subject, html });
};
export const sendCoursePurchaseConfirmation = async (req: Request, res: Response): Promise<void> => {
  const { to, courseName, amount } = req.body;
  const subject = 'Course Purchase Confirmation';
  const html = `
    <h1>Thank You for Your Purchase!</h1>
    <p>Your enrollment in "${courseName}" has been confirmed.</p>
    <p>Amount paid: $${amount.toFixed(2)}</p>
    <p>You can access your course materials by logging into your account.</p>
    <a href="${config.website.url}/dashboard">Go to Your Dashboard</a>
  `;
  const success = await sendEmail({ to, subject, html });
  res.json({ success });
};


export const sendEmailVerification = async (req: Request, res: Response): Promise<void> => {
  const success = await sendEmailVerificationInternal(req.body);
  res.json({ success });
};

export const sendEmailVerificationInternal = async (
  { to, verificationToken, verificationCode, name }: 
  { to: string, verificationToken: string, verificationCode: string, name: string }
): Promise<boolean> => {
  console.log('to', to);
  const subject = 'Welcome to Hebrew Club - Verify Your Email Address';
  const verificationLink = `${config.website.url}/verify-email?token=${verificationToken}`;
  const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          h1 { color: #3498db; }
          .button { display: inline-block; padding: 10px 20px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to Hebrew Club, ${name}!</h1>
          <p>We're thrilled to have you join our community of Hebrew language enthusiasts. Your journey to mastering Hebrew starts here!</p>
          <p>To get started, please verify your email address by clicking the button below:</p>
          <p><a href="${verificationLink}" class="button">Verify Email Address</a></p>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p>${verificationLink}</p>
          <p>Alternatively, you can use this verification code: <strong>${verificationCode}</strong></p>
          <p>At Hebrew Club, we're committed to helping you achieve your language learning goals. Whether you're a beginner or looking to refine your skills, we have resources and courses tailored to your needs.</p>
          <p>Here's what you can look forward to:</p>
          <ul>
            <li>Interactive lessons designed by language experts</li>
            <li>A supportive community of fellow learners</li>
            <li>Cultural insights to enhance your understanding of Hebrew</li>
            <li>Regular progress tracking to keep you motivated</li>
          </ul>
          <p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
          <p>We're excited to be part of your Hebrew learning journey!</p>
          <p>Best regards,<br>The Hebrew Club Team</p>
        </div>
      </body>
    </html>
  `;
  return await sendEmail({ to, subject, html });
};

export const sendAccountRecoveryInstructions = async (req: Request, res: Response): Promise<void> => {
  const { to, recoveryLink } = req.body;
  const subject = 'Account Recovery Instructions';
  const html = `
    <h1>Account Recovery</h1>
    <p>We received a request to recover your account. Click the link below to proceed:</p>
    <a href="${recoveryLink}">Recover Your Account</a>
    <p>If you didn't request this, please ignore this email.</p>
  `;
  const success = await sendEmail({ to, subject, html });
  res.json({ success });
};

export const sendLessonReminder = async (req: Request, res: Response): Promise<void> => {
  const { to, studentName, teacherName, date, time } = req.body;
  const subject = 'Lesson Reminder';
  const html = `
    <h1>Lesson Reminder</h1>
    <p>Hello ${studentName},</p>
    <p>This is a reminder for your upcoming lesson:</p>
    <p>Date: ${date}</p>
    <p>Time: ${time}</p>
    <p>Teacher: ${teacherName}</p>
    <p>We look forward to seeing you!</p>
  `;
  const success = await sendEmail({ to, subject, html });
  res.json({ success });
};

export const sendLessonCancellationNotice = async (req: Request, res: Response): Promise<void> => {
  const { to, studentName, date, time } = req.body;
  const subject = 'Lesson Cancellation Notice';
  const html = `
    <h1>Lesson Cancellation</h1>
    <p>Hello ${studentName},</p>
    <p>We regret to inform you that your lesson scheduled for:</p>
    <p>Date: ${date}</p>
    <p>Time: ${time}</p>
    <p>has been cancelled. Please contact us if you have any questions.</p>
  `;
  const success = await sendEmail({ to, subject, html });
  res.json({ success });
};

export const sendPaymentConfirmation = async (req: Request, res: Response): Promise<void> => {
  const { to, customerName, amount, date } = req.body;
  const subject = 'Payment Confirmation';
  const html = `
    <h1>Payment Confirmation</h1>
    <p>Hello ${customerName},</p>
    <p>We have received your payment of ₪${amount.toFixed(2)} on ${date}.</p>
    <p>Thank you for your business!</p>
  `;
  const success = await sendEmail({ to, subject, html });
  res.json({ success });
};

export const sendContactFormSubmission = async (req: Request, res: Response): Promise<void> => {
    const { name, email, message } = req.body;
    
    // Basic validation
    if (!name || !email || !message) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ success: false, message: 'Invalid email format' });
      return;
    }
  
    const to = config.email.fromAddress;
    const subject = 'New Contact Form Submission';
    const html = `
      <h1>New Contact Form Submission</h1>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;
    const success = await sendEmail({ to, subject, html });
    
    if (success) {
      // Send confirmation email to the user
      const userConfirmationHtml = `
        <h1>We've Received Your Message</h1>
        <p>Dear ${name},</p>
        <p>Thank you for contacting us. We've received your message and will get back to you soon.</p>
      `;
      await sendEmail({ to: email, subject: 'Thank You for Contacting Us', html: userConfirmationHtml });
    }
    
    res.json({ success });
  };
  export const sendWelcomeEmailWithCourseDetails = async (req: Request, res: Response): Promise<void> => {
    const { to, name, email, temporaryPassword, courseName, courseStartDate } = req.body;
    const subject = 'Welcome to Our Platform - Course Registration Confirmation';
    const html = `
      <h1>Welcome, ${name}!</h1>
      <p>Thank you for registering for our course. Here are your account details:</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
      <p>Please log in and change your password as soon as possible.</p>
      <h2>Course Details</h2>
      <p><strong>Course Name:</strong> ${courseName}</p>
      <p><strong>Start Date:</strong> ${courseStartDate}</p>
      <p>We're excited to have you join us! You can access your course materials by logging into your account.</p>
      <a href="${config.website.url}/">Click here to log in</a>
    `;
    const success = await sendEmail({ to, subject, html });
    res.json({ success });
  
  }

  
export const sendCourseWelcomeEmail = async (req: Request, res: Response): Promise<void> => {
  const { to, userName, courseName } = req.body;
  const subject = `Welcome to ${courseName}!`;
  const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          h1 { color: #3498db; }
          .button { display: inline-block; padding: 10px 20px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to ${courseName}, ${userName}!</h1>
          <p>Congratulations on taking this exciting step in your learning journey! We're thrilled to have you join our ${courseName} course.</p>
          <p>Here's what you can look forward to:</p>
          <ul>
            <li>Expert-led lessons tailored to your level</li>
            <li>Interactive exercises to reinforce your learning</li>
            <li>A supportive community of fellow learners</li>
            <li>Regular progress tracking to keep you motivated</li>
          </ul>
          <p>Your course materials are now available in your account. To get started:</p>
          <p><a href="${config.website.url}/dashboard" class="button">Access Your Course</a></p>
          <p>If you have any questions or need assistance, our support team is always here to help.</p>
          <p>We're excited to be part of your learning adventure!</p>
          <p>Best regards,<br>The ${courseName} Team</p>
        </div>
      </body>
    </html>
  `;
  const success = await sendEmail({ to, subject, html });
  res.json({ success });
};
