// src/validations.ts
import { body } from 'express-validator';
export const validateLogin = [
    body('username')
        .notEmpty()
        .withMessage('שם משתמש או אימייל נדרש')
        .isLength({ max: 100 })
        .withMessage('שם משתמש או אימייל חייב להיות עד 100 תווים'),
    body('password')
        .notEmpty()
        .withMessage('סיסמה נדרשת')
        .isLength({ min: 8, max: 100 })
        .withMessage('הסיסמה חייבת להיות בין 8 ל-100 תווים')
        .trim(),
];
export const validateRegistration = [
    body('name')
        .notEmpty().withMessage('שם נדרש')
        .isLength({ min: 2, max: 50 }).withMessage('השם חייב להיות בין 2 ל-50 תווים')
        .trim().escape(),
    body('username')
        .notEmpty().withMessage('שם משתמש נדרש')
        .isLength({ min: 3, max: 20 }).withMessage('שם המשתמש חייב להיות בין 3 ל-20 תווים')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('שם המשתמש יכול להכיל רק אותיות, מספרים וקו תחתון')
        .trim(),
    body('email')
        .isEmail().withMessage('כתובת אימייל לא תקינה')
        .normalizeEmail()
        .isLength({ max: 100 }).withMessage('כתובת האימייל חייבת להיות עד 100 תווים'),
    body('password')
        .isLength({ min: 8, max: 100 }).withMessage('הסיסמה חייבת להיות בין 8 ל-100 תווים')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
        .withMessage('הסיסמה חייבת לכלול אות קטנה, אות גדולה, מספר ותו מיוחד')
        .trim(),
];
export const validateForgotPassword = [
    body('email')
        .isEmail()
        .withMessage('כתובת אימייל לא תקינה')
        .normalizeEmail()
        .isLength({ max: 100 })
        .withMessage('כתובת האימייל חייבת להיות עד 100 תווים'),
];
export const validateResetPassword = [
    body('password')
        .isLength({ min: 8, max: 100 })
        .withMessage('הסיסמה חייבת להיות בין 8 ל-100 תווים')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
        .withMessage('הסיסמה חייבת לכלול אות קטנה, אות גדולה, מספר ותו מיוחד')
        .trim(),
];
export const validateChangePassword = [
    body('currentPassword')
        .notEmpty()
        .withMessage('הסיסמה הנוכחית נדרשת')
        .trim(),
    body('newPassword')
        .isLength({ min: 8, max: 100 })
        .withMessage('הסיסמה החדשה חייבת להיות בין 8 ל-100 תווים')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
        .withMessage('הסיסמה החדשה חייבת לכלול אות קטנה, אות גדולה, מספר ותו מיוחד')
        .trim(),
];
export const validateUpdateProfile = [
    body('name')
        .optional()
        .isLength({ max: 50 })
        .withMessage('השם חייב להיות עד 50 תווים')
        .trim()
        .escape(),
    body('email')
        .optional()
        .isEmail()
        .withMessage('כתובת אימייל לא תקינה')
        .normalizeEmail()
        .isLength({ max: 100 })
        .withMessage('כתובת האימייל חייבת להיות עד 100 תווים'),
];
export const validateTwoFactorSetup = [
    body('secret')
        .notEmpty()
        .withMessage('סוד האימות הדו-שלבי נדרש'),
    body('token')
        .notEmpty()
        .withMessage('קוד האימות נדרש')
        .isLength({ min: 6, max: 6 })
        .withMessage('קוד האימות חייב להיות באורך 6 ספרות'),
];
export const validateTwoFactorVerify = [
    body('userId')
        .notEmpty()
        .withMessage('מזהה המשתמש נדרש'),
    body('token')
        .notEmpty()
        .withMessage('קוד האימות נדרש')
        .isLength({ min: 6, max: 6 })
        .withMessage('קוד האימות חייב להיות באורך 6 ספרות'),
];
export const validateGoogleAuth = [
    body('token')
        .notEmpty()
        .withMessage('טוקן Google נדרש'),
];
