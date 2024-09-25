import mongoose, { Schema } from 'mongoose';
const ContentItemSchema = new Schema({
    _id: { type: Schema.Types.ObjectId, auto: true },
    type: { type: String, enum: ['text', 'video', 'audio', 'interactive', 'quiz', 'document', 'link', 'code-snippet'], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    data: { type: String, required: true }, // URL or content
    duration: { type: Number },
    size: { type: Number },
    fileType: { type: String },
    order: { type: Number, required: true },
    tags: [{ type: String }],
    version: { type: String, required: true },
    lastUpdated: { type: Date, default: Date.now },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    transcriptUrl: { type: String },
    captionsUrl: { type: String },
    interactivityType: { type: String, enum: ['poll', 'quiz', 'discussion'] }
});
const QuizQuestionSchema = new Schema({
    _id: { type: Schema.Types.ObjectId, auto: true },
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true }
});
const QuizSchema = new Schema({
    _id: { type: Schema.Types.ObjectId, auto: true },
    title: { type: String, required: true },
    questions: [{ type: Schema.Types.ObjectId, ref: 'QuizQuestion' }],
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true }
});
const LessonSchema = new Schema({
    _id: { type: Schema.Types.ObjectId, auto: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    contentItems: [{ type: Schema.Types.ObjectId, ref: 'ContentItem' }],
    order: { type: Number, required: true },
    isOptional: { type: Boolean, default: false },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    learningObjectives: [{ type: String }],
    assignments: [{ type: Schema.Types.ObjectId, ref: 'Assignment' }],
    estimatedCompletionTime: { type: Number }, // in minutes
    type: { type: String, enum: ['video', 'text', 'interactive', 'live-session'], required: true },
    liveSessionDate: { type: Date },
    prerequisiteLessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
    nextLessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    previousLessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' }
});
const LessonModel = mongoose.model('Lesson', LessonSchema);
const QuizModel = mongoose.model('Quiz', QuizSchema);
const QuizQuestionModel = mongoose.model('QuizQuestion', QuizQuestionSchema);
const ContentItemModel = mongoose.model('ContentItem', ContentItemSchema);
export default LessonModel;
export { LessonSchema, QuizSchema, QuizQuestionSchema, ContentItemSchema, QuizModel, QuizQuestionModel, ContentItemModel };
