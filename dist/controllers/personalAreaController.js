import mongoose from 'mongoose';
import User from '../models/User';
import Course from '../models/Course';
import { sendPasswordResetEmail } from './emailController';
import crypto from 'crypto';
// Helper function to format user response
const formatUserResponse = (user) => ({
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    username: user.username,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : undefined,
    address: user.address,
    city: user.city,
    country: user.country,
    bio: user.bio,
    role: user.role.name,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    twoFactorEnabled: user.twoFactorEnabled,
    isEmailVerified: user.isEmailVerified,
    status: user.status,
    failedLoginAttempts: user.failedLoginAttempts
});
// Helper function to send API response
const sendResponse = (res, data, message) => {
    const response = {
        success: true,
        data,
        message
    };
    res.json(response);
};
// Get user profile
export const getUserProfile = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
    }
    const user = await User.findById(userId).select('-password');
    if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
    }
    sendResponse(res, formatUserResponse(user));
};
// Update user profile
export const updateUserProfile = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
    }
    const { name, email, phone, dateOfBirth, address, city, country, bio } = req.body;
    const user = await User.findById(userId);
    if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
    }
    if (name)
        user.name = name;
    if (email)
        user.email = email;
    if (phone)
        user.phone = phone;
    if (dateOfBirth)
        user.dateOfBirth = new Date(dateOfBirth);
    if (address)
        user.address = address;
    if (city)
        user.city = city;
    if (country)
        user.country = country;
    if (bio)
        user.bio = bio;
    await user.save();
    sendResponse(res, formatUserResponse(user), 'Profile updated successfully');
};
// Get user courses
export const getUserCourses = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const user = await User.findById(userId);
    if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
    }
    const total = user.courses.length;
    const courses = await Course.find({ _id: { $in: user.courses } })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('instructors', 'name')
        .lean();
    const coursesWithDefaultInstructor = courses.map(course => ({
        ...course,
        instructors: course.instructors.length > 0 ? course.instructors : [{ name: 'No instructor assigned' }]
    }));
    const response = {
        success: true,
        data: coursesWithDefaultInstructor,
        totalCount: total,
        pageSize: limit,
        currentPage: page,
        totalPages: Math.ceil(total / limit)
    };
    res.json(response);
};
// Update user password
export const updateUserPassword = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
    }
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        res.status(400).json({ success: false, message: 'Current password is incorrect' });
        return;
    }
    user.password = newPassword;
    await user.save();
    sendResponse(res, null, 'Password updated successfully');
};
// Delete user account
export const deleteUserAccount = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
    }
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
    }
    sendResponse(res, null, 'User account deleted successfully');
};
export const initiatePasswordReset = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
    }
    const user = await User.findById(userId);
    if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
    }
    if (user.passwordResetAttempts >= 3) {
        user.isLocked = true;
        user.lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // Lock for 24 hours
        await user.save();
        res.status(403).json({ success: false, message: 'Too many reset attempts. Account locked for 24 hours.' });
        return;
    }
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour expiration
    user.passwordResetAttempts += 1;
    await user.save();
    try {
        await sendPasswordResetEmail(user.email, resetToken, 3 - user.passwordResetAttempts);
        sendResponse(res, null, 'Password reset email sent successfully');
    }
    catch (error) {
        console.error('Error sending password reset email:', error);
        user.passwordResetAttempts -= 1;
        await user.save();
        res.status(500).json({ success: false, message: 'Error sending password reset email' });
    }
};
// Get course details (added from courseEnrollmentController)
// Updated getCourseDetails function
export const getCourseDetails = async (req, res) => {
    const courseId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        res.status(400).json({
            success: false,
            error: 'Invalid course ID'
        });
        return;
    }
    const course = await Course.findById(courseId)
        .populate({
        path: 'instructors',
        select: 'name email'
    })
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
    // Convert _id to string for all nested objects
    const convertIds = (obj) => {
        const converted = { ...obj };
        if (converted._id) {
            converted._id = converted._id.toString();
        }
        for (const key in converted) {
            if (Array.isArray(converted[key])) {
                converted[key] = converted[key].map(convertIds);
            }
            else if (typeof converted[key] === 'object' && converted[key] !== null) {
                converted[key] = convertIds(converted[key]);
            }
        }
        return converted;
    };
    const convertedCourse = convertIds(course);
    sendResponse(res, convertedCourse, 'Course details retrieved successfully');
};
export default {
    getUserProfile,
    updateUserProfile,
    getUserCourses,
    updateUserPassword,
    deleteUserAccount,
    initiatePasswordReset,
    getCourseDetails
};
//# sourceMappingURL=personalAreaController.js.map