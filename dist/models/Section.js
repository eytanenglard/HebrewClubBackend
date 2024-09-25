import mongoose, { Schema } from 'mongoose';
const SectionSchema = new Schema({
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
const SectionModel = mongoose.model('Section', SectionSchema);
export default SectionModel;
export { SectionSchema };
//# sourceMappingURL=Section.js.map