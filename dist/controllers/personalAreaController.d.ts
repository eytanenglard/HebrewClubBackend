import { Request, Response, NextFunction } from 'express';
type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserProfile: AsyncRouteHandler;
export declare const updateUserProfile: AsyncRouteHandler;
export declare const getUserCourses: AsyncRouteHandler;
export declare const updateUserPassword: AsyncRouteHandler;
export declare const deleteUserAccount: AsyncRouteHandler;
export declare const initiatePasswordReset: AsyncRouteHandler;
export declare const getCourseDetails: AsyncRouteHandler;
declare const _default: {
    getUserProfile: AsyncRouteHandler;
    updateUserProfile: AsyncRouteHandler;
    getUserCourses: AsyncRouteHandler;
    updateUserPassword: AsyncRouteHandler;
    deleteUserAccount: AsyncRouteHandler;
    initiatePasswordReset: AsyncRouteHandler;
    getCourseDetails: AsyncRouteHandler;
};
export default _default;
