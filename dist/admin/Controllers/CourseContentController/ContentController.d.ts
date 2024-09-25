import { Request, Response } from 'express';
export declare const addContent: (req: Request, res: Response) => Promise<void>;
export declare const updateContent: (req: Request, res: Response) => Promise<void>;
export declare const deleteContent: (req: Request, res: Response) => Promise<void>;
export declare const getContentItems: (req: Request, res: Response) => Promise<void>;
export declare const getCourseContent: (req: Request, res: Response) => Promise<void>;
