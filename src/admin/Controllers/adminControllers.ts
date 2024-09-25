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
  addCourseToUser,
  removeCourseFromUser
} from './adminUserController';

import { 
  createLead, 
  updateLead, 
  deleteLead 
} from './adminLeadController';



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
  addCourseToUser,
  removeCourseFromUser,

  // Lead management
  createLead,
  updateLead,
  deleteLead,
 
};