import mongoose from 'mongoose';
type WithStringId<T> = Omit<T, '_id'> & {
    _id: string;
};
export interface UserRole {
    name: 'user' | 'admin' | 'moderator' | 'instructor';
    permissions: mongoose.Types.ObjectId[];
}
export interface UserRoleResponse extends Omit<UserRole, 'permissions'> {
    permissions: string[];
}
export interface User {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    username: string;
    password: string;
    role: UserRole;
    groups: mongoose.Types.ObjectId[];
    courses: mongoose.Types.ObjectId[];
    completedLessons: mongoose.Types.ObjectId[];
    progress: {
        [courseId: string]: number;
    };
    twoFactorSecret?: string;
    twoFactorEnabled: boolean;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    googleId?: string;
    facebookId?: string;
    emailVerificationToken?: string;
    isEmailVerified: boolean;
    jwtSecret?: string;
    lastLogin: Date;
    status: 'active' | 'inactive' | 'locked';
    failedLoginAttempts: number;
    avatar?: string;
    dateOfBirth?: Date;
    address?: string;
    city?: string;
    country?: string;
    bio?: string;
    createdAt: Date;
    updatedAt: Date;
    certificates: Certificate[];
    preferences: UserPreferences;
    comparePassword(candidatePassword: string): Promise<boolean>;
    passwordResetAttempts: number;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    isLocked: boolean;
    lockUntil?: Date;
    emailVerificationExpires?: Date;
    emailVerificationCode?: string;
    pendingCourseId?: string;
}
export type UserResponse = WithStringId<Omit<User, 'role' | 'groups' | 'courses' | 'completedLessons' | 'certificates'>> & {
    role: UserRoleResponse;
    groups: string[];
    courses: string[];
    completedLessons: string[];
    certificates: CertificateResponse[];
};
export interface EnhancedUser extends Omit<UserResponse, 'courses'> {
    courses: string[];
    enhancedCourses: Array<{
        _id: string;
        title: string;
    }>;
}
export interface UserData {
    name: string;
    email: string;
    phone?: string;
    username: string;
    password: string;
    role: UserRole;
    dateOfBirth?: Date;
    avatar?: string;
    status: 'active' | 'inactive' | 'locked';
}
export interface UserProfile {
    name: string;
    email: string;
    phone: string;
    username: string;
    avatar?: string;
    bio?: string;
    dateOfBirth?: Date;
    address?: string;
    city?: string;
    country?: string;
    groups: string[];
}
export interface EditableUserProfile {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    username?: string;
    dateOfBirth?: string;
    address?: string;
    city?: string;
    country?: string;
    bio?: string;
    avatar?: string;
    role?: string;
    createdAt?: string;
    updatedAt?: string;
    twoFactorEnabled?: boolean;
    isEmailVerified?: boolean;
    status?: 'active' | 'inactive' | 'locked';
    failedLoginAttempts?: number;
}
export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    newUsersThisMonth: number;
    usersByRole: {
        [key: string]: number;
    };
}
export interface UserActivity {
    userId: string;
    action: string;
    timestamp: Date;
    details: any;
}
export interface InstructorInfo {
    _id: mongoose.Types.ObjectId;
    name: string;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export type InstructorInfoResponse = WithStringId<Omit<InstructorInfo, 'userId'>> & {
    userId: string;
};
export interface Certificate {
    courseId: mongoose.Types.ObjectId;
    issueDate: Date;
    certificateUrl: string;
}
export type CertificateResponse = Omit<Certificate, 'courseId'> & {
    courseId: string;
};
export interface UserPreferences {
    language: string;
    emailNotifications: boolean;
    darkMode: boolean;
}
export interface Course {
    _id: mongoose.Types.ObjectId;
    courseId: string;
    title: string;
    description: string;
    category: string;
    instructors: mongoose.Types.ObjectId[];
    duration: number;
    level: 'beginner' | 'intermediate' | 'advanced';
    price: number;
    startDate: Date;
    endDate: Date;
    maxParticipants: number;
    status: 'active' | 'inactive' | 'full' | 'draft' | 'archived';
    prerequisites: string[];
    tags: string[];
    users: mongoose.Types.ObjectId[];
    completionRate: number;
    sections: mongoose.Types.ObjectId[];
    rating: number;
    createdAt: Date;
    updatedAt: Date;
    icon?: string;
    features: string[];
    options: string[];
    recommended: boolean;
    videoUrl?: string;
    downloadUrl?: string;
    thumbnail?: string;
    syllabus: string;
    learningObjectives: string[];
    estimatedCompletionTime: number;
    language: string;
    certificationOffered: boolean;
    enrollmentDeadline?: Date;
    refundPolicy?: string;
    discussionForumEnabled: boolean;
    allowGuestPreview: boolean;
    courseFormat: 'online' | 'blended' | 'in-person';
    nextStartDate?: Date;
    prerequisiteCourses?: mongoose.Types.ObjectId[];
    ageGroup: string;
    minParticipants: number;
    courseType: 'recorded' | 'live';
}
export type CourseResponse = WithStringId<Omit<Course, 'instructors' | 'users' | 'sections' | 'prerequisiteCourses'>> & {
    instructors: string[];
    users: string[];
    sections: string[];
    prerequisiteCourses?: string[];
    minParticipants: number;
    courseType: 'recorded' | 'live';
    possibleStartDates?: any[];
};
export interface CourseData {
    title: string;
    description: string;
    category: string;
    instructors: string[];
    duration: number;
    level: 'beginner' | 'intermediate' | 'advanced';
    price: number;
    startDate: Date;
    endDate: Date;
    maxParticipants: number;
    status: 'active' | 'inactive' | 'full' | 'draft' | 'archived';
    prerequisites: string[];
    tags: string[];
    icon?: string;
    features: string[];
    options: string[];
    recommended: boolean;
    videoUrl?: string;
    downloadUrl?: string;
    thumbnail?: string;
    syllabus: string;
    learningObjectives: string[];
    estimatedCompletionTime: number;
    language: string;
    certificationOffered: boolean;
    enrollmentDeadline?: Date;
    refundPolicy?: string;
    discussionForumEnabled: boolean;
    allowGuestPreview: boolean;
    courseFormat: 'online' | 'blended' | 'in-person';
    nextStartDate?: Date;
    prerequisiteCourses?: string[];
    ageGroup: string;
    minParticipants: number;
    courseType: 'recorded' | 'live';
    possibleStartDates?: any[];
}
export interface Section {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    lessons: mongoose.Types.ObjectId[];
    courseId: mongoose.Types.ObjectId;
    order: number;
    isOptional?: boolean;
    learningObjectives: string[];
    estimatedCompletionTime: number;
    unlockDate?: Date;
    quizzes: mongoose.Types.ObjectId[];
    assignments: mongoose.Types.ObjectId[];
}
export type SectionResponse = WithStringId<Omit<Section, 'lessons' | 'courseId' | 'quizzes' | 'assignments'>> & {
    lessons: string[];
    courseId: string;
    quizzes: string[];
    assignments: string[];
};
export interface SectionData {
    title: string;
    description: string;
    order: number;
    isOptional?: boolean;
    courseId: string;
    learningObjectives: string[];
    estimatedCompletionTime: number;
    unlockDate?: Date;
}
export interface ContentItem {
    _id: mongoose.Types.ObjectId;
    type: 'text' | 'video' | 'audio' | 'interactive' | 'quiz' | 'document' | 'link' | 'code-snippet' | 'youtube';
    title: string;
    description: string;
    data: string;
    duration?: number;
    size?: number;
    fileType?: string;
    order: number;
    tags: string[];
    version: string;
    lastUpdated: Date;
    lessonId: mongoose.Types.ObjectId;
    transcriptUrl?: string;
    captionsUrl?: string;
    interactivityType?: 'poll' | 'quiz' | 'discussion';
}
export type ContentItemResponse = WithStringId<Omit<ContentItem, 'lessonId'>> & {
    lessonId: string;
};
export interface ContentItemData {
    type: 'text' | 'video' | 'audio' | 'interactive' | 'quiz' | 'document' | 'link' | 'code-snippet';
    title: string;
    description: string;
    data: string;
    duration?: number;
    size?: number;
    fileType?: string;
    order: number;
    tags: string[];
    version: string;
    lessonId: string;
    transcriptUrl?: string;
    captionsUrl?: string;
    interactivityType?: 'poll' | 'quiz' | 'discussion';
}
export interface Lesson {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    contentItems: mongoose.Types.ObjectId[];
    order: number;
    isOptional?: boolean;
    sectionId: mongoose.Types.ObjectId;
    learningObjectives: string[];
    assignments: mongoose.Types.ObjectId[];
    estimatedCompletionTime: number;
    type: 'video' | 'text' | 'interactive' | 'live-session';
    liveSessionDate?: Date;
    prerequisiteLessons?: mongoose.Types.ObjectId[];
    nextLessonId?: mongoose.Types.ObjectId;
    previousLessonId?: mongoose.Types.ObjectId;
}
export type LessonResponse = WithStringId<Omit<Lesson, 'contentItems' | 'sectionId' | 'assignments' | 'prerequisiteLessons' | 'nextLessonId' | 'previousLessonId'>> & {
    contentItems: string[];
    sectionId: string;
    assignments: string[];
    prerequisiteLessons?: string[];
    nextLessonId?: string;
    previousLessonId?: string;
};
export interface LessonData {
    title: string;
    description: string;
    order: number;
    isOptional?: boolean;
    sectionId: string;
    learningObjectives: string[];
    assignments: string[];
    estimatedCompletionTime: number;
    type: 'video' | 'text' | 'interactive' | 'live-session';
    liveSessionDate?: Date;
    prerequisiteLessons?: string[];
}
export interface Quiz {
    _id: mongoose.Types.ObjectId;
    title: string;
    questions: mongoose.Types.ObjectId[];
    lessonId: mongoose.Types.ObjectId;
}
export type QuizResponse = WithStringId<Omit<Quiz, 'questions' | 'lessonId'>> & {
    questions: string[];
    lessonId: string;
};
export interface QuizData {
    title: string;
    lessonId: string;
}
export interface QuizQuestion {
    _id: mongoose.Types.ObjectId;
    question: string;
    options: string[];
    correctAnswer: number;
    quizId: mongoose.Types.ObjectId;
}
export type QuizQuestionResponse = WithStringId<Omit<QuizQuestion, 'quizId'>> & {
    quizId: string;
};
export interface QuizQuestionData {
    question: string;
    options: string[];
    correctAnswer: number;
    quizId: string;
}
export interface PopulatedCourse extends Omit<Course, 'instructors' | 'users' | 'sections'> {
    instructors: User[];
    users: User[];
    sections: Section[];
}
export interface Bookmark {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    lessonId: mongoose.Types.ObjectId;
    time: number;
    label: string;
}
export type BookmarkResponse = WithStringId<Omit<Bookmark, 'userId' | 'lessonId'>> & {
    userId: string;
    lessonId: string;
};
export interface BookmarkData {
    userId: string;
    lessonId: string;
    time: number;
    label: string;
}
export interface Assignment {
    _id: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    dueDate: Date;
    maxScore: number;
    createdAt: Date;
    updatedAt: Date;
}
export type AssignmentResponse = WithStringId<Omit<Assignment, 'courseId'>> & {
    courseId: string;
};
export interface AssignmentData {
    courseId: string;
    title: string;
    description: string;
    dueDate: Date;
    maxScore: number;
}
export interface Grade {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    assignmentId: mongoose.Types.ObjectId;
    score: number;
    feedback: string;
    submittedAt: Date;
    gradedAt: Date;
}
export type GradeResponse = WithStringId<Omit<Grade, 'userId' | 'courseId' | 'assignmentId'>> & {
    userId: string;
    courseId: string;
    assignmentId: string;
};
export interface GradeData {
    userId: string;
    courseId: string;
    assignmentId: string;
    score: number;
    feedback: string;
}
export interface Message {
    _id: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    recipient: mongoose.Types.ObjectId;
    subject: string;
    content: string;
    isRead: boolean;
    createdAt: Date;
}
export type MessageResponse = WithStringId<Omit<Message, 'sender' | 'recipient'>> & {
    sender: string;
    recipient: string;
};
export interface MessageData {
    sender: string;
    recipient: string;
    subject: string;
    content: string;
}
export interface Payment {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentMethod: string;
    transactionId: string;
    createdAt: Date;
}
export type PaymentResponse = WithStringId<Omit<Payment, 'userId' | 'courseId'>> & {
    userId: string;
    courseId: string;
};
export interface PaymentData {
    userId: string;
    courseId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
}
export interface Lead {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    courseInterest: mongoose.Types.ObjectId[];
    status: 'new' | 'contacted' | 'qualified' | 'lost';
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    paymentOption?: 'full' | 'installments';
    promoCode?: string;
}
export type LeadResponse = WithStringId<Omit<Lead, 'courseInterest'>> & {
    courseInterest: string[];
};
export interface LeadData {
    name: string;
    email: string;
    phone: string;
    courseInterest: string | string[];
    status: 'new' | 'contacted' | 'qualified' | 'lost';
    notes?: string;
    paymentOption?: 'full' | 'installments';
    promoCode?: string;
}
export interface Group {
    _id: mongoose.Types.ObjectId;
    name: string;
    description: string;
    members: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
export type GroupResponse = WithStringId<Omit<Group, 'members'>> & {
    members: string[];
};
export interface GroupData {
    name: string;
    description: string;
    members: string[];
}
export interface SystemSettings {
    _id: mongoose.Types.ObjectId;
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    maxUploadSize: number;
    allowRegistration: boolean;
    maintenanceMode: boolean;
    updatedAt: Date;
}
export type SystemSettingsResponse = WithStringId<SystemSettings>;
export interface SystemSettingsData {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    maxUploadSize: number;
    allowRegistration: boolean;
    maintenanceMode: boolean;
}
export interface Permission {
    _id: mongoose.Types.ObjectId;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}
export type PermissionResponse = WithStringId<Permission>;
export interface PermissionData {
    name: string;
    description: string;
}
export interface Role {
    _id: mongoose.Types.ObjectId;
    name: string;
    description: string;
    permissions: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
export type RoleResponse = WithStringId<Omit<Role, 'permissions'>> & {
    permissions: string[];
};
export interface RoleData {
    name: string;
    description: string;
    permissions: string[];
}
export interface Discussion {
    _id: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    lessonId?: mongoose.Types.ObjectId;
    title: string;
    content: string;
    author: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    replies: DiscussionReply[];
    tags: string[];
    isPinned: boolean;
    isResolved: boolean;
}
export type DiscussionResponse = WithStringId<Omit<Discussion, 'courseId' | 'lessonId' | 'author' | 'replies'>> & {
    courseId: string;
    lessonId?: string;
    author: string;
    replies: DiscussionReplyResponse[];
};
export interface DiscussionReply {
    _id: mongoose.Types.ObjectId;
    discussionId: mongoose.Types.ObjectId;
    content: string;
    author: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    isInstructorReply: boolean;
}
export type DiscussionReplyResponse = WithStringId<Omit<DiscussionReply, 'discussionId' | 'author'>> & {
    discussionId: string;
    author: string;
};
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginatedResponse<T> extends ApiResponse<T> {
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
}
export interface LoginResponse {
    token: string;
    user: UserResponse;
}
export interface DashboardStats {
    totalUsers: number;
    activeCourses: number;
    totalRevenue: number;
    newLeads: number;
}
export interface UserManagementData {
    users: UserResponse[];
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    usersByRole: {
        [key: string]: number;
    };
    recentlyCreatedUsers: UserResponse[];
    recentlyUpdatedUsers: UserResponse[];
}
export interface CourseAnalytics {
    courseId: string;
    enrollmentCount: number;
    completionRate: number;
    averageRating: number;
    revenueGenerated: number;
    mostPopularLessons: string[];
}
export interface UserAnalytics {
    userId: string;
    coursesEnrolled: number;
    coursesCompleted: number;
    averageGrade: number;
    totalTimeSpent: number;
    learningStreak: number;
}
export interface Notification {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    type: 'course_update' | 'assignment_due' | 'grade_posted' | 'forum_reply' | 'system';
    content: string;
    isRead: boolean;
    createdAt: Date;
}
export type NotificationResponse = WithStringId<Omit<Notification, 'userId'>> & {
    userId: string;
};
export interface NotificationData {
    userId: string;
    type: 'course_update' | 'assignment_due' | 'grade_posted' | 'forum_reply' | 'system';
    content: string;
}
export interface Feedback {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
}
export type FeedbackResponse = WithStringId<Omit<Feedback, 'userId' | 'courseId'>> & {
    userId: string;
    courseId: string;
};
export interface FeedbackData {
    userId: string;
    courseId: string;
    rating: number;
    comment: string;
}
export interface ProgressTracker {
    userId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    lessonId: mongoose.Types.ObjectId;
    completedContentItems: mongoose.Types.ObjectId[];
    quizScores: {
        [quizId: string]: number;
    };
    lastAccessedAt: Date;
}
export type ProgressTrackerResponse = Omit<ProgressTracker, 'userId' | 'courseId' | 'lessonId' | 'completedContentItems'> & {
    userId: string;
    courseId: string;
    lessonId: string;
    completedContentItems: string[];
};
export interface Resource {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    type: 'pdf' | 'video' | 'link' | 'other';
    url: string;
    courseId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export type ResourceResponse = WithStringId<Omit<Resource, 'courseId'>> & {
    courseId: string;
};
export interface ResourceData {
    title: string;
    description: string;
    type: 'pdf' | 'video' | 'link' | 'other';
    url: string;
    courseId: string;
}
export interface Coupon {
    _id: mongoose.Types.ObjectId;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    validFrom: Date;
    validUntil: Date;
    maxUses: number;
    currentUses: number;
    applicableCourses: mongoose.Types.ObjectId[];
}
export type CouponResponse = WithStringId<Omit<Coupon, 'applicableCourses'>> & {
    applicableCourses: string[];
};
export interface CouponData {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    validFrom: Date;
    validUntil: Date;
    maxUses: number;
    applicableCourses: string[];
}
export interface CalendarEvent {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    allDay: boolean;
    userId: mongoose.Types.ObjectId;
    courseId?: mongoose.Types.ObjectId;
    lessonId?: mongoose.Types.ObjectId;
    type: 'course_start' | 'assignment_due' | 'live_session' | 'personal';
}
export type CalendarEventResponse = WithStringId<Omit<CalendarEvent, 'userId' | 'courseId' | 'lessonId'>> & {
    userId: string;
    courseId?: string;
    lessonId?: string;
};
export interface CalendarEventData {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    allDay: boolean;
    userId: string;
    courseId?: string;
    lessonId?: string;
    type: 'course_start' | 'assignment_due' | 'live_session' | 'personal';
}
export interface Wishlist {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    courses: mongoose.Types.ObjectId[];
}
export type WishlistResponse = WithStringId<Omit<Wishlist, 'userId' | 'courses'>> & {
    userId: string;
    courses: string[];
};
export interface WishlistData {
    userId: string;
    courses: string[];
}
export interface Cart {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    items: CartItem[];
    createdAt: Date;
    updatedAt: Date;
}
export interface CartItem {
    courseId: mongoose.Types.ObjectId;
    price: number;
}
export type CartResponse = WithStringId<Omit<Cart, 'userId' | 'items'>> & {
    userId: string;
    items: CartItemResponse[];
};
export type CartItemResponse = Omit<CartItem, 'courseId'> & {
    courseId: string;
};
export interface CartData {
    userId: string;
    items: CartItemResponse[];
}
export interface Review {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}
export type ReviewResponse = WithStringId<Omit<Review, 'userId' | 'courseId'>> & {
    userId: string;
    courseId: string;
};
export interface ReviewData {
    userId: string;
    courseId: string;
    rating: number;
    comment: string;
}
export interface Subscription {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    plan: 'basic' | 'premium' | 'enterprise';
    startDate: Date;
    endDate: Date;
    status: 'active' | 'cancelled' | 'expired';
    paymentMethod: string;
    autoRenew: boolean;
}
export type SubscriptionResponse = WithStringId<Omit<Subscription, 'userId'>> & {
    userId: string;
};
export interface SubscriptionData {
    userId: string;
    plan: 'basic' | 'premium' | 'enterprise';
    startDate: Date;
    endDate: Date;
    paymentMethod: string;
    autoRenew: boolean;
}
export {};
