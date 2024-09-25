import express from 'express';
import { body, ValidationChain } from 'express-validator';
import { authenticateUser } from '../middleware/authMiddleware.js';
import {
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  deleteUserAccount,
  initiatePasswordReset,
  getUserCourses,
  getCourseDetails
} from '../controllers/personalAreaController.js';

const router = express.Router();

// Middleware for input validation
const validateProfileUpdate: ValidationChain[] = [
  body('name').optional().isString().withMessage('Name must be a string'),
  body('email').optional().isEmail().withMessage('Invalid email address'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  body('dateOfBirth').optional().isISO8601().toDate().withMessage('Invalid date format'),
  body('address').optional().isString().withMessage('Address must be a string'),
  body('city').optional().isString().withMessage('City must be a string'),
  body('country').optional().isString().withMessage('Country must be a string'),
  body('bio').optional().isString().withMessage('Bio must be a string'),
];

const validatePasswordUpdate: ValidationChain[] = [
  body('currentPassword').isString().notEmpty().withMessage('Current password is required'),
  body('newPassword').isString().isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
];

// Apply authenticateUser middleware to all routes
router.use(authenticateUser);

// Routes
router.get('/profile', getUserProfile);
router.put('/profile', validateProfileUpdate, updateUserProfile);
router.put('/change-password', validatePasswordUpdate, updateUserPassword);
router.delete('/account', deleteUserAccount);
router.post('/initiate-password-reset', initiatePasswordReset);
router.get('/courses', getUserCourses);
router.get('/courses/:id', getCourseDetails);  
export default router;