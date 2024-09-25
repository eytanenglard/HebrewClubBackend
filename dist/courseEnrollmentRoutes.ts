import express from 'express';
import { 
  enrollInCourse, 
  getCourseEnrollment, 
  updateCourseEnrollment, 
  getAllCourses,
  getCourseDetails,
  associateCourseWithUser  }
   from '../controllers/courseEnrollmentController.js';

const router = express.Router();

// Existing routes
router.post('/', enrollInCourse);
router.get('/:id', getCourseEnrollment);
router.put('/:id', updateCourseEnrollment);
router.get('/courses/all', getAllCourses);

// New route for getting a specific course
router.get('/courses/:id', getCourseDetails);  // Add this new route
router.post('/associate-course', associateCourseWithUser);
export default router;