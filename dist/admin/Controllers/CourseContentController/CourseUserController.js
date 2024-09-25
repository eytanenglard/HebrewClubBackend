import Course from '../../../models/Course.js';
import User from '../../../models/User.js';
import mongoose from 'mongoose';
export const addUserToCourse = async (req, res) => {
    try {
        const courseId = new mongoose.Types.ObjectId(req.params.courseId);
        const userId = new mongoose.Types.ObjectId(req.body.userId);
        const course = await Course.findById(courseId);
        const user = await User.findById(userId);
        if (!course || !user) {
            res.status(404).json({ success: false, error: 'Course or user not found' });
            return;
        }
        if (!course.users.includes(userId)) {
            course.users.push(userId);
            await course.save();
        }
        if (!user.courses.includes(courseId)) {
            user.courses.push(courseId);
            await user.save();
        }
        res.json({
            success: true,
            data: course,
            message: 'User added to course successfully'
        });
    }
    catch (error) {
        console.error('Error adding user to course:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
export const removeUserFromCourse = async (req, res) => {
    try {
        const courseId = new mongoose.Types.ObjectId(req.params.courseId);
        const userId = new mongoose.Types.ObjectId(req.body.userId);
        const course = await Course.findById(courseId);
        const user = await User.findById(userId);
        if (!course || !user) {
            res.status(404).json({ success: false, error: 'Course or user not found' });
            return;
        }
        course.users = course.users.filter((id) => !id.equals(userId));
        await course.save();
        user.courses = user.courses.filter((id) => !id.equals(courseId));
        await user.save();
        res.json({
            success: true,
            data: course,
            message: 'User removed from course successfully'
        });
    }
    catch (error) {
        console.error('Error removing user from course:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
