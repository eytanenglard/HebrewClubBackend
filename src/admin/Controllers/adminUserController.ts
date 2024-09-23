import { Request, Response } from 'express';
import User from '../../models/User';
import Course from '../../models/Course';
import bcrypt from 'bcryptjs';
import { User as UserType, UserManagementData, ApiResponse, PaginatedResponse, UserRole} from '../../types/models';
import { createObjectCsvStringifier } from 'csv-writer';
import fs from 'fs';
import csv from 'csv-parser';
import multer from 'multer';
import mongoose from "mongoose";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
  files?: {
    [fieldname: string]: Express.Multer.File[];
  } | Express.Multer.File[];
}

interface EnhancedUser extends Omit<UserType, 'courses'> {
  courses: string[];
  enhancedCourses: Array<{ _id: mongoose.Types.ObjectId | string; title: string }>;
}
const getCourseTitle = async (courseId: mongoose.Types.ObjectId | string): Promise<string> => {
  const course = await Course.findById(courseId);
  return course ? course.title : 'Unknown Course';
};
export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const query = search
      ? { $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } }
        ]}
      : {};

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -twoFactorSecret -resetPasswordToken -resetPasswordExpires -googleId -facebookId -emailVerificationToken -jwtSecret')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const enhancedUsers: EnhancedUser[] = await Promise.all(users.map(async user => {
      const enhancedCourses = await Promise.all(user.courses.map(async courseId => ({
        _id: courseId,
        title: await getCourseTitle(courseId)
      })));

      return {
        ...user,
        enhancedCourses,
        courses: user.courses.map(course => course.toString())
      };
    }));

    const response: PaginatedResponse<EnhancedUser[]> = {
      success: true,
      data: enhancedUsers,
      totalCount: total,
      pageSize: limit,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Error fetching users' } as ApiResponse<null>);
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, username, password, role, courses, groups } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with this email or username already exists' } as ApiResponse<null>);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    let roleObject: UserRole = {
      name: role,
      permissions: []
    };
   
    const courseIds = courses.map((courseId: string) => new mongoose.Types.ObjectId(courseId));
    const enhancedCourses = await Promise.all(courseIds.map(async (courseId: mongoose.Types.ObjectId) => {
      const course = await Course.findById(courseId);
      return {
        courseId: courseId,
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
      groups,
      lastLogin: new Date(),
      status: 'active'
    });

    await newUser.save();

    const responseUser: EnhancedUser = {
      ...newUser.toObject(),
      enhancedCourses,
      courses: newUser.courses.map(course => course.toString())
    };

    res.status(201).json({ 
      success: true, 
      data: responseUser,
      message: 'User created successfully'
    } as ApiResponse<EnhancedUser>);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, error: 'Server error while creating new user' } as ApiResponse<null>);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const _id = req.url.split('/').pop();
    const { name, email, username, role, courses, groups } = req.body;
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' } as ApiResponse<null>);
    }

    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'Email is already in use' } as ApiResponse<null>);
      }
    }

    if (username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'Username is already in use' } as ApiResponse<null>);
      }
    }

    user.name = name;
    user.email = email;
    user.username = username;
    user.role = role;
    user.courses = courses.map((courseId: string) => new mongoose.Types.ObjectId(courseId));
    user.groups = groups;

    await user.save();

    const enhancedCourses = await Promise.all(user.courses.map(async courseId => ({
      _id: courseId,
      title: await getCourseTitle(courseId)
    })));

    const responseUser: EnhancedUser = {
      ...user.toObject(),
      enhancedCourses,
      courses: user.courses.map(course => course.toString())
    };

    res.json({ 
      success: true, 
      data: responseUser
    } as ApiResponse<EnhancedUser>);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, error: 'Server error while updating user' } as ApiResponse<null>);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' } as ApiResponse<null>);
    }
    res.json({ success: true, message: 'User deleted successfully' } as ApiResponse<null>);
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, error: 'Server error while deleting user' } as ApiResponse<null>);
  }
};

export const setUserRole = async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' } as ApiResponse<null>);
    }
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' } as ApiResponse<null>);
    }
    res.json({ success: true, data: user } as ApiResponse<UserType>);
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ success: false, error: 'Server error' } as ApiResponse<null>);
  }
};

export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' } as ApiResponse<null>);
    }
    user.status = user.status === 'active' ? 'locked' : 'active';
    await user.save();
    res.json({ success: true, data: user } as ApiResponse<UserType>);
  } catch (err) {
    console.error('Error toggling user status:', err);
    res.status(500).json({ success: false, error: 'Server error' } as ApiResponse<null>);
  }
};

export const addUserToGroup = async (req: Request, res: Response) => {
  try {
    const { userId, groupName } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' } as ApiResponse<null>);
    }
    if (!user.groups.includes(groupName)) {
      user.groups.push(groupName);
      await user.save();
    }
    res.json({ success: true, data: user } as ApiResponse<UserType>);
  } catch (err) {
    console.error('Error adding user to group:', err);
    res.status(500).json({ success: false, error: 'Server error' } as ApiResponse<null>);
  }
};

export const removeUserFromGroup = async (req: Request, res: Response) => {
  try {
    const { userId, groupName } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' } as ApiResponse<null>);
    }
    user.groups = user.groups.filter(group => group !== groupName);
    await user.save();
    res.json({ success: true, data: user } as ApiResponse<UserType>);
  } catch (err) {
    console.error('Error removing user from group:', err);
    res.status(500).json({ success: false, error: 'Server error' } as ApiResponse<null>);
  }
};

