import { Request, Response, NextFunction } from 'express';
export declare const getCsrfToken: (req: Request, res: Response) => void;
export declare const validateCsrfToken: (req: Request, res: Response, next: NextFunction) => void;
export declare const ensureCsrfToken: (req: Request, res: Response, next: NextFunction) => void;
declare const _default: {
    csrfProtectionMiddleware: import("express-serve-static-core").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    getCsrfToken: (req: Request, res: Response) => void;
    validateCsrfToken: (req: Request, res: Response, next: NextFunction) => void;
    ensureCsrfToken: (req: Request, res: Response, next: NextFunction) => void;
};
export default _default;
