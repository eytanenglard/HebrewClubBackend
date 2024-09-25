import mongoose, { Schema } from 'mongoose';
import { Course } from '../types/models';
declare const InstructorInfoSchema: Schema;
declare const CourseSchema: Schema;
declare const CourseModel: mongoose.Model<Course & mongoose.Document<unknown, any, any>, {}, {}, {}, mongoose.Document<unknown, {}, Course & mongoose.Document<unknown, any, any>> & Course & mongoose.Document<unknown, any, any> & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>;
export default CourseModel;
export { CourseSchema, InstructorInfoSchema };
