import { Request, Response } from 'express';
export declare const getCourses: (req: Request, res: Response) => Promise<void>;
export declare const getCourseById: (req: Request, res: Response) => Promise<void>;
export declare const createCourse: (req: Request, res: Response) => Promise<void>;
export declare const updateCourse: (req: Request, res: Response) => Promise<void>;
export declare const deleteCourse: (req: Request, res: Response) => Promise<void>;
declare const _default: {
    getCourses: (req: Request, res: Response) => Promise<void>;
    getCourseById: (req: Request, res: Response) => Promise<void>;
    createCourse: (req: Request, res: Response) => Promise<void>;
    updateCourse: (req: Request, res: Response) => Promise<void>;
    deleteCourse: (req: Request, res: Response) => Promise<void>;
};
export default _default;
