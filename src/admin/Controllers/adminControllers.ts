import { Request, Response } from 'express';
import { 
  createCourse, 
  updateCourse, 
  deleteCourse, 
  getCourseManagementData,
  getCourseContent,
  updateCourseStructure,
  getInstructors,
  getUsersCourse
} from './CourseContentController/CourseController';

import {
  addUserToCourse,
  removeUserFromCourse
} from './CourseContentController/CourseUserController';

import {
  createSection,
  updateSection,
  deleteSection,
  getSection,
  getSections
} from './CourseContentController/SectionController';

import {
  createLesson,
  updateLesson,
  deleteLesson,
  getLesson,
  getLessons
} from './CourseContentController/LessonController';

import {
  addContent,
  updateContent,
  deleteContent,
  getContentItems
} from './CourseContentController/ContentController';

import { 
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
} from './adminUserController';

import { 
  getLeadManagementData, 
  createLead, 
  updateLead, 
  deleteLead 
} from './adminLeadController';

import User from '../../models/User';
import Course from '../../models/Course';
import Payment from '../../models/Payment';
import Lead from '../../models/Lead';

// Dashboard functionality
const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const userCount = await User.countDocuments();
    const courseCount = await Course.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const newLeadsCount = await Lead.countDocuments({ 
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      success: true,
      data: {
        userCount,
        courseCount,
        totalRevenue: totalRevenue[0]?.total || 0,
        newLeadsCount
      },
      message: 'Dashboard stats fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error fetching dashboard stats',
      message: 'An error occurred while fetching dashboard stats'
    });
  }
};

export {
  // Course management
  getCourseContent ,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseManagementData,
  addUserToCourse,
  removeUserFromCourse,
  updateCourseStructure,
  getInstructors,
  getUsersCourse,
  // Section management
  createSection,
  updateSection,
  deleteSection,
  getSection,
  getSections,
  // Lesson management
  createLesson,
  updateLesson,
  deleteLesson,
  getLesson,
  getLessons,
  // Content management
  addContent,
  updateContent,
  deleteContent,
  getContentItems,

  // User management
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
  removeCourseFromUser,

  // Lead management
  getLeadManagementData,
  createLead,
  updateLead,
  deleteLead,

  // Dashboard
  getDashboardStats
};