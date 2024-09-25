import express from 'express';
import { createCourse, updateCourse, deleteCourse, getCourseManagementData, addUserToCourse, removeUserFromCourse, getUsers, createUser, updateUser, deleteUser, setUserRole, addCourseToUser, removeCourseFromUser } from '../Controllers/adminControllers.js';
import courseContentRoutes from './courseContentRoutes.js';
import leadRoutes from './adminleadRoutes.js';
console.log('Admin routes loaded');
const router = express.Router();
// Course management
router.get('/courses', getCourseManagementData);
router.post('/courses', createCourse);
router.put('/courses/:courseId', updateCourse);
router.delete('/courses/:courseId', deleteCourse);
router.post('/courses/:courseId/add-user', addUserToCourse);
router.post('/courses/:courseId/remove-user', removeUserFromCourse);
// Course content management
router.use('/course-content', courseContentRoutes);
// User management
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);
router.post('/users/:userId/set-role', setUserRole);
router.post('/users/:userId/courses', addCourseToUser);
router.delete('/users/:userId/courses/:courseId', removeCourseFromUser);
// Lead management
router.use('/leads', leadRoutes);
export default router;
