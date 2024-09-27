import { createCourse, updateCourse, deleteCourse, getCourseManagementData, getCourseContent, updateCourseStructure, getInstructors, getUsersCourse } from './CourseContentController/CourseController.js';
import { addUserToCourse, removeUserFromCourse } from './CourseContentController/CourseUserController.js';
import { createSection, updateSection, deleteSection, getSection, getSections } from './CourseContentController/SectionController.js';
import { createLesson, updateLesson, deleteLesson, getLesson, getLessons } from './CourseContentController/LessonController.js';
import { addContent, updateContent, deleteContent, getContentItems } from './CourseContentController/ContentController.js';
import { getUsers, createUser, updateUser, deleteUser, setUserRole, addCourseToUser, removeCourseFromUser } from './adminUserController.js';
import { createLead, updateLead, deleteLead } from './adminLeadController.js';
export { 
// Course management
getCourseContent, createCourse, updateCourse, deleteCourse, getCourseManagementData, addUserToCourse, removeUserFromCourse, updateCourseStructure, getInstructors, getUsersCourse, 
// Section management
createSection, updateSection, deleteSection, getSection, getSections, 
// Lesson management
createLesson, updateLesson, deleteLesson, getLesson, getLessons, 
// Content management
addContent, updateContent, deleteContent, getContentItems, 
// User management
getUsers, createUser, updateUser, deleteUser, setUserRole, addCourseToUser, removeCourseFromUser, 
// Lead management
createLead, updateLead, deleteLead, };
