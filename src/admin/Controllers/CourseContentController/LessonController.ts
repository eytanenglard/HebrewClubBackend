import { Request, Response } from 'express';
import Section from '../../../models/Section.js';
import Lesson from '../../../models/Lesson.js';
import { Lesson as LessonType, LessonData, ApiResponse } from '../../../types/models.js';
import mongoose from 'mongoose';

export const createLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const sectionId = new mongoose.Types.ObjectId(req.params.sectionId);
    const lessonData: LessonData = req.body;

    const section = await Section.findById(sectionId);
    if (!section) {
      res.status(404).json({ success: false, error: 'Section not found' } as ApiResponse<null>);
      return;
    }

    const newLesson = new Lesson({
      ...lessonData,
      sectionId: sectionId
    });

    const savedLesson = await newLesson.save();

    await Section.findByIdAndUpdate(
      sectionId,
      { $push: { lessons: savedLesson._id } }
    );

    res.status(201).json({ 
      success: true, 
      data: savedLesson,
      message: 'Lesson added to section successfully'
    } as ApiResponse<LessonType>);
  } catch (error) {
    console.error('Error in createLesson:', error);
    res.status(500).json({ success: false, error: 'Server error while adding lesson to section' } as ApiResponse<null>);
  }
};

export const getLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const lessonId = new mongoose.Types.ObjectId(req.params.id);
    const lesson = await Lesson.findById(lessonId).populate('contentItems');
    if (!lesson) {
      res.status(404).json({ success: false, error: 'Lesson not found' } as ApiResponse<null>);
      return;
    }
    res.json({ success: true, data: lesson } as ApiResponse<LessonType>);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching lesson' } as ApiResponse<null>);
  }
};

export const updateLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const lessonId = new mongoose.Types.ObjectId(req.params.id);
    const updateData: Partial<LessonData> = req.body;

    const lesson = await Lesson.findByIdAndUpdate(lessonId, updateData, { new: true });
    if (!lesson) {
      res.status(404).json({ success: false, error: 'Lesson not found' } as ApiResponse<null>);
      return;
    }
    res.json({ 
      success: true, 
      data: lesson
    } as ApiResponse<LessonType>);
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ success: false, error: 'Server error while updating lesson' } as ApiResponse<null>);
  }
};

export const deleteLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const lessonId = new mongoose.Types.ObjectId(req.params.id);

    const lesson = await Lesson.findByIdAndDelete(lessonId);
    if (!lesson) {
      res.status(404).json({ success: false, error: 'Lesson not found' } as ApiResponse<null>);
      return;
    }

    await Section.findByIdAndUpdate(
      lesson.sectionId,
      { $pull: { lessons: lessonId } }
    );

    res.json({ success: true, message: 'Lesson deleted successfully' } as ApiResponse<null>);
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ success: false, error: 'Server error while deleting lesson' } as ApiResponse<null>);
  }
};
export const getLessons = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Received query:', req.query);  // Log the received query for debugging

    let sectionIds: string[];

    // Check if sectionIds is an array or a single value
    if (Array.isArray(req.query.sectionIds)) {
      sectionIds = req.query.sectionIds as string[];
    } else if (typeof req.query.sectionIds === 'string') {
      sectionIds = [req.query.sectionIds];
    } else {
      res.status(400).json({ success: false, error: 'Invalid sectionIds parameter' } as ApiResponse<null>);
      return;
    }

    console.log('Processed sectionIds:', sectionIds);  // Log the processed sectionIds

    // Validate and convert each sectionId to ObjectId
    const objectIdSectionIds = sectionIds.map(id => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid section ID: ${id}`);
      }
      return new mongoose.Types.ObjectId(id);
    });

    const lessons = await Lesson.find({ sectionId: { $in: objectIdSectionIds } }).populate('contentItems');
    
    console.log(`Found ${lessons.length} lessons`);  // Log the number of lessons found

    res.json({ 
      success: true, 
      data: lessons
    } as ApiResponse<LessonType[]>);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching lessons' } as ApiResponse<null>);
  }
};