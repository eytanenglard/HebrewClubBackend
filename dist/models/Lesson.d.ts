import mongoose, { Schema } from 'mongoose';
import { Lesson, ContentItem, Quiz, QuizQuestion } from '../types/models';
declare const ContentItemSchema: Schema;
declare const QuizQuestionSchema: Schema;
declare const QuizSchema: Schema;
declare const LessonSchema: Schema;
declare const LessonModel: mongoose.Model<Lesson & mongoose.Document<unknown, any, any>, {}, {}, {}, mongoose.Document<unknown, {}, Lesson & mongoose.Document<unknown, any, any>> & Lesson & mongoose.Document<unknown, any, any> & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>;
declare const QuizModel: mongoose.Model<Quiz & mongoose.Document<unknown, any, any>, {}, {}, {}, mongoose.Document<unknown, {}, Quiz & mongoose.Document<unknown, any, any>> & Quiz & mongoose.Document<unknown, any, any> & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>;
declare const QuizQuestionModel: mongoose.Model<QuizQuestion & mongoose.Document<unknown, any, any>, {}, {}, {}, mongoose.Document<unknown, {}, QuizQuestion & mongoose.Document<unknown, any, any>> & QuizQuestion & mongoose.Document<unknown, any, any> & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>;
declare const ContentItemModel: mongoose.Model<ContentItem & mongoose.Document<unknown, any, any>, {}, {}, {}, mongoose.Document<unknown, {}, ContentItem & mongoose.Document<unknown, any, any>> & ContentItem & mongoose.Document<unknown, any, any> & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>;
export default LessonModel;
export { LessonSchema, QuizSchema, QuizQuestionSchema, ContentItemSchema, QuizModel, QuizQuestionModel, ContentItemModel };
