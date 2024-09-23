import { Request, Response } from 'express';
import Course from '../../../models/Course';
import User from '../../../models/User';
import { Course as CourseType, CourseData, User as UserType, ApiResponse, PaginatedResponse } from '../../../types/models';
import mongoose from 'mongoose';

export const getCourseContent = async (req: Request, res: Response) => {
  try {
    const _id = new mongoose.Types.ObjectId( req.params.courseId);
    const course = await Course.findById(_id)
      .populate({
        path: 'sections',
        populate: {
          path: 'lessons',
          populate: {
            path: 'contentItems'
          }
        }
      })
      .lean();

    if (!course) {
      return res.status(404).json({ 
        success: false, 
        error: 'Course not found' 
      } as ApiResponse<null>);
    }

    res.json({ 
      success: true, 
      data: course 
    } as ApiResponse<typeof course>);
  } catch (error) {
    console.error('Error fetching course content:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while fetching course content' 
    } as ApiResponse<null>);
  }
};
export const getCourseManagementData = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const totalCount = await Course.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;

    const courses = await Course.find()
      .populate('instructors', 'name')
      .skip(skip)
      .limit(limit)
      .lean();

    const responseData: PaginatedResponse<CourseType[]> = {
      success: true,
      data: courses,
      totalCount,
      pageSize: limit,
      currentPage: page,
      totalPages
    };

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching course data:', error);
    res.status(500).json({ success: false, error: 'Error fetching course data' } as ApiResponse<null>);
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const courseData: CourseData = req.body;
    
    const newCourse = new Course(courseData);
    const savedCourse = await newCourse.save();
    
    res.status(201).json({ 
      success: true, 
      data: savedCourse,
      message: 'Course created successfully'
    } as ApiResponse<CourseType>);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create course',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse<null>);
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const courseId = new mongoose.Types.ObjectId(req.params.courseId);
    const updateData: Partial<CourseData> = req.body;

    const course = await Course.findByIdAndUpdate(courseId, updateData, { new: true });
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' } as ApiResponse<null>);
    }
    res.json({ 
      success: true, 
      data: course
    } as ApiResponse<CourseType>);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ success: false, error: 'Server error while updating course' } as ApiResponse<null>);
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const courseId = new mongoose.Types.ObjectId(req.params.courseId);

    const course = await Course.findByIdAndDelete(courseId);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' } as ApiResponse<null>);
    }

    await User.updateMany(
      { courses: courseId },
      { $pull: { courses: courseId } }
    );

    res.json({ success: true, message: 'Course deleted successfully' } as ApiResponse<null>);
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ success: false, error: 'Server error while deleting course' } as ApiResponse<null>);
  }
};

export const updateCourseStructure = async (req: Request, res: Response) => {
  try {
    const courseId = new mongoose.Types.ObjectId(req.params.courseId);
    const updatedCourseData: CourseType = req.body;

    const updatedCourse = await Course.findByIdAndUpdate(courseId, updatedCourseData, { new: true });

    if (!updatedCourse) {
      return res.status(404).json({ success: false, error: 'Course not found' } as ApiResponse<null>);
    }

    res.json({ 
      success: true, 
      data: updatedCourse,
      message: 'Course structure updated successfully'
    } as ApiResponse<CourseType>);
  } catch (error) {
    console.error('Error updating course structure:', error);
    res.status(500).json({ success: false, error: 'Server error while updating course structure' } as ApiResponse<null>);
  }
};

export const getInstructors = async (req: Request, res: Response) => {
  try {
    const instructors = await User.find({ 'role.name': 'instructor' });
    res.json({ 
      success: true, 
      data: instructors
    } as ApiResponse<UserType[]>);
  } catch (error) {
    console.error('Error fetching instructors:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching instructors' } as ApiResponse<null>);
  }
};

export const getUsersCourse = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json({ 
      success: true, 
      data: users
    } as ApiResponse<UserType[]>);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching users' } as ApiResponse<null>);
  }
};