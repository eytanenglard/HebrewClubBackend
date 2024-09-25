import { Request, Response } from 'express';
import Course from '../../../models/Course.js';
import Section from '../../../models/Section.js';
import { Section as SectionType, SectionData, ApiResponse } from '../../../types/models.js';
import mongoose from 'mongoose';

export const createSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = new mongoose.Types.ObjectId(req.params.courseId);
    const sectionData: SectionData = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ success: false, error: 'Course not found' } as ApiResponse<null>);
      return;
    }

    const newSection = new Section({
      ...sectionData,
      courseId: courseId
    });

    const savedSection = await newSection.save();
    
    await Course.findByIdAndUpdate(courseId, { $push: { sections: savedSection._id } });

    res.status(201).json({ 
      success: true, 
      data: savedSection,
      message: 'Section added to course successfully'
    } as ApiResponse<SectionType>);
  } catch (error) {
    console.error('Error adding section to course:', error);
    res.status(500).json({ success: false, error: 'Server error while adding section to course' } as ApiResponse<null>);
  }
};

export const getSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const sectionId = new mongoose.Types.ObjectId(req.params.id);
    const section = await Section.findById(sectionId).populate('lessons');
    if (!section) {
      res.status(404).json({ success: false, error: 'Section not found' } as ApiResponse<null>);
      return;
    }
    res.json({ success: true, data: section } as ApiResponse<SectionType>);
  } catch (error) {
    console.error('Error fetching section:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching section' } as ApiResponse<null>);
  }
};

export const updateSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const sectionId = new mongoose.Types.ObjectId(req.params.id);
    const updateData: Partial<SectionData> = req.body;

    const section = await Section.findByIdAndUpdate(sectionId, updateData, { new: true });
    if (!section) {
      res.status(404).json({ success: false, error: 'Section not found' } as ApiResponse<null>);
      return;
    }
    res.json({ 
      success: true, 
      data: section
    } as ApiResponse<SectionType>);
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ success: false, error: 'Server error while updating section' } as ApiResponse<null>);
  }
};

export const deleteSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const sectionId = new mongoose.Types.ObjectId(req.params.id);

    const section = await Section.findByIdAndDelete(sectionId);
    if (!section) {
      res.status(404).json({ success: false, error: 'Section not found' } as ApiResponse<null>);
      return;
    }

    await Course.findByIdAndUpdate(
      section.courseId,
      { $pull: { sections: sectionId } }
    );

    res.json({ success: true, message: 'Section deleted successfully' } as ApiResponse<null>);
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ success: false, error: 'Server error while deleting section' } as ApiResponse<null>);
  }
};

export const getSections = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = new mongoose.Types.ObjectId(req.params.courseId);
    const sections = await Section.find({ courseId }).populate('lessons');
    
    res.json({ 
      success: true, 
      data: sections
    } as ApiResponse<SectionType[]>);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching sections' } as ApiResponse<null>);
  }
};