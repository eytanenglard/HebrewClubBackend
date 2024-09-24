import mongoose, { Schema, Document } from 'mongoose';
import { User} from '../types/models';
import bcrypt from 'bcryptjs';

const UserRoleSchema: Schema = new Schema({
  name: { type: String, enum: ['user', 'admin', 'moderator', 'instructor'], required: true },
  permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }]
});

const CourseEnrollmentSchema: Schema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  enrollmentDate: { type: Date, required: true },
  completionDate: { type: Date },
  progress: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'dropped'], default: 'active' },
  grade: { type: Number }
});

const CertificateSchema: Schema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  issueDate: { type: Date, required: true },
  certificateUrl: { type: String, required: true }
});

const UserPreferencesSchema: Schema = new Schema({
  language: { type: String, default: 'en' },
  emailNotifications: { type: Boolean, default: true },
  darkMode: { type: Boolean, default: false }
});

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: UserRoleSchema, required: true },
  groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
  courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  completedLessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  progress: { type: Map, of: Number },
  twoFactorSecret: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  googleId: { type: String },
  facebookId: { type: String },
  emailVerificationToken: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  jwtSecret: { type: String },
  lastLogin: { type: Date },
  status: { type: String, enum: ['active', 'inactive', 'locked'], default: 'active' },
  failedLoginAttempts: { type: Number, default: 0 },
  avatar: { type: String },
  dateOfBirth: { type: Date },
  address: { type: String },
  city: { type: String },
  country: { type: String },
  bio: { type: String },
  courseEnrollments: [CourseEnrollmentSchema],
  certificates: [CertificateSchema],
  preferences: UserPreferencesSchema,
  passwordResetAttempts: { type: Number, default: 0 },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  isLocked: { type: Boolean, default: false },
  emailVerificationExpires: { type: Date },
  lockUntil: { type: Date },
  emailVerificationCode: { type: String },
  pendingCourseId: { type: String }, 
}, { 
  timestamps: true 
});

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

UserSchema.methods.hasPermission = function(permission: string): boolean {
  return this.role.permissions.includes(permission);
};

interface UserDocument extends Omit<User, '_id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  hasPermission(permission: string): boolean;
  emailVerificationToken?: string;
  
  emailVerificationCode?: string; // הוספת שדה חדש
  emailVerificationExpires?: Date;
  isEmailVerified: boolean;
  pendingCourseId?: string; 
}

UserSchema.pre<UserDocument>('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

const UserModel = mongoose.model<UserDocument>('User', UserSchema);

export default UserModel;
export { UserDocument, UserSchema, UserRoleSchema, CourseEnrollmentSchema, CertificateSchema, UserPreferencesSchema };