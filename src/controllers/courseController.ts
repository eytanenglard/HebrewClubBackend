// src/controllers/courseController.ts

import { Request, Response } from 'express';
import Course from '../models/Course';
import { ApiResponse, PaginatedResponse } from '../types/models';

export const getCourses = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const query = search
      ? { title: { $regex: search, $options: 'i' } }
      : {};

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('instructor', 'name');

    const response: PaginatedResponse<typeof courses> = {
      success: true,
      data: courses,
      totalCount: total,
      pageSize: limit,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, error: 'Error fetching courses' } as ApiResponse<null>);
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name');
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' } as ApiResponse<null>);
    }
    res.json({ success: true, data: course } as ApiResponse<typeof course>);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ success: false, error: 'Error fetching course' } as ApiResponse<null>);
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const newCourse = new Course(req.body);
    await newCourse.save();
    res.status(201).json({ success: true, data: newCourse } as ApiResponse<typeof newCourse>);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ success: false, error: 'Error creating course' } as ApiResponse<null>);
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCourse) {
      return res.status(404).json({ success: false, error: 'Course not found' } as ApiResponse<null>);
    }
    res.json({ success: true, data: updatedCourse } as ApiResponse<typeof updatedCourse>);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ success: false, error: 'Error updating course' } as ApiResponse<null>);
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse) {
      return res.status(404).json({ success: false, error: 'Course not found' } as ApiResponse<null>);
    }
    res.json({ success: true, message: 'Course deleted successfully' } as ApiResponse<null>);
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ success: false, error: 'Error deleting course' } as ApiResponse<null>);
  }
};

export default {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
};