import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Course from '../models/Course';
import Lead from '../models/Lead';
import User from '../models/User';
import { Course as CourseType, Lead as LeadType, ApiResponse } from '../types/models';
import { sendCourseWelcomeEmail } from '../utils/emailService';

// Helper function to convert _id to string
const convertIdToString = (doc: any) => {
  const convertedDoc = doc.toObject();
  convertedDoc._id = convertedDoc._id.toString();
  if (Array.isArray(convertedDoc.courseInterest)) {
    convertedDoc.courseInterest = convertedDoc.courseInterest.map((id: mongoose.Types.ObjectId) => id.toString());
  }
  return convertedDoc;
};

// Updated helper function to convert string or ObjectId to ObjectId
const toObjectId = (id: string | mongoose.Types.ObjectId): mongoose.Types.ObjectId => {
  return typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;
};

export const enrollInCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const leadData: Partial<LeadType> = req.body;
    
    console.log('Received lead data:', JSON.stringify(leadData, null, 2));

    // Validate required fields
    if (!leadData.name || !leadData.email || !leadData.phone || !leadData.courseInterest) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields'
      } as ApiResponse<null>);
      return;
    }

    // Remove _id from leadData if it exists
    delete leadData._id;

    // Ensure courseInterest is an array of valid ObjectIds
    if (leadData.courseInterest) {
      const courseInterests = Array.isArray(leadData.courseInterest) 
        ? leadData.courseInterest 
        : [leadData.courseInterest];

      leadData.courseInterest = courseInterests.filter(id => mongoose.Types.ObjectId.isValid(id.toString()));

      console.log('Validated courseInterest:', leadData.courseInterest);

      if (leadData.courseInterest.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid courseInterest'
        } as ApiResponse<null>);
        return;
      }
    }

    // Check if the lead already exists
    let lead = await Lead.findOne({ email: leadData.email });
    let isNewLead = false;
    let updatedCourseInterests: mongoose.Types.ObjectId[] = [];

    if (lead) {
      console.log('Existing lead found:', JSON.stringify(lead, null, 2));
      
      // Update existing lead
      const existingCourseInterests = lead.courseInterest.map(id => id.toString());
      const newCourseInterests = leadData.courseInterest!.map(id => id.toString());
      
      console.log('Existing course interests:', existingCourseInterests);
      console.log('New course interests:', newCourseInterests);

      updatedCourseInterests = [...new Set([...existingCourseInterests, ...newCourseInterests])]
        .map(id => new mongoose.Types.ObjectId(id));
      
      console.log('Updated course interests:', updatedCourseInterests);

      lead.courseInterest = updatedCourseInterests;
      Object.assign(lead, { ...leadData, courseInterest: lead.courseInterest });
    } else {
      console.log('Creating new lead');
      // Create new lead
      lead = new Lead(leadData);
      isNewLead = true;
      updatedCourseInterests = leadData.courseInterest!.map(id => new mongoose.Types.ObjectId(id));
    }

    // Save the lead
    try {
      await lead.save();
      console.log('Lead saved successfully:', JSON.stringify(lead, null, 2));
    } catch (error) {
      console.error('Error saving lead:', error);
      res.status(400).json({
        success: false,
        error: 'Error saving lead: ' + (error instanceof Error ? error.message : 'Unknown error')
      } as ApiResponse<null>);
      return;
    }

    // Convert _id to string before sending the response
    const convertedLead = convertIdToString(lead);

    const responseMessage = isNewLead 
      ? 'New lead created with course interest' 
      : `Lead updated. Course interests: ${updatedCourseInterests.map(id => id.toString()).join(', ')}`;

    res.status(isNewLead ? 201 : 200).json({ 
      success: true, 
      message: responseMessage, 
      data: convertedLead 
    } as ApiResponse<LeadType>);
  } catch (error) {
    console.error('Error processing course enrollment request:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error while processing enrollment request' 
    } as ApiResponse<null>);
  }
};

