import { Request, Response } from 'express';
import User from '../models/User';
import Course from '../models/Course';
import { ApiResponse } from '../types/models';

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId).select('-password').populate('courses');
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' } as ApiResponse<null>);
      return;
    }
    res.json({ success: true, data: user } as ApiResponse<typeof user>);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, error: 'Server error' } as ApiResponse<null>);
  }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, email } = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { name, email } },
      { new: true, runValidators: true }
    ).select('-password').populate('courses');

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' } as ApiResponse<null>);
      return;
    }

    res.json({ success: true, data: user } as ApiResponse<typeof user>);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ success: false, error: 'Server error' } as ApiResponse<null>);
  }
};

export default {
  getUserProfile,
  updateUserProfile
};