export const exportUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password -twoFactorSecret -resetPasswordToken -resetPasswordExpires -googleId -facebookId -emailVerificationToken -jwtSecret');
    
    const csvStringifier = createObjectCsvStringifier({
      header: [
        {id: 'name', title: 'Name'},
        {id: 'email', title: 'Email'},
        {id: 'username', title: 'Username'},
        {id: 'role', title: 'Role'},
        {id: 'courses', title: 'Courses'},
        {id: 'status', title: 'Status'},
      ]
    });

    const csvData = csvStringifier.stringifyRecords(users);
    const csvString = csvStringifier.getHeaderString() + csvData;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.send(csvString);
  } catch (error) {
    console.error('Error exporting users:', error);
    res.status(500).json({ success: false, error: 'Server error while exporting users' } as ApiResponse<null>);
  }
};

export const importUsers = async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' } as ApiResponse<null>);
    }

    const results: any[] = [];
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
              role: user.role || 'user',
              courses: user.courses,
              status: user.status || 'active'
            });
          }
        }
        fs.unlinkSync(req.file.path);
        res.json({ success: true, message: 'Users imported successfully' } as ApiResponse<null>);
      });
  } catch (error) {
    console.error('Error importing users:', error);
    res.status(500).json({ success: false, error: 'Server error while importing users' } as ApiResponse<null>);
  }
};

export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' } as ApiResponse<null>);
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

    res.json({ success: true, message: 'Password reset successfully' } as ApiResponse<null>);
  } catch (error) {
    console.error('Error resetting user password:', error);
    res.status(500).json({ success: false, error: 'Server error while resetting password' } as ApiResponse<null>);
  }
};

export const getUserActivity = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' } as ApiResponse<null>);
    }

    const enhancedCourses = await Promise.all(user.courses.map(async courseId => ({
      _id: courseId,
      title: await getCourseTitle(courseId)
    })));

    // This is a placeholder. In a real application, you'd fetch actual activity data.
    const activity = {
      lastLogin: user.lastLogin,
      recentCourses: enhancedCourses.slice(-5),
      // Add more activity data as needed
    };

    res.json({ success: true, data: activity } as ApiResponse<typeof activity>);
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching user activity' } as ApiResponse<null>);
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['active', 'locked'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' } as ApiResponse<null>);
    }

    const user = await User.findByIdAndUpdate(userId, { status }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' } as ApiResponse<null>);
    }

    res.json({ success: true, data: user } as ApiResponse<UserType>);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ success: false, error: 'Server error while updating user status' } as ApiResponse<null>);
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const lockedUsers = await User.countDocuments({ status: 'locked' });
    const adminUsers = await User.countDocuments({ 'role.name': 'admin' });

    const stats = {
      totalUsers,
      activeUsers,
      lockedUsers,
      adminUsers,
    };

    res.json({ success: true, data: stats } as ApiResponse<typeof stats>);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching user stats' } as ApiResponse<null>);
  }
};


export const addCourseToUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { courseId } = req.body;

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      res.status(404).json({ success: false, error: 'User or course not found' } as ApiResponse<null>);
      return;
    }

    if (user.courses.some(id => id.toString() === course._id.toString())) {
      res.status(400).json({ success: false, error: 'User already enrolled in this course' } as ApiResponse<null>);
      return;
    }

    user.courses.push(course._id);
    await user.save();

    const enhancedCourses = await Promise.all(user.courses.map(async courseId => ({
      _id: courseId,
      title: await getCourseTitle(courseId)
    })));

    const updatedUser: EnhancedUser = {
      ...user.toObject(),
      enhancedCourses,
      courses: user.courses.map(course => course.toString())
    };

    res.json({ success: true, data: updatedUser } as ApiResponse<EnhancedUser>);
  } catch (error) {
    console.error('Error adding course to user:', error);
    res.status(500).json({ success: false, error: 'Server error' } as ApiResponse<null>);
  }
};
export const removeCourseFromUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, courseId } = req.params;

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      res.status(404).json({ success: false, error: 'User or course not found' } as ApiResponse<null>);
      return;
    }

    if (!user.courses.some(id => id.toString() === course._id.toString())) {
      res.status(400).json({ success: false, error: 'User is not enrolled in this course' } as ApiResponse<null>);
      return;
    }

    user.courses = user.courses.filter(id => id.toString() !== courseId);
    await user.save();

    const enhancedCourses = await Promise.all(user.courses.map(async courseId => ({
      _id: courseId,
      title: await getCourseTitle(courseId)
    })));

    const updatedUser: EnhancedUser = {
      ...user.toObject(),
      enhancedCourses,
      courses: user.courses.map(course => course.toString())
    };

    res.json({ success: true, data: updatedUser } as ApiResponse<EnhancedUser>);
  } catch (error) {
    console.error('Error removing course from user:', error);
    res.status(500).json({ success: false, error: 'Server error' } as ApiResponse<null>);
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password');
    
    const enhancedUsers: EnhancedUser[] = await Promise.all(users.map(async user => {
      const enhancedCourses = await Promise.all(user.courses.map(async courseId => ({
        _id: courseId,
        title: await getCourseTitle(courseId)
      })));

      return {
        ...user.toObject(),
        enhancedCourses,
        courses: user.courses.map(course => course.toString())
      };
    }));

    res.json({ success: true, data: enhancedUsers } as ApiResponse<EnhancedUser[]>);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ success: false, error: 'Server error' } as ApiResponse<null>);
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
  getAllUsers
};