import { Request, Response } from 'express';
import User from '../../models/User';
import Course from '../../models/Course';
import Payment from '../../models/Payment';
import Lead from '../../models/Lead';
import { ApiResponse } from '../../types/models';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const userCount = await User.countDocuments();
    const courseCount = await Course.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const recentPayments = await Payment.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name')
      .populate('courseId', 'title');
    const newLeadsCount = await Lead.countDocuments({ 
      createdAt: { $gte: new Date(Date.now() - 30*24*60*60*1000) }
    });
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    res.json({
      success: true,
      data: {
        userCount,
        courseCount,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentPayments,
        newLeadsCount,
        userGrowth
      }
    } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching dashboard stats' } as ApiResponse<null>);
  }
};

export const getUserGrowthStats = async (req: Request, res: Response) => {
  try {
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);
    res.json({ success: true, data: userGrowth } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching user growth stats' } as ApiResponse<null>);
  }
};

export const getCoursePopularityStats = async (req: Request, res: Response) => {
  try {
    const coursePopularity = await Course.aggregate([
      {
        $project: {
          title: 1,
          userCount: { $size: "$users" }
        }
      },
      { $sort: { userCount: -1 } },
      { $limit: 10 }
    ]);
    res.json({ success: true, data: coursePopularity } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching course popularity stats' } as ApiResponse<null>);
  }
};

export const getRevenueStats = async (req: Request, res: Response) => {
  try {
    const revenueStats = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);
    res.json({ success: true, data: revenueStats } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching revenue stats' } as ApiResponse<null>);
  }
};