export const getCourseEnrollment = async (req: Request, res: Response): Promise<void> => {
  try {
    const leadId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid lead ID'
      } as ApiResponse<null>);
      return;
    }

    const lead = await Lead.findById(toObjectId(leadId));

    if (!lead) {
      res.status(404).json({
        success: false,
        error: 'Lead not found'
      } as ApiResponse<null>);
      return;
    }

    // Convert _id to string before sending the response
    const convertedLead = convertIdToString(lead);

    res.json({
      success: true,
      data: convertedLead
    } as ApiResponse<LeadType>);
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching lead'
    } as ApiResponse<null>);
  }
};

export const updateCourseEnrollment = async (req: Request, res: Response): Promise<void> => {
  try {
    const leadId = req.params.id;
    const updateData: Partial<LeadType> = req.body;

    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid lead ID'
      } as ApiResponse<null>);
      return;
    }

    // If courseInterest is provided, ensure it's an array of valid ObjectIds
    if (updateData.courseInterest) {
      const courseInterests = Array.isArray(updateData.courseInterest)
        ? updateData.courseInterest
        : [updateData.courseInterest];

      updateData.courseInterest = courseInterests.filter(id => mongoose.Types.ObjectId.isValid(id.toString()));

      if (updateData.courseInterest.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid courseInterest'
        } as ApiResponse<null>);
        return;
      }
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      toObjectId(leadId),
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedLead) {
      res.status(404).json({
        success: false,
        error: 'Lead not found'
      } as ApiResponse<null>);
      return;
    }

    // Convert _id to string before sending the response
    const convertedLead = convertIdToString(updatedLead);

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: convertedLead
    } as ApiResponse<LeadType>);
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while updating lead'
    } as ApiResponse<null>);
  }
};

export const getAllCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const courses = await Course.find({});

    // Convert _id to string for all courses
    const convertedCourses = courses.map(convertIdToString);

    res.json({
      success: true,
      data: convertedCourses
    } as ApiResponse<CourseType[]>);
  } catch (error) {
    console.error('Error fetching all courses:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching all courses'
    } as ApiResponse<null>);
  }
};

export const getCourseDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid course ID'
      } as ApiResponse<null>);
      return;
    }

    const course = await Course.findById(toObjectId(courseId));

    if (!course) {
      res.status(404).json({
        success: false,
        error: 'Course not found'
      } as ApiResponse<null>);
      return;
    }

    // Convert _id to string before sending the response
    const convertedCourse = convertIdToString(course);

    res.json({
      success: true,
      data: convertedCourse
    } as ApiResponse<CourseType>);
  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching course details'
    } as ApiResponse<null>);
  }
};

export const associateCourseWithUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, courseId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(courseId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid user ID or course ID'
      } as ApiResponse<null>);
      return;
    }

    const user = await User.findById(toObjectId(userId));
    const course = await Course.findById(toObjectId(courseId));

    if (!user || !course) {
      res.status(404).json({
        success: false,
        error: 'User or course not found'
      } as ApiResponse<null>);
      return;
    }

    if (user.courses && user.courses.some(id => id.equals(toObjectId(courseId)))) {
      res.status(400).json({
        success: false,
        error: 'Course is already associated with the user'
      } as ApiResponse<null>);
      return;
    }

    user.courses = user.courses || [];
    user.courses.push(toObjectId(courseId));
    await user.save();

    // Send welcome email
    try {
      await sendCourseWelcomeEmail(user.email, user.name, course.title);
    } catch (error) {
      console.error('Failed to send course welcome email:', error);
      // Note: We're not returning here, as we still want to complete the association
    }

    res.json({
      success: true,
      message: 'Course associated with user successfully and welcome email sent',
      data: { userId, courseId }
    } as ApiResponse<{ userId: string, courseId: string }>);
  } catch (error) {
    console.error('Error associating course with user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while associating course with user'
    } as ApiResponse<null>);
  }
}; 

export default {
  enrollInCourse,
  getCourseEnrollment,
  updateCourseEnrollment,
  getAllCourses,
  getCourseDetails,
  associateCourseWithUser,
};