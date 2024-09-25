import mongoose, { Schema } from 'mongoose';
const InstructorInfoSchema = new Schema({
    _id: { type: Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
});
const CourseSchema = new Schema({
    courseId: { type: String, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    instructors: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    duration: { type: Number, required: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    price: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    maxParticipants: { type: Number, required: true },
    minParticipants: { type: Number, required: true },
    status: { type: String, enum: ['active', 'inactive', 'full', 'draft', 'archived'], default: 'draft' },
    prerequisites: [{ type: String }],
    tags: [{ type: String }],
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    completionRate: { type: Number, default: 0 },
    sections: [{ type: Schema.Types.ObjectId, ref: 'Section' }],
    rating: { type: Number, default: 0 },
    icon: { type: String },
    features: [{ type: String }],
    options: [{ type: String }],
    recommended: { type: Boolean, default: false },
    videoUrl: { type: String },
    downloadUrl: { type: String },
    thumbnail: { type: String },
    syllabus: { type: String },
    learningObjectives: [{ type: String }],
    estimatedCompletionTime: { type: Number },
    language: { type: String, required: true },
    certificationOffered: { type: Boolean, default: false },
    enrollmentDeadline: { type: Date },
    refundPolicy: { type: String },
    discussionForumEnabled: { type: Boolean, default: true },
    allowGuestPreview: { type: Boolean, default: false },
    courseFormat: { type: String, enum: ['online', 'blended', 'in-person'], required: true },
    nextStartDate: { type: Date },
    prerequisiteCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    ageGroup: { type: String, required: true },
    courseType: { type: String, enum: ['recorded', 'live'], required: true },
    possibleStartDates: [{ type: Date }]
}, {
    timestamps: true
});
CourseSchema.pre('save', function (next) {
    if (this.isNew) {
        this.courseId = this._id.toString();
    }
    next();
});
const CourseModel = mongoose.model('Course', CourseSchema);
export default CourseModel;
export { CourseSchema, InstructorInfoSchema };
