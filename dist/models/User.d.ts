import mongoose, { Schema, Document } from 'mongoose';
import { User } from '../types/models';
declare const UserRoleSchema: Schema;
declare const CourseEnrollmentSchema: Schema;
declare const CertificateSchema: Schema;
declare const UserPreferencesSchema: Schema;
declare const UserSchema: Schema;
interface UserDocument extends Omit<User, '_id'>, Document {
    comparePassword(candidatePassword: string): Promise<boolean>;
    hasPermission(permission: string): boolean;
    emailVerificationToken?: string;
    emailVerificationCode?: string;
    emailVerificationExpires?: Date;
    isEmailVerified: boolean;
    pendingCourseId?: string;
}
declare const UserModel: mongoose.Model<UserDocument, {}, {}, {}, mongoose.Document<unknown, {}, UserDocument> & UserDocument & Required<{
    _id: unknown;
}>, any>;
export default UserModel;
export { UserDocument, UserSchema, UserRoleSchema, CourseEnrollmentSchema, CertificateSchema, UserPreferencesSchema };
