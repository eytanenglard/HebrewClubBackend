import { Request, Response } from 'express';
import User from '../../models/User.js';
import Course from '../../models/Course.js';
import bcrypt from 'bcryptjs';
import { User as UserType, ApiResponse, PaginatedResponse, UserRole, EnhancedUser } from '../../types/models.js';
import mongoose from "mongoose";

const getCourseTitle = async (courseId: mongoose.Types.ObjectId | string): Promise<string> => {
  const course = await Course.findById(courseId);
  return course ? course.title : 'Unknown Course';
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
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

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, username, password, role, courses, groups } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      res.status(400).json({ success: false, error: 'User with this email or username already exists' } as ApiResponse<null>);
      return;
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
      groups: groups.map((groupId: string) => new mongoose.Types.ObjectId(groupId)),
      lastLogin: new Date(),
      status: 'active'
    });

    await newUser.save();

    const responseUser: EnhancedUser = {
      ...newUser.toObject(),
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
    } as ApiResponse<EnhancedUser>);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, error: 'Server error while creating new user' } as ApiResponse<null>);
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const _id = req.params.id;
    const { name, email, username, role, courses, groups } = req.body;
    const user = await User.findById(_id);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' } as ApiResponse<null>);
      return;
    }

    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ success: false, error: 'Email is already in use' } as ApiResponse<null>);
        return;
      }
    }

    if (username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        res.status(400).json({ success: false, error: 'Username is already in use' } as ApiResponse<null>);
        return;
      }
    }

    user.name = name;
    user.email = email;
    user.username = username;
    user.role = role;
    user.courses = courses.map((courseId: string) => new mongoose.Types.ObjectId(courseId));
    user.groups = groups.map((groupId: string) => new mongoose.Types.ObjectId(groupId));

    await user.save();

    const enhancedCourses = await Promise.all(user.courses.map(async courseId => ({
      _id: courseId.toString(),
      title: await getCourseTitle(courseId)
    })));

    const responseUser: EnhancedUser = {
      ...user.toObject(),
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
    } as ApiResponse<EnhancedUser>);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, error: 'Server error while updating user' } as ApiResponse<null>);
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' } as ApiResponse<null>);
      return;
    }
    res.json({ success: true, message: 'User deleted successfully' } as ApiResponse<null>);
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, error: 'Server error while deleting user' } as ApiResponse<null>);
  }
};

export const setUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, role } = req.body;
    if (!['user', 'admin', 'moderator', 'instructor'].includes(role)) {
      res.status(400).json({ success: false, error: 'Invalid role' } as ApiResponse<null>);
      return;
    }
    const user = await User.findByIdAndUpdate(userId, { 'role.name': role }, { new: true });
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' } as ApiResponse<null>);
      return;
    }
    res.json({ success: true, data: user } as ApiResponse<UserType>);
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ success: false, error: 'Server error' } as ApiResponse<null>);
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
      _id: courseId.toString(),
      title: await getCourseTitle(courseId)
    })));

    const updatedUser: EnhancedUser = {
      ...user.toObject(),
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
      _id: courseId.toString(),
      title: await getCourseTitle(courseId)
    })));

    const updatedUser: EnhancedUser = {
      ...user.toObject(),
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

    res.json({ success: true, data: updatedUser } as ApiResponse<EnhancedUser>);
  } catch (error) {
    console.error('Error removing course from user:', error);
    res.status(500).json({ success: false, error: 'Server error' } as ApiResponse<null>);
  }
};


export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' } as ApiResponse<null>);
      return;
    }

    const enhancedCourses = await Promise.all(user.courses.map(async courseId => ({
      _id: courseId.toString(),
      title: await getCourseTitle(courseId)
    })));

    const enhancedUser: EnhancedUser = {
      ...user.toObject(),
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

    res.json({ success: true, data: enhancedUser } as ApiResponse<EnhancedUser>);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ success: false, error: 'Server error' } as ApiResponse<null>);
  }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' } as ApiResponse<null>);
      return;
    }

    // Update only allowed fields
    const allowedFields = ['name', 'email', 'phone', 'username', 'dateOfBirth', 'address', 'city', 'country', 'bio', 'avatar'];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        (user as any)[field] = updateData[field];
      }
    });

    await user.save();

    const enhancedCourses = await Promise.all(user.courses.map(async courseId => ({
      _id: courseId.toString(),
      title: await getCourseTitle(courseId)
    })));

    const updatedUser: EnhancedUser = {
      ...user.toObject(),
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

    res.json({ success: true, data: updatedUser } as ApiResponse<EnhancedUser>);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ success: false, error: 'Server error' } as ApiResponse<null>);
  }
};

export default {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  setUserRole,
  addCourseToUser,
  removeCourseFromUser,
  getUserById,
  updateUserProfile
};