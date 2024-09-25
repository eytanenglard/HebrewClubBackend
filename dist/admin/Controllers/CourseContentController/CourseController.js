import Course from '../../../models/Course';
import User from '../../../models/User';
import mongoose from 'mongoose';
export const getCourseContent = async (req, res) => {
    try {
        const _id = new mongoose.Types.ObjectId(req.params.courseId);
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
            res.status(404).json({
                success: false,
                error: 'Course not found'
            });
            return;
        }
        res.json({
            success: true,
            data: course
        });
    }
    catch (error) {
        console.error('Error fetching course content:', error);
        res.status(500).json({
            success: false,
            error: 'Server error while fetching course content'
        });
    }
};
export const getCourseManagementData = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const totalCount = await Course.countDocuments();
        const totalPages = Math.ceil(totalCount / limit);
        const skip = (page - 1) * limit;
        const courses = await Course.find()
            .populate('instructors', 'name')
            .skip(skip)
            .limit(limit)
            .lean();
        const responseData = {
            success: true,
            data: courses,
            totalCount,
            pageSize: limit,
            currentPage: page,
            totalPages
        };
        res.json(responseData);
    }
    catch (error) {
        console.error('Error fetching course data:', error);
        res.status(500).json({ success: false, error: 'Error fetching course data' });
    }
};
export const createCourse = async (req, res) => {
    try {
        const courseData = req.body;
        const newCourse = new Course(courseData);
        const savedCourse = await newCourse.save();
        res.status(201).json({
            success: true,
            data: savedCourse,
            message: 'Course created successfully'
        });
    }
    catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create course',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
export const updateCourse = async (req, res) => {
    try {
        const courseId = new mongoose.Types.ObjectId(req.params.courseId);
        const updateData = req.body;
        const course = await Course.findByIdAndUpdate(courseId, updateData, { new: true });
        if (!course) {
            res.status(404).json({ success: false, error: 'Course not found' });
            return;
        }
        res.json({
            success: true,
            data: course
        });
    }
    catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ success: false, error: 'Server error while updating course' });
    }
};
export const deleteCourse = async (req, res) => {
    try {
        const courseId = new mongoose.Types.ObjectId(req.params.courseId);
        const course = await Course.findByIdAndDelete(courseId);
        if (!course) {
            res.status(404).json({ success: false, error: 'Course not found' });
            return;
        }
        await User.updateMany({ courses: courseId }, { $pull: { courses: courseId } });
        res.json({ success: true, message: 'Course deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ success: false, error: 'Server error while deleting course' });
    }
};
export const updateCourseStructure = async (req, res) => {
    try {
        const courseId = new mongoose.Types.ObjectId(req.params.courseId);
        const updatedCourseData = req.body;
        const updatedCourse = await Course.findByIdAndUpdate(courseId, updatedCourseData, { new: true });
        if (!updatedCourse) {
            res.status(404).json({ success: false, error: 'Course not found' });
            return;
        }
        res.json({
            success: true,
            data: updatedCourse,
            message: 'Course structure updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating course structure:', error);
        res.status(500).json({ success: false, error: 'Server error while updating course structure' });
    }
};
export const getInstructors = async (req, res) => {
    try {
        const instructors = await User.find({ 'role.name': 'instructor' });
        res.json({
            success: true,
            data: instructors
        });
    }
    catch (error) {
        console.error('Error fetching instructors:', error);
        res.status(500).json({ success: false, error: 'Server error while fetching instructors' });
    }
};
export const getUsersCourse = async (req, res) => {
    try {
        const users = await User.find();
        res.json({
            success: true,
            data: users
        });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, error: 'Server error while fetching users' });
    }
};
//# sourceMappingURL=CourseController.js.map