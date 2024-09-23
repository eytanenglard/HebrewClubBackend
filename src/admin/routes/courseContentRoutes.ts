import express from 'express';
import {
  getCourseManagementData,
  createCourse,
  updateCourse,
  deleteCourse,
  addUserToCourse,
  removeUserFromCourse,
  createSection,
  updateSection,
  deleteSection,
  createLesson,
  updateLesson,
  deleteLesson,
  addContent,
  updateContent,
  deleteContent,
  getCourseContent,
  getContentItems,
  updateCourseStructure,
  getLesson,
  getLessons,
  getSection,
  getSections,
  getInstructors,
  getUsersCourse,
} from '../Controllers/adminControllers';

const router = express.Router();

// Course management routes
router.get('/courses/:courseId/content', getCourseContent);
router.get('/courses', getCourseManagementData);
router.post('/courses', createCourse);
router.put('/courses/:courseId', updateCourse);
router.delete('/courses/:courseId', deleteCourse);
router.put('/courses/:courseId/structure', updateCourseStructure);
router.get('/courses/instructors', getInstructors);
router.get('/courses/users', getUsersCourse);
// User-course association routes
router.post('/courses/:courseId/users', addUserToCourse);
router.delete('/courses/:courseId/users/:userId', removeUserFromCourse);

// Section management routes
router.get('/courses/:courseId/sections', getSections);
router.get('/sections/:id', getSection);
router.post('/courses/:courseId/sections', createSection);
router.put('/sections/:id', updateSection);
router.delete('/sections/:id', deleteSection);

// Lesson management routes
router.get('/lessons/:id', getLesson);
router.get('/lessons', getLessons);
router.post('/sections/:sectionId/lessons', createLesson);
router.put('/lessons/:id', updateLesson);
router.delete('/lessons/:id', deleteLesson);

// Content management routes
router.post('/lessons/:lessonId/content', addContent);
router.put('/content/:contentId', updateContent);
router.delete('/content/:contentId', deleteContent);
router.get('/lessons/:lessonId/content', getContentItems);
router.get('/content', getContentItems);
export default router;