import mongoose, { Schema, Document } from 'mongoose';
import { Course as CourseEnrollmentType } from '../types/models';

export interface Course extends CourseEnrollmentType, Document {}

const courseEnrollmentSchema: Schema = new Schema({
  userId: { type: String },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  courseTitle: { type: String, required: true },
  enrollmentDate: { type: Date, default: Date.now },
  completionDate: { type: Date },
  progress: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'dropped'], 
    default: 'active' 
  },
  grade: { type: Number },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  paymentOption: { 
    type: String, 
    enum: ['full', 'installments'] 
  },
  promoCode: { type: String }
});

export default mongoose.model<CourseEnrollmentDocument>('CourseEnrollment', courseEnrollmentSchema);