import mongoose, { Schema, Document } from 'mongoose';
import { Section } from '../types/models.js';

const SectionSchema: Schema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  order: { type: Number, required: true },
  isOptional: { type: Boolean, default: false },
  learningObjectives: [{ type: String }],
  estimatedCompletionTime: { type: Number },
  unlockDate: { type: Date },
  quizzes: [{ type: Schema.Types.ObjectId, ref: 'Quiz' }],
  assignments: [{ type: Schema.Types.ObjectId, ref: 'Assignment' }]
}, {
  timestamps: true
});

const SectionModel = mongoose.model<Section & Document>('Section', SectionSchema);

export default SectionModel;
export { SectionSchema };