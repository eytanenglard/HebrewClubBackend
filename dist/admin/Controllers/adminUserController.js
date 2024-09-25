import User from '../../models/User';
import Course from '../../models/Course';
import bcrypt from 'bcryptjs';
import { createObjectCsvStringifier } from 'csv-writer';
import fs from 'fs';
import csv from 'csv-parser';
import mongoose from "mongoose";
const getCourseTitle = async (courseId) => {
    const course = await Course.findById(courseId);
    return course ? course.title : 'Unknown Course';
};
export const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const query = search
            ? { $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { username: { $regex: search, $options: 'i' } }
                ] }
            : {};
        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password -twoFactorSecret -resetPasswordToken -resetPasswordExpires -googleId -facebookId -emailVerificationToken -jwtSecret')
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
        const enhancedUsers = await Promise.all(users.map(async (user) => {
            const enhancedCourses = await Promise.all(user.courses.map(async (courseId) => ({
                _id: courseId.toString(),
                title: await getCourseTitle(courseId)
            })));
            return {
                ...user,
                _id: user._id.toString(),
                enhancedCourses,
                courses: user.courses.map(course => course.toString()),
                groups: user.groups.map(group => group.toString()),
                completedLessons: user.completedLessons.map(lesson => lesson.toString()),
                role: {
                    ...user.role,
                    permissions: user.role.permissions.map(permission => permission.toString())
                },
                certificates: user.certificates.map(cert => ({
                    ...cert,
                    courseId: cert.courseId.toString()
                }))
            };
        }));
        const response = {
            success: true,
            data: enhancedUsers,
            totalCount: total,
            pageSize: limit,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, error: 'Error fetching users' });
    }
};
export const createUser = async (req, res) => {
    try {
        const { name, email, username, password, role, courses, groups } = req.body;
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            res.status(400).json({ success: false, error: 'User with this email or username already exists' });
            return;
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        let roleObject = {
            name: role,
            permissions: []
        };
        const courseIds = courses.map((courseId) => new mongoose.Types.ObjectId(courseId));
        const enhancedCourses = await Promise.all(courseIds.map(async (courseId) => {
            const course = await Course.findById(courseId);
            return {
                _id: courseId.toString(),
                title: course ? course.title : 'Unknown Course'
            };
        }));
        const newUser = new User({
            name,
            email,
            username,
            password: hashedPassword,
            role: roleObject,
            courses: courseIds,
            groups: groups.map((groupId) => new mongoose.Types.ObjectId(groupId)),
            lastLogin: new Date(),
            status: 'active'
        });
        await newUser.save();
        const responseUser = {
            ...newUser.toObject(),
            _id: newUser._id.toString(),
            enhancedCourses,
            courses: newUser.courses.map(course => course.toString()),
            groups: newUser.groups.map(group => group.toString()),
            completedLessons: [],
            role: {
                ...newUser.role,
                permissions: newUser.role.permissions.map(permission => permission.toString())
            },
            certificates: []
        };
        res.status(201).json({
            success: true,
            data: responseUser,
            message: 'User created successfully'
        });
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, error: 'Server error while creating new user' });
    }
};
export const updateUser = async (req, res) => {
    try {
        const _id = req.params.id;
        const { name, email, username, role, courses, groups } = req.body;
        const user = await User.findById(_id);
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }
        if (email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                res.status(400).json({ success: false, error: 'Email is already in use' });
                return;
            }
        }
        if (username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                res.status(400).json({ success: false, error: 'Username is already in use' });
                return;
            }
        }
        user.name = name;
        user.email = email;
        user.username = username;
        user.role = role;
        user.courses = courses.map((courseId) => new mongoose.Types.ObjectId(courseId));
        user.groups = groups.map((groupId) => new mongoose.Types.ObjectId(groupId));
        await user.save();
        const enhancedCourses = await Promise.all(user.courses.map(async (courseId) => ({
            _id: courseId.toString(),
            title: await getCourseTitle(courseId)
        })));
        const responseUser = {
            ...user.toObject(),
            _id: user._id.toString(),
            enhancedCourses,
            courses: user.courses.map(course => course.toString()),
            groups: user.groups.map(group => group.toString()),
            completedLessons: user.completedLessons.map(lesson => lesson.toString()),
            role: {
                ...user.role,
                permissions: user.role.permissions.map(permission => permission.toString())
            },
            certificates: user.certificates.map(cert => ({
                ...cert,
                courseId: cert.courseId.toString()
            }))
        };
        res.json({
            success: true,
            data: responseUser
        });
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, error: 'Server error while updating user' });
    }
};
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }
        res.json({ success: true, message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, error: 'Server error while deleting user' });
    }
};
export const setUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body;
        if (!['user', 'admin', 'moderator', 'instructor'].includes(role)) {
            res.status(400).json({ success: false, error: 'Invalid role' });
            return;
        }
        const user = await User.findByIdAndUpdate(userId, { 'role.name': role }, { new: true });
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }
        res.json({ success: true, data: user });
    }
    catch (err) {
        console.error('Error updating user role:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
export const toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }
        user.status = user.status === 'active' ? 'locked' : 'active';
        await user.save();
        res.json({ success: true, data: user });
    }
    catch (err) {
        console.error('Error toggling user status:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
export const addUserToGroup = async (req, res) => {
    try {
        const { userId, groupId } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }
        if (!user.groups.includes(new mongoose.Types.ObjectId(groupId))) {
            user.groups.push(new mongoose.Types.ObjectId(groupId));
            await user.save();
        }
        res.json({ success: true, data: user });
    }
    catch (err) {
        console.error('Error adding user to group:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
export const removeUserFromGroup = async (req, res) => {
    try {
        const { userId, groupId } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }
        user.groups = user.groups.filter(group => group.toString() !== groupId);
        await user.save();
        res.json({ success: true, data: user });
    }
    catch (err) {
        console.error('Error removing user from group:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
export const exportUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -twoFactorSecret -resetPasswordToken -resetPasswordExpires -googleId -facebookId -emailVerificationToken -jwtSecret');
        const csvStringifier = createObjectCsvStringifier({
            header: [
                { id: 'name', title: 'Name' },
                { id: 'email', title: 'Email' },
                { id: 'username', title: 'Username' },
                { id: 'role', title: 'Role' },
                { id: 'courses', title: 'Courses' },
                { id: 'status', title: 'Status' },
            ]
        });
        const csvData = csvStringifier.stringifyRecords(users.map(user => ({
            ...user.toObject(),
            role: user.role.name,
            courses: user.courses.join(', ')
        })));
        const csvString = csvStringifier.getHeaderString() + csvData;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
        res.send(csvString);
    }
    catch (error) {
        console.error('Error exporting users:', error);
        res.status(500).json({ success: false, error: 'Server error while exporting users' });
    }
};
export const importUsers = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, error: 'No file uploaded' });
            return;
        }
        const results = [];
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
            for (const user of results) {
                const existingUser = await User.findOne({ $or: [{ email: user.email }, { username: user.username }] });
                if (!existingUser) {
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash('defaultPassword', salt);
                    await User.create({
                        name: user.name,
                        email: user.email,
                        username: user.username,
                        password: hashedPassword,
                        role: { name: user.role || 'user', permissions: [] },
                        courses: user.courses ? user.courses.split(',').map((course) => course.trim()) : [],
                        status: user.status || 'active'
                    });
                }
            }
            fs.unlinkSync(req.file.path);
            res.json({ success: true, message: 'Users imported successfully' });
        });
    }
    catch (error) {
        console.error('Error importing users:', error);
        res.status(500).json({ success: false, error: 'Server error while importing users' });
    }
};
export const resetUserPassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }
        const tempPassword = Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        // Here you would typically send an email to the user with their temporary password
        console.log(`Temporary password for ${user.email}: ${tempPassword}`);
        res.json({ success: true, message: 'Password reset successfully' });
    }
    catch (error) {
        console.error('Error resetting user password:', error);
        res.status(500).json({ success: false, error: 'Server error while resetting password' });
    }
};
export const getUserActivity = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }
        const enhancedCourses = await Promise.all(user.courses.map(async (courseId) => ({
            _id: courseId.toString(),
            title: await getCourseTitle(courseId)
        })));
        // This is a placeholder. In a real application, you'd fetch actual activity data.
        const activity = {
            lastLogin: user.lastLogin,
            recentCourses: enhancedCourses.slice(-5),
            // Add more activity data as needed
        };
        res.json({ success: true, data: activity });
    }
    catch (error) {
        console.error('Error fetching user activity:', error);
        res.status(500).json({ success: false, error: 'Server error while fetching user activity' });
    }
};
export const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;
        if (!['active', 'inactive', 'locked'].includes(status)) {
            res.status(400).json({ success: false, error: 'Invalid status' });
            return;
        }
        const user = await User.findByIdAndUpdate(userId, { status }, { new: true });
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }
        res.json({ success: true, data: user });
    }
    catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ success: false, error: 'Server error while updating user status' });
    }
};
export const getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'active' });
        const lockedUsers = await User.countDocuments({ status: 'locked' });
        const inactiveUsers = await User.countDocuments({ status: 'inactive' });
        const usersByRole = await User.aggregate([
            { $group: { _id: "$role.name", count: { $sum: 1 } } }
        ]);
        const stats = {
            totalUsers,
            activeUsers,
            lockedUsers,
            inactiveUsers,
            usersByRole: Object.fromEntries(usersByRole.map(item => [item._id, item.count]))
        };
        res.json({ success: true, data: stats });
    }
    catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ success: false, error: 'Server error while fetching user stats' });
    }
};
export const addCourseToUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { courseId } = req.body;
        const user = await User.findById(userId);
        const course = await Course.findById(courseId);
        if (!user || !course) {
            res.status(404).json({ success: false, error: 'User or course not found' });
            return;
        }
        if (user.courses.some(id => id.toString() === course._id.toString())) {
            res.status(400).json({ success: false, error: 'User already enrolled in this course' });
            return;
        }
        user.courses.push(course._id);
        await user.save();
        const enhancedCourses = await Promise.all(user.courses.map(async (courseId) => ({
            _id: courseId.toString(),
            title: await getCourseTitle(courseId)
        })));
        const updatedUser = {
            ...user.toObject(),
            _id: user._id.toString(),
            enhancedCourses,
            courses: user.courses.map(course => course.toString()),
            groups: user.groups.map(group => group.toString()),
            completedLessons: user.completedLessons.map(lesson => lesson.toString()),
            role: {
                ...user.role,
                permissions: user.role.permissions.map(permission => permission.toString())
            },
            certificates: user.certificates.map(cert => ({
                ...cert,
                courseId: cert.courseId.toString()
            }))
        };
        res.json({ success: true, data: updatedUser });
    }
    catch (error) {
        console.error('Error adding course to user:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
export const removeCourseFromUser = async (req, res) => {
    try {
        const { userId, courseId } = req.params;
        const user = await User.findById(userId);
        const course = await Course.findById(courseId);
        if (!user || !course) {
            res.status(404).json({ success: false, error: 'User or course not found' });
            return;
        }
        if (!user.courses.some(id => id.toString() === course._id.toString())) {
            res.status(400).json({ success: false, error: 'User is not enrolled in this course' });
            return;
        }
        user.courses = user.courses.filter(id => id.toString() !== courseId);
        await user.save();
        const enhancedCourses = await Promise.all(user.courses.map(async (courseId) => ({
            _id: courseId.toString(),
            title: await getCourseTitle(courseId)
        })));
        const updatedUser = {
            ...user.toObject(),
            _id: user._id.toString(),
            enhancedCourses,
            courses: user.courses.map(course => course.toString()),
            groups: user.groups.map(group => group.toString()),
            completedLessons: user.completedLessons.map(lesson => lesson.toString()),
            role: {
                ...user.role,
                permissions: user.role.permissions.map(permission => permission.toString())
            },
            certificates: user.certificates.map(cert => ({
                ...cert,
                courseId: cert.courseId.toString()
            }))
        };
        res.json({ success: true, data: updatedUser });
    }
    catch (error) {
        console.error('Error removing course from user:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        const enhancedUsers = await Promise.all(users.map(async (user) => {
            const enhancedCourses = await Promise.all(user.courses.map(async (courseId) => ({
                _id: courseId.toString(),
                title: await getCourseTitle(courseId)
            })));
            return {
                ...user.toObject(),
                _id: user._id.toString(),
                enhancedCourses,
                courses: user.courses.map(course => course.toString()),
                groups: user.groups.map(group => group.toString()),
                completedLessons: user.completedLessons.map(lesson => lesson.toString()),
                role: {
                    ...user.role,
                    permissions: user.role.permissions.map(permission => permission.toString())
                },
                certificates: user.certificates.map(cert => ({
                    ...cert,
                    courseId: cert.courseId.toString()
                }))
            };
        }));
        res.json({ success: true, data: enhancedUsers });
    }
    catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
export const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }
        const enhancedCourses = await Promise.all(user.courses.map(async (courseId) => ({
            _id: courseId.toString(),
            title: await getCourseTitle(courseId)
        })));
        const enhancedUser = {
            ...user.toObject(),
            _id: user._id.toString(),
            enhancedCourses,
            courses: user.courses.map(course => course.toString()),
            groups: user.groups.map(group => group.toString()),
            completedLessons: user.completedLessons.map(lesson => lesson.toString()),
            role: {
                ...user.role,
                permissions: user.role.permissions.map(permission => permission.toString())
            },
            certificates: user.certificates.map(cert => ({
                ...cert,
                courseId: cert.courseId.toString()
            }))
        };
        res.json({ success: true, data: enhancedUser });
    }
    catch (error) {
        console.error('Error fetching user by ID:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
export const updateUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const updateData = req.body;
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }
        // Update only allowed fields
        const allowedFields = ['name', 'email', 'phone', 'username', 'dateOfBirth', 'address', 'city', 'country', 'bio', 'avatar'];
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                user[field] = updateData[field];
            }
        });
        await user.save();
        const enhancedCourses = await Promise.all(user.courses.map(async (courseId) => ({
            _id: courseId.toString(),
            title: await getCourseTitle(courseId)
        })));
        const updatedUser = {
            ...user.toObject(),
            _id: user._id.toString(),
            enhancedCourses,
            courses: user.courses.map(course => course.toString()),
            groups: user.groups.map(group => group.toString()),
            completedLessons: user.completedLessons.map(lesson => lesson.toString()),
            role: {
                ...user.role,
                permissions: user.role.permissions.map(permission => permission.toString())
            },
            certificates: user.certificates.map(cert => ({
                ...cert,
                courseId: cert.courseId.toString()
            }))
        };
        res.json({ success: true, data: updatedUser });
    }
    catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
export default {
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
    getAllUsers,
    getUserById,
    updateUserProfile
};
//# sourceMappingURL=adminUserController.js.map