import { Request, Response, NextFunction } from 'express';
export declare const authenticateUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const adminAuthCheck: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const testJwtSecret: () => void;
