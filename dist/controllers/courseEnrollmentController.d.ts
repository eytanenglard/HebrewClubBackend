import { Request, Response } from 'express';
export declare const enrollInCourse: (req: Request, res: Response) => Promise<void>;
export declare const getCourseEnrollment: (req: Request, res: Response) => Promise<void>;
export declare const updateCourseEnrollment: (req: Request, res: Response) => Promise<void>;
export declare const getAllCourses: (req: Request, res: Response) => Promise<void>;
export declare const getCourseDetails: (req: Request, res: Response) => Promise<void>;
export declare const associateCourseWithUser: (req: Request, res: Response) => Promise<void>;
declare const _default: {
    enrollInCourse: (req: Request, res: Response) => Promise<void>;
    getCourseEnrollment: (req: Request, res: Response) => Promise<void>;
    updateCourseEnrollment: (req: Request, res: Response) => Promise<void>;
    getAllCourses: (req: Request, res: Response) => Promise<void>;
    getCourseDetails: (req: Request, res: Response) => Promise<void>;
    associateCourseWithUser: (req: Request, res: Response) => Promise<void>;
};
export default _default;
