// src/controllers/courseController.ts
import Course from '../models/Course.js';
export const getCourses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const query = search
            ? { title: { $regex: search, $options: 'i' } }
            : {};
        const total = await Course.countDocuments(query);
        const courses = await Course.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('instructor', 'name');
        const response = {
            success: true,
            data: courses,
            totalCount: total,
            pageSize: limit,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ success: false, error: 'Error fetching courses' });
    }
};
export const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('instructor', 'name');
        if (!course) {
            res.status(404).json({ success: false, error: 'Course not found' });
            return;
        }
        res.json({ success: true, data: course });
    }
    catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ success: false, error: 'Error fetching course' });
    }
};
export const createCourse = async (req, res) => {
    try {
        const newCourse = new Course(req.body);
        await newCourse.save();
        res.status(201).json({ success: true, data: newCourse });
    }
    catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ success: false, error: 'Error creating course' });
    }
};
export const updateCourse = async (req, res) => {
    try {
        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedCourse) {
            res.status(404).json({ success: false, error: 'Course not found' });
            return;
        }
        res.json({ success: true, data: updatedCourse });
    }
    catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ success: false, error: 'Error updating course' });
    }
};
export const deleteCourse = async (req, res) => {
    try {
        const deletedCourse = await Course.findByIdAndDelete(req.params.id);
        if (!deletedCourse) {
            res.status(404).json({ success: false, error: 'Course not found' });
            return;
        }
        res.json({ success: true, message: 'Course deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ success: false, error: 'Error deleting course' });
    }
};
export default {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse
};
