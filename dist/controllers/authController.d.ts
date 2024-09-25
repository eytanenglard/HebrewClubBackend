import { Request, Response } from 'express';
export declare const csrfTokenHandler: (req: Request, res: Response) => void;
export declare const registerUser: (req: Request, res: Response) => Promise<void>;
export declare const verifyEmail: (req: Request, res: Response) => Promise<void>;
export declare const resendVerificationEmail: (req: Request, res: Response) => Promise<void>;
export declare const loginUser: (req: Request, res: Response) => Promise<void>;
export declare const logoutUser: (req: Request, res: Response) => void;
export declare const checkAuth: (req: Request, res: Response) => Promise<void>;
export declare const verifyToken: (req: Request, res: Response) => Promise<void>;
export declare const refreshToken: (req: Request, res: Response) => Promise<void>;
export declare const getCurrentUser: (req: Request, res: Response) => Promise<void>;
export declare const forgotPassword: (req: Request, res: Response) => Promise<void>;
export declare const resetPassword: (req: Request, res: Response) => Promise<void>;
declare const _default: {
    csrfTokenHandler: (req: Request, res: Response) => void;
    registerUser: (req: Request, res: Response) => Promise<void>;
    loginUser: (req: Request, res: Response) => Promise<void>;
    logoutUser: (req: Request, res: Response) => void;
    checkAuth: (req: Request, res: Response) => Promise<void>;
    verifyToken: (req: Request, res: Response) => Promise<void>;
    refreshToken: (req: Request, res: Response) => Promise<void>;
    getCurrentUser: (req: Request, res: Response) => Promise<void>;
    forgotPassword: (req: Request, res: Response) => Promise<void>;
    resetPassword: (req: Request, res: Response) => Promise<void>;
    verifyEmail: (req: Request, res: Response) => Promise<void>;
    resendVerificationEmail: (req: Request, res: Response) => Promise<void>;
};
export default _default;
