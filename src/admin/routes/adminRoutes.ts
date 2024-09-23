import express from 'express';
import {
  getDashboardStats,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseManagementData,
  addUserToCourse,
  removeUserFromCourse,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  setUserRole,
  toggleUserStatus,
  addUserToGroup,
  removeUserFromGroup,
  exportUsers,
  importUsers,
  resetUserPassword,
  getUserActivity,
  updateUserStatus,
  getUserStats,
  addCourseToUser,
  removeCourseFromUser
} from '../Controllers/adminControllers';

import courseContentRoutes from './courseContentRoutes';
import leadRoutes from './adminleadRoutes';

console.log('Admin routes loaded');

const router = express.Router();

// Authentication
router.get('/auth/check', (req, res) => res.json({ isAuthenticated: true })); // Placeholder, implement actual auth check

// Dashboard
router.get('/dashboard', getDashboardStats);

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
router.post('/users/:userId/toggle-status', toggleUserStatus);
router.post('/users/:userId/add-to-group', addUserToGroup);
router.post('/users/:userId/remove-from-group', removeUserFromGroup);
router.get('/users/export', exportUsers);
router.post('/users/import', importUsers);
router.post('/users/:userId/reset-password', resetUserPassword);
router.get('/users/:userId/activity', getUserActivity);
router.patch('/users/:userId/status', updateUserStatus);
router.get('/users/stats', getUserStats);
router.post('/users/:userId/courses', addCourseToUser);
router.delete('/users/:userId/courses/:courseId', removeCourseFromUser);

// Lead management
router.use('/leads', leadRoutes);

export default router;