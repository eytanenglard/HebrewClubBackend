import { Request, Response } from 'express';
export declare const createLesson: (req: Request, res: Response) => Promise<void>;
export declare const getLesson: (req: Request, res: Response) => Promise<void>;
export declare const updateLesson: (req: Request, res: Response) => Promise<void>;
export declare const deleteLesson: (req: Request, res: Response) => Promise<void>;
export declare const getLessons: (req: Request, res: Response) => Promise<void>;
