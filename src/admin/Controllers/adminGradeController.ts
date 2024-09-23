import { Request, Response } from 'express';
import Grade from '../../models/Grade';
import { Grade as GradeType, ApiResponse } from '../../types/models';

export const getGradeManagementData = async (req: Request, res: Response): Promise<void> => {
  try {
    const grades = await Grade.find()
      .populate('userId', 'name email')
      .populate('courseId', 'title')
      .populate('assignmentId', 'title');
    res.json({ success: true, data: grades } as ApiResponse<GradeType[]>);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching grade data' } as ApiResponse<null>);
  }
};

export const createGrade = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, courseId, assignmentId, score, feedback } = req.body;
    const newGrade = new Grade({
      userId,
      courseId,
      assignmentId,
      score,
      feedback,
      submittedAt: new Date(),
      gradedAt: new Date()
    });
    await newGrade.save();
    res.status(201).json({ success: true, data: newGrade } as ApiResponse<GradeType>);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error creating grade' } as ApiResponse<null>);
  }
};

export const updateGrade = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { score, feedback } = req.body;
    const updatedGrade = await Grade.findByIdAndUpdate(
      id,
      { score, feedback, gradedAt: new Date() },
      { new: true }
    )
      .populate('userId', 'name email')
      .populate('courseId', 'title')
      .populate('assignmentId', 'title');
    if (!updatedGrade) {
      res.status(404).json({ success: false, error: 'Grade not found' } as ApiResponse<null>);
      return;
    }
    res.json({ success: true, data: updatedGrade } as ApiResponse<GradeType>);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error updating grade' } as ApiResponse<null>);
  }
};

export const deleteGrade = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedGrade = await Grade.findByIdAndDelete(id);
    if (!deletedGrade) {
      res.status(404).json({ success: false, error: 'Grade not found' } as ApiResponse<null>);
      return;
    }
    res.json({ success: true, message: 'Grade deleted successfully' } as ApiResponse<null>);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error deleting grade' } as ApiResponse<null>);
  }
};