import { Request, Response } from 'express';
export declare const getCourseContent: (req: Request, res: Response) => Promise<void>;
export declare const getCourseManagementData: (req: Request, res: Response) => Promise<void>;
export declare const createCourse: (req: Request, res: Response) => Promise<void>;
export declare const updateCourse: (req: Request, res: Response) => Promise<void>;
export declare const deleteCourse: (req: Request, res: Response) => Promise<void>;
export declare const updateCourseStructure: (req: Request, res: Response) => Promise<void>;
export declare const getInstructors: (req: Request, res: Response) => Promise<void>;
export declare const getUsersCourse: (req: Request, res: Response) => Promise<void>;
